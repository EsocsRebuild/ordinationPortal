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
    const emailDeliveryLog: Array<{ type: string; recipient: string; success: boolean; messageId?: string; error?: string }> = [];
    if (updates.duesStatus === 'cleared' && existing?.duesStatus !== 'cleared') {
      try {
        const mailResult = await sendPaymentReceiptEmail({
          fullName: candidate.fullName,
          email: candidate.email,
          regNumber: candidate.regNumber,
          receiptNumber: candidate.receiptNumber || `REC-2026-ESOCS-${Math.floor(1000 + Math.random() * 9000)}`,
          amountPaid: candidate.duesAmountPaid || candidate.levyBreakdown?.total || 56250,
          totalLevy: candidate.levyBreakdown?.total || 56250,
          targetRankName: candidate.targetRankName,
          paymentMethod: updates.paymentMethod || 'Zenith Bank Church Direct Remittance / Online Gateway',
        });
        emailDeliveryLog.push({ type: 'payment_receipt', recipient: candidate.email, ...mailResult });
        if (mailResult.success) {
          console.log(`[Candidates] ✅ Payment receipt email delivered to Mailpit for ${candidate.email} (ID: ${mailResult.messageId})`);
        } else {
          console.warn(`[Candidates] ⚠️ Payment receipt email could not connect to Mailpit: ${mailResult.error}`);
        }
      } catch (err: any) {
        emailDeliveryLog.push({ type: 'payment_receipt', recipient: candidate.email, success: false, error: err.message });
        console.warn('[Candidates] Failed to dispatch payment receipt email:', err.message);
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
            const approvalMail = await sendVettingApprovalEmail({
              fullName: candidate.fullName,
              email: candidate.email,
              regNumber: candidate.regNumber,
              tierName: t.label,
              approverName: approver,
              nextStageTitle: t.next,
              comments,
            });
            emailDeliveryLog.push({ type: `vetting_${t.key}`, recipient: candidate.email, ...approvalMail });
            if (approvalMail.success) {
              console.log(`[Candidates] ✅ Vetting approval email delivered to Mailpit for ${candidate.email} (ID: ${approvalMail.messageId})`);
            } else {
              console.warn(`[Candidates] ⚠️ Vetting approval email could not connect to Mailpit: ${approvalMail.error}`);
            }
          } catch (err: any) {
            emailDeliveryLog.push({ type: `vetting_${t.key}`, recipient: candidate.email, success: false, error: err.message });
            console.warn('[Candidates] Failed to dispatch vetting approval email:', err.message);
          }
        }
      }
    }

    return createSuccessResponse(
      { candidate, emailDeliveryLog },
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
