import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET() {
  try {
    const departments = await DatabaseService.getDepartments()
    return NextResponse.json({ departments })
  } catch (error) {
    return NextResponse.json({ departments: [] })
  }
} 