import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"

export async function GET(request: NextRequest) {
  const supabase = createAdminClient()
  const { searchParams } = new URL(request.url)
  const memberId = searchParams.get("memberId")
  if (!memberId) return NextResponse.json({ attachments: [] })
  const { data, error } = await supabase
    .from("member_attachments")
    .select("*")
    .eq("member_id", memberId)
    .order("uploaded_at", { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ attachments: data })
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient()
  const formData = await request.formData()
  const memberId = formData.get("memberId") as string
  const file = formData.get("file") as File
  if (!memberId || !file) return NextResponse.json({ error: "Missing memberId or file" }, { status: 400 })
  // Upload to Supabase Storage
  const filePath = `member-attachments/${memberId}/${Date.now()}-${file.name}`
  const { data: storageData, error: storageError } = await supabase.storage.from("attachments").upload(filePath, file, { upsert: false })
  if (storageError) return NextResponse.json({ error: storageError.message }, { status: 500 })
  const fileUrl = supabase.storage.from("attachments").getPublicUrl(filePath).data.publicUrl
  // Insert metadata
  const { data, error } = await supabase.from("member_attachments").insert({
    member_id: memberId,
    file_url: fileUrl,
    file_name: file.name,
    file_type: file.type,
    file_size: file.size,
    uploaded_by: "You"
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ attachment: data })
}

export async function DELETE(request: NextRequest) {
  const supabase = createAdminClient()
  const { searchParams } = new URL(request.url)
  const attachmentId = searchParams.get("attachmentId")
  if (!attachmentId) return NextResponse.json({ error: "Missing attachmentId" }, { status: 400 })
  // Get file path
  const { data: attachment, error: fetchError } = await supabase.from("member_attachments").select("file_url, member_id, file_name").eq("id", attachmentId).single()
  if (fetchError || !attachment) return NextResponse.json({ error: fetchError?.message || "Attachment not found" }, { status: 404 })
  // Remove from storage (optional, if public URL contains path)
  const filePath = attachment.file_url.split("/storage/v1/object/public/attachments/")[1]
  if (filePath) {
    await supabase.storage.from("attachments").remove([filePath])
  }
  // Remove metadata
  const { error } = await supabase.from("member_attachments").delete().eq("id", attachmentId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
} 