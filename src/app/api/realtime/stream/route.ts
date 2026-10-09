import { NextRequest } from 'next/server';
import { realtimeHub, RealtimeEvent } from '@/lib/server/realtimeHub';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event
      const initialPayload = JSON.stringify({
        type: 'CONNECTED',
        timestamp: new Date().toISOString(),
        recentEvents: realtimeHub.getRecentEvents(),
      });
      controller.enqueue(encoder.encode(`data: ${initialPayload}\n\n`));

      // Listener for subsequent events
      const listener = (event: RealtimeEvent) => {
        try {
          const data = JSON.stringify(event);
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch (err) {
          console.error('Error sending SSE event:', err);
        }
      };

      realtimeHub.on('event', listener);

      // Heartbeat interval to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat ${Date.now()}\n\n`));
        } catch (e) {
          clearInterval(heartbeat);
        }
      }, 15000);

      // Cleanup on disconnect
      request.signal.addEventListener('abort', () => {
        realtimeHub.off('event', listener);
        clearInterval(heartbeat);
        try {
          controller.close();
        } catch (e) {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

