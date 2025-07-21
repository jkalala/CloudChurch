import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase-client"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const streamId = searchParams.get("streamId")
    let query = supabase.from("chat_messages").select("*").order("timestamp", { ascending: true })
    if (streamId) query = query.eq("stream_id", streamId)
    const { data: chatMessages, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const reactions = searchParams.get("reactions")
    if (reactions) {
      // Return all reactions for the stream
      const supabase = createServerClient()
      let query = supabase.from("chat_messages").select("id,reactions")
      if (streamId) query = query.eq("stream_id", streamId)
      const { data, error } = await query
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      const result: Record<string, Record<string, string[]>> = {}
      for (const msg of data) {
        result[msg.id] = msg.reactions || {}
      }
      return NextResponse.json({ reactions: result })
    }
    return NextResponse.json({ messages: chatMessages })
  } catch (error) {
    console.error("Error fetching chat messages:", error)
    return NextResponse.json({ error: "Failed to fetch chat messages" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get("messageId")
    const emoji = searchParams.get("emoji")
    if (messageId && emoji) {
      // Toggle reaction for this user
      const supabase = createServerClient()
      // For demo, use user id from header or random
      const userId = request.headers.get("x-user-id") || Math.random().toString(36).slice(2)
      // Fetch current reactions
      const { data: msg, error } = await supabase.from("chat_messages").select("reactions").eq("id", messageId).single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      let reactions = msg?.reactions || {}
      if (!reactions[emoji]) reactions[emoji] = []
      if (reactions[emoji].includes(userId)) {
        reactions[emoji] = reactions[emoji].filter((id: string) => id !== userId)
      } else {
        reactions[emoji].push(userId)
      }
      await supabase.from("chat_messages").update({ reactions }).eq("id", messageId)
      return NextResponse.json({ success: true })
    }
    const supabase = createServerClient()
    const messageData = await request.json()
    const { data, error } = await supabase.from("chat_messages").insert({
      stream_id: messageData.stream_id,
      user_id: messageData.user_id,
      user_name: messageData.user_name,
      message: messageData.message,
      type: messageData.type || "message",
      timestamp: new Date().toISOString(),
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error sending chat message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get("messageId")
    if (!messageId) return NextResponse.json({ error: "Missing messageId" }, { status: 400 })
    // In production, check if user is admin
    const { error } = await supabase.from("chat_messages").delete().eq("id", messageId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting chat message:", error)
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get("messageId")
    const pin = searchParams.get("pin")
    if (!messageId || pin === null) return NextResponse.json({ error: "Missing messageId or pin" }, { status: 400 })
    const { error } = await supabase.from("chat_messages").update({ pinned: pin === "1" }).eq("id", messageId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error pinning chat message:", error)
    return NextResponse.json({ error: "Failed to pin/unpin message" }, { status: 500 })
  }
}
