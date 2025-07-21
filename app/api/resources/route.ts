import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"

// In-memory resource store (replace with DB/storage in production)
let resources: any[] = [
  { id: "1", type: "sermon", title: "Faith Over Fear", file: "faith-over-fear.pdf", date: "2024-05-01", speaker: "Pastor John" },
  { id: "2", type: "media", title: "Worship Night 2024", file: "worship-night.mp4", mediaType: "video" },
  { id: "3", type: "document", title: "Church Bulletin May", file: "bulletin-may.pdf" },
]

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") // Current user's ID
    
    // Base query with sharing conditions
    let query = supabase.from("resources").select("*").or(`is_public.eq.true,shared_with.cs.{${userId}}`).order("created_at", { ascending: false })
    
    // Apply additional filters if present
    const type = searchParams.get("type")
    if (type) query = query.eq("type", type)
    
    const tag = searchParams.get("tag")
    if (tag) query = query.contains("tags", [tag])

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch resources" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient()
  const formData = await request.formData()
  const file = formData.get("file") as File
  const title = formData.get("title") as string
  const type = formData.get("type") as string
  const resourceId = formData.get("resourceId") as string | undefined
  const uploadedBy = formData.get("uploadedBy") as string | undefined
  const changeNote = formData.get("changeNote") as string | undefined
  if (!file || !title || !type) {
    return NextResponse.json({ error: "Missing file, title, or type" }, { status: 400 })
  }
  // Upload file to Supabase Storage
  const fileExt = file.name.split(".").pop()
  const fileName = `${Date.now()}-${title.replace(/\s+/g, "-")}.${fileExt}`
  const arrayBuffer = await file.arrayBuffer()
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("resources")
    .upload(fileName, Buffer.from(arrayBuffer), { contentType: file.type })
  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }
  // Get public URL
  const { data: publicUrlData } = supabase.storage.from("resources").getPublicUrl(fileName)
  const file_url = publicUrlData?.publicUrl

  let resourceRow
  if (resourceId) {
    // Existing resource: add new version
    // Get current max version number
    const { data: versions, error: versionError } = await supabase
      .from("resource_versions")
      .select("version_number")
      .eq("resource_id", resourceId)
      .order("version_number", { ascending: false })
      .limit(1)
    if (versionError) return NextResponse.json({ error: versionError.message }, { status: 500 })
    const nextVersion = (versions?.[0]?.version_number || 0) + 1
    // Insert new version
    const { data: versionData, error: versionInsertError } = await supabase
      .from("resource_versions")
      .insert({
        resource_id: resourceId,
        file_url,
        uploaded_by: uploadedBy,
        uploaded_at: new Date().toISOString(),
        version_number: nextVersion,
        change_note: changeNote,
      })
      .select()
      .single()
    if (versionInsertError) return NextResponse.json({ error: versionInsertError.message }, { status: 500 })
    resourceRow = versionData
    await supabase.from("resource_audit_log").insert({
      resource_id: resourceId,
      action: changeNote?.toLowerCase().includes('restore') ? 'restore' : 'version',
      user_id: uploadedBy,
      user_email: uploadedBy,
      details: changeNote || '',
    })
  } else {
    // New resource: insert into resources and resource_versions
    const { data: resource, error: insertError } = await supabase
      .from("resources")
      .insert({ title, type, file_url })
      .select()
      .single()
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }
    // Insert first version
    const { data: versionData, error: versionInsertError } = await supabase
      .from("resource_versions")
      .insert({
        resource_id: resource.id,
        file_url,
        uploaded_by: uploadedBy,
        uploaded_at: new Date().toISOString(),
        version_number: 1,
        change_note: changeNote,
      })
      .select()
      .single()
    if (versionInsertError) return NextResponse.json({ error: versionInsertError.message }, { status: 500 })
    resourceRow = { ...resource, version: versionData }
    await supabase.from("resource_audit_log").insert({
      resource_id: resource.id,
      action: 'upload',
      user_id: uploadedBy,
      user_email: uploadedBy,
      details: changeNote || '',
    })
  }
  return NextResponse.json(resourceRow, { status: 201 })
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()
    const { resourceId, action, tag, shared_with, is_public, permissions } = body

    if (action === "share") {
      const { data, error } = await supabase
        .from("resources")
        .update({ shared_with, is_public, permissions })
        .eq("id", resourceId)
        .select()
        .single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, data })
    } else if (action === "addTag" || action === "removeTag") {
      if (!resourceId || !tag) return NextResponse.json({ error: "Missing resourceId or tag" }, { status: 400 })
      const { data, error } = await supabase.rpc(
        action === "addTag" ? "add_tag_to_resource" : "remove_tag_from_resource",
        { resource_id: resourceId, tag_value: tag }
      )
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, data })
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update resource" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = createAdminClient()
  const { id } = await request.json()
  // Optionally: delete file from storage as well
  const { data: resource } = await supabase.from("resources").select("*").eq("id", id).single()
  if (resource?.file_url) {
    const filePath = resource.file_url.split("/resources/")[1]
    if (filePath) {
      await supabase.storage.from("resources").remove([filePath])
    }
  }
  await supabase.from("resources").delete().eq("id", id)
  return NextResponse.json({ success: true })
} 