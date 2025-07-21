import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"

export async function GET(request: NextRequest) {
  // Fetch progress
  return NextResponse.json({ progress: {} })
}
export async function POST(request: NextRequest) {
  // Create progress
  return NextResponse.json({ success: true, progress: {} })
}
export async function PATCH(request: NextRequest) {
  // Update progress
  return NextResponse.json({ success: true })
}
export async function DELETE(request: NextRequest) {
  // Reset progress
  return NextResponse.json({ success: true })
} 