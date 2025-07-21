import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"

export async function GET(request: NextRequest) {
  const supabase = createAdminClient()
  const { searchParams } = new URL(request.url)
  const memberId = searchParams.get("memberId")
  if (!memberId) return NextResponse.json({ logs: [] })
  const { data, error } = await supabase
    .from("member_audit_log")
    .select("*")
    .eq("member_id", memberId)
    .order("timestamp", { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ logs: data })
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient()
  const { pathname } = new URL(request.url)
  if (pathname.endsWith("/undo")) {
    const body = await request.json()
    const logId = body.logId
    if (!logId) return NextResponse.json({ error: "Missing logId" }, { status: 400 })
    // Fetch the log entry
    const { data: log, error } = await supabase.from("member_audit_log").select("*").eq("id", logId).single()
    if (error || !log) return NextResponse.json({ error: error?.message || "Log not found" }, { status: 404 })
    // Only allow undo for the most recent log for this member
    const { data: latest, error: latestError } = await supabase
      .from("member_audit_log")
      .select("id")
      .eq("member_id", log.member_id)
      .order("timestamp", { ascending: false })
      .limit(1)
      .single()
    if (latestError || !latest || latest.id !== logId) {
      return NextResponse.json({ error: "Only the most recent change can be undone." }, { status: 400 })
    }
    if (log.action === "edit") {
      // Revert member to previous details
      const prevDetails = log.details
      const { error: updateError } = await supabase
        .from("members")
        .update(prevDetails)
        .eq("id", log.member_id)
      if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
      return NextResponse.json({ success: true, undone: "edit" })
    } else if (log.action === "delete") {
      // Restore member from details
      const memberData = log.details
      const { error: insertError } = await supabase
        .from("members")
        .insert(memberData)
      if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })
      return NextResponse.json({ success: true, undone: "delete" })
    } else {
      return NextResponse.json({ error: "Undo not supported for this action." }, { status: 400 })
    }
  }
  return NextResponse.json({ error: "Not implemented" }, { status: 400 })
} 