import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"

export async function GET(request: NextRequest) {
  const supabase = createAdminClient()
  const { searchParams } = new URL(request.url)
  const memberId = searchParams.get("memberId")
  if (memberId) {
    // Get all custom fields and values for this member
    const { data, error } = await supabase
      .from("member_custom_fields")
      .select("field_id, value, custom_fields:field_id(name, field_type, options)")
      .eq("member_id", memberId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ fields: data })
  } else {
    // Get all custom fields
    const { data, error } = await supabase.from("custom_fields").select("*")
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ customFields: data })
  }
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient()
  const body = await request.json()
  const { memberId, fieldId, value } = body
  if (!memberId || !fieldId) return NextResponse.json({ error: "Missing memberId or fieldId" }, { status: 400 })
  // Upsert value
  const { data, error } = await supabase.from("member_custom_fields").upsert({
    member_id: memberId,
    field_id: fieldId,
    value
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ field: data })
}

export async function DELETE(request: NextRequest) {
  const supabase = createAdminClient()
  const { searchParams } = new URL(request.url)
  const memberId = searchParams.get("memberId")
  const fieldId = searchParams.get("fieldId")
  if (!memberId || !fieldId) return NextResponse.json({ error: "Missing memberId or fieldId" }, { status: 400 })
  const { error } = await supabase.from("member_custom_fields").delete().eq("member_id", memberId).eq("field_id", fieldId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
} 