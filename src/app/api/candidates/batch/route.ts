import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { VettingTier } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, candidateIds, targetTier, approverName, approverRole } = body;

    if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
      return NextResponse.json({ success: false, message: 'No candidates selected for batch action' }, { status: 400 });
    }

    const updatedCandidates = [];
    const dateStr = new Date().toISOString().split('T')[0];

    if (action === 'advance_tier' && targetTier) {
      for (const id of candidateIds) {
        const cand = db.candidates.getById(id);
        if (!cand) continue;

        let nextStage = cand.stage;
        if (targetTier === 'district') nextStage = 'branch_approved';
        else if (targetTier === 'province') nextStage = 'district_approved';
        else if (targetTier === 'cmc') nextStage = 'province_approved';
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
        });
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
        });
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
        });
        if (updated) updatedCandidates.push(updated);
      }
    }

    return NextResponse.json({
      success: true,
      count: updatedCandidates.length,
      candidates: updatedCandidates,
      message: `Batch operation "${action}" successfully applied to ${updatedCandidates.length} candidate(s).`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

