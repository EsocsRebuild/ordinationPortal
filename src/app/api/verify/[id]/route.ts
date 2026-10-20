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
        `No official ordination credential found matching '${id}'.`,
        ['RECORD_NOT_FOUND'],
        404
      );
    }

    const isOfficiallyApproved = ['board_approved', 'investiture_assigned', 'ordained'].includes(candidate.stage);

    const publicVerificationRecord = {
      id: candidate.id,
      regNumber: candidate.regNumber,
      fullName: candidate.fullName,
      currentRank: candidate.currentRank,
      targetRankName: candidate.targetRankName,
      province: candidate.province,
      district: candidate.district,
      parish: candidate.parish,
      duesStatus: candidate.duesStatus,
      stage: candidate.stage,
      certificateNumber: candidate.certificateNumber || null,
      verificationHash: candidate.verificationHash || null,
      investitureSession: candidate.investitureSession || (isOfficiallyApproved ? 'General Conference 2026' : null),
      seatNumber: candidate.seatNumber || null,
      isValid: isOfficiallyApproved,
      verificationDate: new Date().toISOString(),
      institution: 'Eternal Sacred Order of the Cherubim and Seraphim Worldwide',
      authority: 'The Holy Synod & General Conference Secretariat',
    };

    return createSuccessResponse(
      publicVerificationRecord,
      'Official record verified against the Church Ordination Register.',
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

