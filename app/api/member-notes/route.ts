import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"

export async function GET(request: NextRequest) {
  const supabase = createAdminClient()
  const { searchParams } = new URL(request.url)
  const memberId = searchParams.get("memberId")
  if (!memberId) return NextResponse.json({ notes: [] })
  const { data, error } = await supabase
    .from("member_notes")
    .select("*")
    .eq("member_id", memberId)
    .order("created_at", { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ notes: data })
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient()
  const body = await request.json()
  const { memberId, content } = body
  if (!memberId || !content) return NextResponse.json({ error: "Missing memberId or content" }, { status: 400 })
  const { data, error } = await supabase
    .from("member_notes")
    .insert({ member_id: memberId, content, author: 'You' })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ note: data })
}

export async function DELETE(request: NextRequest) {
  const supabase = createAdminClient()
  const { searchParams } = new URL(request.url)
  const noteId = searchParams.get("noteId")
  if (!noteId) return NextResponse.json({ error: "Missing noteId" }, { status: 400 })
  const { error } = await supabase.from("member_notes").delete().eq("id", noteId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
} 