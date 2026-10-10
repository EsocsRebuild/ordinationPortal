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
        `No candidate found with ecclesiastical identifier '${id}'.`,
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

    const candidate = db.candidates.update(id, updates, updates.actorName || 'Portal Official');
    if (!candidate) {
      return createErrorResponse(
        `Candidate with identifier '${id}' not found for update.`,
        ['CANDIDATE_NOT_FOUND'],
        404
      );
    }

    return createSuccessResponse(
      { candidate },
      'Candidate profile updated successfully in canonical ledger.',
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
