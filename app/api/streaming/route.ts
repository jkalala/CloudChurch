import { type NextRequest, NextResponse } from "next/server"
import { listStreams, createStream } from '@/lib/streaming-service';

export async function GET() {
  try {
    const streams = await listStreams();
    // Optionally, add analytics aggregation here
    return NextResponse.json({ streams });
  } catch (error) {
    console.error("Error fetching streaming data:", error)
    return NextResponse.json({ error: "Failed to fetch streaming data" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const streamConfig = await request.json()
    const newStream = await createStream(streamConfig);
    return NextResponse.json(newStream, { status: 201 })
  } catch (error) {
    console.error("Error creating stream:", error)
    return NextResponse.json({ error: "Failed to create stream" }, { status: 500 })
  }
}
