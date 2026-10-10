import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createJwtToken } from '@/lib/server/jwt';
import { validateLoginInput } from '@/lib/server/validators';
import { createSuccessResponse, createErrorResponse } from '@/lib/server/response';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = validateLoginInput(body);

    if (!validation.isValid || !validation.sanitizedData) {
      return createErrorResponse('Validation error', validation.errors, 400);
    }

    const { identifier, password } = validation.sanitizedData;
    const authResult = db.users.authenticate(identifier, password);

    if (!authResult) {
      return createErrorResponse(
        'Authentication failed. Invalid ecclesiastical identifier, email, or access password.',
        ['Invalid credentials provided.'],
        401
      );
    }

    const { candidate, ...user } = authResult;

    // Generate authenticated session token in standard JWS compact format
    const token = createJwtToken({
      userId: user.userId,
      role: user.role,
      email: user.email,
      name: user.name,
      candidateId: user.candidateId,
    });

    db.auditLogs.add({
      performedBy: user.name,
      action: 'USER_LOGIN',
      candidateId: user.candidateId,
      details: `Successful login by ${user.role} (${user.email}).`,
    });

    return createSuccessResponse(
      {
        token,
        user,
        candidate,
      },
      'Ecclesiastical credentials verified successfully.',
      200
    );
  } catch (error: any) {
    return createErrorResponse(
      error.message || 'Canonical authentication service encounter an internal error.',
      [error.message || 'Internal Server Error'],
      500
    );
  }
}
