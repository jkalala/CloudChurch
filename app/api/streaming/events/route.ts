export const dynamic = 'force-dynamic';
import { NextRequest } from "next/server";
import { getStreamEvents } from '@/lib/streaming-service';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const send = (event: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };
      const unsubscribe = getStreamEvents(send);
      request.signal.addEventListener("abort", unsubscribe);
    }
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    }
  });
} 