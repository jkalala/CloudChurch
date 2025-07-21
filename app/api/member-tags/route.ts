import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"

export async function GET(request: NextRequest) {
  const supabase = createAdminClient()
  const { searchParams } = new URL(request.url)
  const memberId = searchParams.get("memberId")
  if (memberId) {
    const { data, error } = await supabase.from("member_tags").select("tag").eq("member_id", memberId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ tags: data.map((t: any) => t.tag) })
  } else {
    // Get all unique tags
    const { data, error } = await supabase.rpc("get_all_member_tags")
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ tags: data })
  }
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient()
  const body = await request.json()
  const { memberId, tag } = body
  if (!memberId || !tag) return NextResponse.json({ error: "Missing memberId or tag" }, { status: 400 })
  const { data, error } = await supabase.from("member_tags").insert({ member_id: memberId, tag }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ tag: data })
}

export async function DELETE(request: NextRequest) {
  const supabase = createAdminClient()
  const { searchParams } = new URL(request.url)
  const memberId = searchParams.get("memberId")
  const tag = searchParams.get("tag")
  if (!memberId || !tag) return NextResponse.json({ error: "Missing memberId or tag" }, { status: 400 })
  const { error } = await supabase.from("member_tags").delete().eq("member_id", memberId).eq("tag", tag)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
} 