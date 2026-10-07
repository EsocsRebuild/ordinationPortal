import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createSuccessResponse, createErrorResponse } from '@/lib/server/response';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const province = searchParams.get('province') || undefined;
    const stage = searchParams.get('stage') || undefined;
    const tier = searchParams.get('tier') || undefined;
    const search = searchParams.get('search') || undefined;
    const email = searchParams.get('email') || undefined;

    let candidates = db.candidates.getAll({ province, stage, tier, search });

    if (email) {
      candidates = candidates.filter((c) => c.email.toLowerCase() === email.toLowerCase());
    }

    return createSuccessResponse(
      {
        candidates,
        total: candidates.length,
      },
      'Candidates retrieved successfully.',
      200
    );
  } catch (error: any) {
    return createErrorResponse(
      error.message || 'Failed to fetch candidate roster.',
      [error.message || 'Database error'],
      500
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const candidate = db.candidates.create(body);

    return createSuccessResponse(
      { candidate },
      'Candidate dossier created successfully in canonical ledger.',
      201
    );
  } catch (error: any) {
    return createErrorResponse(
      error.message || 'Failed to create candidate dossier.',
      [error.message || 'Validation error'],
      400
    );
  }
}
