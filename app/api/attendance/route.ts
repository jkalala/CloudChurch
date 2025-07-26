import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const attendanceData = await request.json()
    const newAttendance = await DatabaseService.recordAttendance(attendanceData)
    return NextResponse.json(newAttendance, { status: 201 })
  } catch (error) {
    console.error("Error recording attendance:", error)
    return NextResponse.json({ error: "Failed to record attendance" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('member_id')
    
    if (memberId) {
      // Get attendance records for a specific member
      const records = await DatabaseService.getAttendanceRecordsByMember(memberId)
      return NextResponse.json({ records })
    } else {
      // Get general attendance stats
      const stats = await DatabaseService.getAttendanceStats()
      return NextResponse.json(stats)
    }
  } catch (error) {
    console.error("Error fetching attendance data:", error)
    return NextResponse.json({ error: "Failed to fetch attendance data" }, { status: 500 })
  }
}
