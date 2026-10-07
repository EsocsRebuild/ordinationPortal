import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateCandidateRegistration } from '@/lib/server/validators';
import { createSuccessResponse, createErrorResponse } from '@/lib/server/response';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = validateCandidateRegistration(body);

    if (!validation.isValid || !validation.sanitizedData) {
      return createErrorResponse(
        'Canonical registration validation failed.',
        validation.errors,
        422
      );
    }

    const {
      fullName,
      email,
      phone,
      gender,
      currentRank,
      targetRankName,
      currentRankYear,
      province,
      district,
      parish,
      password,
      enable2FA,
    } = validation.sanitizedData;

    // Check if an account already exists with this email
    const existing = db.users.authenticate(email);
    if (existing) {
      return createErrorResponse(
        'An ecclesiastical account or candidate dossier is already registered with this email address.',
        ['DUPLICATE_EMAIL_REGISTRATION'],
        409
      );
    }

    const { user, candidate } = db.users.register({
      fullName,
      email,
      phone: phone || '+234 800 000 0000',
      gender,
      currentRank,
      targetRankName,
      currentRankYear,
      province,
      district,
      parish,
      password,
      enable2FA,
    });

    const token = `esocs_jwt_${Buffer.from(
      JSON.stringify({
        userId: user.userId,
        role: user.role,
        email: user.email,
        candidateId: user.candidateId,
        issuedAt: Date.now(),
      })
    ).toString('base64')}`;

    return createSuccessResponse(
      {
        token,
        user,
        candidate,
      },
      'Candidate ordination application submitted and enrolled in Branch Review Queue.',
      201
    );
  } catch (error: any) {
    return createErrorResponse(
      error.message || 'An unexpected error occurred during canonical registration.',
      [error.message || 'Registration processing failure'],
      500
    );
  }
}
