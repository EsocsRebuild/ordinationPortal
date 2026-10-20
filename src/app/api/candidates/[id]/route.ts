import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createSuccessResponse, createErrorResponse } from '@/lib/server/response';
import { sendPaymentReceiptEmail, sendVettingApprovalEmail } from '@/lib/server/email';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const candidate = db.candidates.getById(id);

    if (!candidate) {
      return createErrorResponse(
        `No candidate found with identifier '${id}'.`,
        ['CANDIDATE_NOT_FOUND'],
        404
      );
    }

    return createSuccessResponse(
      { candidate },
      'Candidate profile retrieved successfully.',
      200
    );
  } catch (error: any) {
    return createErrorResponse(
      error.message || 'Error fetching candidate record.',
      [error.message || 'Server error'],
      500
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await request.json();

    const existing = db.candidates.getById(id);
    const candidate = db.candidates.update(id, updates, updates.actorName || 'Portal Official');
    if (!candidate) {
      return createErrorResponse(
        `Candidate with identifier '${id}' not found for update.`,
        ['CANDIDATE_NOT_FOUND'],
        404
      );
    }

    // 1. Dispatch Payment Receipt Email to Mailpit if dues were newly cleared
    if (updates.duesStatus === 'cleared' && existing?.duesStatus !== 'cleared') {
      try {
        await sendPaymentReceiptEmail({
          fullName: candidate.fullName,
          email: candidate.email,
          regNumber: candidate.regNumber,
          receiptNumber: candidate.receiptNumber || `REC-2026-ESOCS-${Math.floor(1000 + Math.random() * 9000)}`,
          amountPaid: candidate.duesAmountPaid || candidate.levyBreakdown?.total || 56250,
          totalLevy: candidate.levyBreakdown?.total || 56250,
          targetRankName: candidate.targetRankName,
          paymentMethod: updates.paymentMethod || 'Zenith Bank Church Direct Remittance / Online Gateway',
        });
      } catch (err) {
        console.warn('[Candidates] Failed to dispatch payment receipt email:', err);
      }
    }

    // 2. Dispatch Vetting Tier Approval Notification to Mailpit
    if (updates.tierApprovals) {
      const tiers = [
        { key: 'branch', label: 'Parish Review', next: 'Stage 2: District Council Review' },
        { key: 'district', label: 'District Review', next: 'Stage 3: Provincial Office Clearance' },
        { key: 'province', label: 'Province Clearance', next: 'Stage 4: Candidate Screening & Examination' },
        { key: 'cmc', label: 'Screening & Examination', next: 'Stage 5: National Council Final Approval' },
        { key: 'national', label: 'National Council Approval', next: 'Stage 6: Official Ordination & Investiture' },
      ];
      for (const t of tiers) {
        const newlyApproved = (updates.tierApprovals as any)[t.key]?.approved;
        const previouslyApproved = (existing?.tierApprovals as any)?.[t.key]?.approved;
        if (newlyApproved && !previouslyApproved) {
          const approver = (updates.tierApprovals as any)[t.key]?.approverName || 'Ordination Review Board';
          const comments = (updates.tierApprovals as any)[t.key]?.comments;
          try {
            await sendVettingApprovalEmail({
              fullName: candidate.fullName,
              email: candidate.email,
              regNumber: candidate.regNumber,
              tierName: t.label,
              approverName: approver,
              nextStageTitle: t.next,
              comments,
            });
          } catch (err) {
            console.warn('[Candidates] Failed to dispatch vetting approval email:', err);
          }
        }
      }
    }

    return createSuccessResponse(
      { candidate },
      'Candidate profile updated successfully.',
      200
    );
  } catch (error: any) {
    return createErrorResponse(
      error.message || 'Failed to update candidate profile.',
      [error.message || 'Update processing error'],
      400
    );
  }
}
