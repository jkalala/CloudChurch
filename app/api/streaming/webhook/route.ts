import { NextRequest, NextResponse } from "next/server";
import { updateStream, broadcast } from "@/lib/streaming-service";

export async function POST(request: NextRequest) {
  const event = await request.json();
  if (event.type && event.data && event.data.id) {
    const streamId = event.data.id;
    let status: 'live' | 'ended' | 'scheduled' = 'scheduled';
    if (event.type === 'video.live_stream.active') status = 'live';
    if (event.type === 'video.live_stream.idle') status = 'ended';
    await updateStream(streamId, { status });
    broadcast({ type: 'updated', stream: { id: streamId, status } });
  }
  return NextResponse.json({ received: true });
} 