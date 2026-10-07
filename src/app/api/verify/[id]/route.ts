import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createSuccessResponse, createErrorResponse } from '@/lib/server/response';

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
        `No canonical ordination credential found matching '${id}'.`,
        ['RECORD_NOT_FOUND'],
        404
      );
    }

    const isOfficiallyApproved = ['board_approved', 'investiture_assigned', 'ordained'].includes(candidate.stage);

    const publicVerificationRecord = {
      regNumber: candidate.regNumber,
      fullName: candidate.fullName,
      targetRankName: candidate.targetRankName,
      province: candidate.province,
      parish: candidate.parish,
      duesStatus: candidate.duesStatus,
      stage: candidate.stage,
      certificateNumber: candidate.certificateNumber || null,
      verificationHash: candidate.verificationHash || null,
      investitureSession: candidate.investitureSession || 'To Be Announced',
      seatNumber: candidate.seatNumber || 'Pending Allocation',
      isValid: isOfficiallyApproved,
      verificationDate: new Date().toISOString(),
      institution: 'Eternal Sacred Order of the Cherubim and Seraphim Worldwide',
      apexAuthority: 'The Holy Synod & General Conference Secretariat',
    };

    return createSuccessResponse(
      publicVerificationRecord,
      'Canonical record verified against the Holy Order Sovereign Ledger.',
      200
    );
  } catch (error: any) {
    return createErrorResponse(
      error.message || 'Public verification service failure.',
      [error.message || 'Verification error'],
      500
    );
  }
}

