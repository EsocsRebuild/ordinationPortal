import { NextRequest } from 'next/server';
import { realtimeHub } from '@/lib/server/realtimeHub';
import { createSuccessResponse } from '@/lib/server/response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const since = searchParams.get('since') || undefined;
  const events = realtimeHub.getRecentEvents(since);

  return createSuccessResponse(
    {
      events,
      count: events.length,
      serverTime: new Date().toISOString(),
    },
    'Real-time events retrieved successfully.',
    200
  );
}

