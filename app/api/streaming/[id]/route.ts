import { type NextRequest, NextResponse } from "next/server"
import { getStream, updateStream, deleteStream as deleteStreamService } from '@/lib/streaming-service';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const streamId = params.id
    const streamData = await getStream(streamId);
    if (!streamData) return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    return NextResponse.json(streamData)
  } catch (error) {
    console.error("Error fetching stream:", error)
    return NextResponse.json({ error: "Failed to fetch stream" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const streamId = params.id
    const updates = await request.json()
    const updatedStream = await updateStream(streamId, updates);
    return NextResponse.json(updatedStream)
  } catch (error) {
    console.error("Error updating stream:", error)
    return NextResponse.json({ error: "Failed to update stream" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const streamId = params.id
    await deleteStreamService(streamId);
    return NextResponse.json({ message: "Stream deleted successfully" })
  } catch (error) {
    console.error("Error deleting stream:", error)
    return NextResponse.json({ error: "Failed to delete stream" }, { status: 500 })
  }
}
