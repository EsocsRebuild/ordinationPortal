import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createSuccessResponse, createErrorResponse } from '@/lib/server/response';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, officerName, notes, action } = body;

    if (!identifier) {
      return createErrorResponse('Candidate identifier or registration QR code is required.', ['MISSING_IDENTIFIER'], 400);
    }

    const candidate = db.candidates.getById(identifier);
    if (!candidate) {
      return createErrorResponse(`No candidate record found for '${identifier}'.`, ['CANDIDATE_NOT_FOUND'], 404);
    }

    const isUndoing = action === 'undo_check_in';
    const now = new Date().toISOString();

    const updated = db.candidates.update(candidate.id, {
      isCheckedIn: !isUndoing,
      checkInTimestamp: isUndoing ? undefined : now,
      accreditedBy: isUndoing ? undefined : (officerName || 'Accreditation Marshal'),
      accreditationNotes: notes || (isUndoing ? 'Check-in cancelled' : 'Accredited and seated in chancel pew'),
    }, officerName || 'Accreditation Officer');

    db.auditLogs.add({
      performedBy: officerName || 'Accreditation Officer',
      action: isUndoing ? 'ACCREDITATION_CHECKIN_REVERSED' : 'ACCREDITATION_CHECKIN_CONFIRMED',
      candidateId: candidate.id,
      details: `${candidate.fullName} (${candidate.regNumber}) marked ${isUndoing ? 'ABSENT/PENDING' : 'PRESENT & ACCREDITED'} for rank ${candidate.targetRankName}.`,
    });

    return createSuccessResponse(
      { candidate: updated },
      isUndoing ? 'Accreditation check-in reversed.' : `Accreditation confirmed! ${candidate.fullName} is checked in.`,
      200
    );
  } catch (error: any) {
    return createErrorResponse(error.message || 'Check-in failed.', [error.message], 500);
  }
}

