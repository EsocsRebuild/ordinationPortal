import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createSuccessResponse, createErrorResponse } from '@/lib/server/response';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const ranks = db.ranks.get();
    return createSuccessResponse(
      {
        ranks,
        totalRanks: ranks.length,
      },
      'Ecclesiastical ranks retrieved successfully.',
      200
    );
  } catch (error: any) {
    return createErrorResponse(
      error.message || 'Failed to fetch ranks.',
      [error.message || 'Database error'],
      500
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, ranks, rankId, rank, performedBy } = body;

    if (action === 'save_all' && Array.isArray(ranks)) {
      const saved = db.ranks.saveAll(ranks, performedBy || 'Admin Directorate');
      return createSuccessResponse({ ranks: saved }, 'Ecclesiastical ranks saved successfully.', 200);
    }

    if (action === 'update_rank' && rankId && rank) {
      const updated = db.ranks.updateRank(rankId, rank, performedBy || 'Admin Directorate');
      return createSuccessResponse({ ranks: updated }, 'Rank updated successfully.', 200);
    }

    return createErrorResponse('Invalid action specified', ['Unknown action'], 400);
  } catch (error: any) {
    return createErrorResponse(
      error.message || 'Failed to process rank update.',
      [error.message || 'Server error'],
      500
    );
  }
}

