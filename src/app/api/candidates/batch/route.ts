import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { VettingTier } from '@/types';
import { validateBatchActionInput } from '@/lib/server/validators';
import { createSuccessResponse, createErrorResponse } from '@/lib/server/response';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = validateBatchActionInput(body);

    if (!validation.isValid || !validation.sanitizedData) {
      return createErrorResponse('Batch operation validation failed.', validation.errors, 400);
    }

    const { action, candidateIds } = validation.sanitizedData;
    const { targetTier, approverName, approverRole } = body;

    const updatedCandidates = [];
    const dateStr = new Date().toISOString().split('T')[0];

    if (action === 'advance_tier' && targetTier) {
      for (const id of candidateIds) {
        const cand = db.candidates.getById(id);
        if (!cand) continue;

        let nextStage = cand.stage;
        if (targetTier === 'district') nextStage = 'branch_approved';
        else if (targetTier === 'province') nextStage = 'district_approved';
        else if (targetTier === 'screening_exam' || targetTier === 'cmc') nextStage = 'province_approved';
        else if (targetTier === 'national') nextStage = 'cmc_approved';

        const updated = db.candidates.update(id, {
          stage: nextStage,
          currentVettingTier: targetTier as VettingTier,
          tierApprovals: {
            ...(cand.tierApprovals || {}),
            [cand.currentVettingTier]: {
              approved: true,
              approverName: approverName || 'Apex Directorate Admin',
              approverRole: approverRole || 'Super Admin',
              date: dateStr,
              comments: `Batch approved and forwarded to ${targetTier.toUpperCase()} level.`,
            },
          },
        }, approverName || 'Super Admin');
        if (updated) updatedCandidates.push(updated);
      }
    } else if (action === 'clear_dues') {
      for (const id of candidateIds) {
        const cand = db.candidates.getById(id);
        if (!cand) continue;
        const total = cand.levyBreakdown?.total || 80000;
        const updated = db.candidates.update(id, {
          duesStatus: 'cleared',
          duesAmountPaid: total,
          receiptNumber: `REC-2026-ESOCS-${Math.floor(1000 + Math.random() * 9000)}`,
        }, approverName || 'Treasury Officer');
        if (updated) updatedCandidates.push(updated);
      }
    } else if (action === 'generate_certs') {
      for (const id of candidateIds) {
        const cand = db.candidates.getById(id);
        if (!cand) continue;
        const certNo = cand.certificateNumber || `CERT-2026-${cand.targetRankId.replace('rank_', '').toUpperCase()}-${cand.regNumber.split('/').pop()}`;
        const updated = db.candidates.update(id, {
          certificateNumber: certNo,
          stage: cand.stage === 'board_approved' || cand.stage === 'investiture_assigned' ? 'investiture_assigned' : cand.stage,
        }, approverName || 'Secretariat Registrar');
        if (updated) updatedCandidates.push(updated);
      }
    }

    db.auditLogs.add({
      performedBy: approverName || 'Super Admin',
      action: `BATCH_${action.toUpperCase()}`,
      details: `Batch action "${action}" executed on ${updatedCandidates.length} candidate(s).`,
    });

    return createSuccessResponse(
      {
        count: updatedCandidates.length,
        candidates: updatedCandidates,
      },
      `Batch operation "${action}" successfully applied to ${updatedCandidates.length} candidate(s).`,
      200
    );
  } catch (error: any) {
    return createErrorResponse(
      error.message || 'Batch operation failed.',
      [error.message || 'Batch processing exception'],
      500
    );
  }
}
