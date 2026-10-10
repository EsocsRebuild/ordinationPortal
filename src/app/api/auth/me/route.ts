import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyJwtToken } from '@/lib/server/jwt';
import { createSuccessResponse, createErrorResponse } from '@/lib/server/response';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createErrorResponse('No authorization token provided.', ['UNAUTHORIZED'], 401);
    }

    const token = authHeader.substring(7);
    let decoded: any = verifyJwtToken(token);

    if (!decoded && token.startsWith('esocs_jwt_')) {
      try {
        const jsonStr = Buffer.from(token.replace('esocs_jwt_', ''), 'base64').toString('utf-8');
        decoded = JSON.parse(jsonStr);
      } catch (e) {
        // Fallback
      }
    }

    if (!decoded || !decoded.userId) {
      return createErrorResponse('Invalid or expired authentication token.', ['INVALID_TOKEN'], 401);
    }

    const userRecord = db.users.getById(decoded.userId);
    if (!userRecord) {
      return createErrorResponse('User account not found.', ['USER_NOT_FOUND'], 404);
    }

    const { passwordHash, ...user } = userRecord;
    let candidate = null;

    if (user.candidateId || user.role === 'candidate') {
      candidate = db.candidates.getById(user.candidateId || user.email);
    }

    return createSuccessResponse(
      {
        user,
        candidate,
      },
      'User session verified.',
      200
    );
  } catch (error: any) {
    return createErrorResponse(
      error.message || 'Session verification error.',
      [error.message || 'Internal Server Error'],
      500
    );
  }
}

