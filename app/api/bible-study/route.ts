import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"

// --- Studies ---
export async function GET(request: NextRequest) {
  // List all studies or fetch by id
  return NextResponse.json({ studies: [] })
}
export async function POST(request: NextRequest) {
  // Create a new study
  return NextResponse.json({ success: true, study: {} })
}
export async function PATCH(request: NextRequest) {
  // Update a study
  return NextResponse.json({ success: true })
}
export async function DELETE(request: NextRequest) {
  // Delete a study
  return NextResponse.json({ success: true })
}
// --- Groups ---
// ... similar stubs for groups, lessons, discussions, progress ... 