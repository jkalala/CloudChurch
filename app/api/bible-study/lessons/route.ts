import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"

export async function GET(request: NextRequest) {
  // List all lessons or fetch by id
  return NextResponse.json({ lessons: [] })
}
export async function POST(request: NextRequest) {
  // Create a new lesson
  return NextResponse.json({ success: true, lesson: {} })
}
export async function PATCH(request: NextRequest) {
  // Update lesson, mark complete
  return NextResponse.json({ success: true })
}
export async function DELETE(request: NextRequest) {
  // Delete a lesson
  return NextResponse.json({ success: true })
} 