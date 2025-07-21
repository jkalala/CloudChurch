import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)
    
    // Parse filters
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const actionTypes = searchParams.get("actionTypes")?.split(",")
    const userIds = searchParams.get("userIds")?.split(",")
    const categories = searchParams.get("categories")?.split(",")
    const format = searchParams.get("format") // csv or json
    
    // Get filtered logs using the export_audit_logs function
    const { data, error } = await supabase.rpc("export_audit_logs", {
      start_date: startDate,
      end_date: endDate,
      action_types: actionTypes,
      user_ids: userIds,
      categories: categories
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Return CSV if requested
    if (format === "csv") {
      const csv = [
        // CSV Headers
        ["Timestamp", "User", "Action", "Category", "Resource", "Details"].join(","),
        // CSV Rows
        ...data.map((log: any) => [
          new Date(log.timestamp).toISOString(),
          log.user_email,
          log.action_type,
          log.action_category,
          log.resource_id,
          `"${log.details?.replace(/"/g, '""') || ""}"` // Escape quotes in CSV
        ].join(","))
      ].join("\n")

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="audit_logs_${new Date().toISOString().split("T")[0]}.csv"`
        }
      })
    }

    // Get summary stats
    const { data: summary, error: summaryError } = await supabase
      .from("v_audit_summary")
      .select("*")
      .order("day", { ascending: false })
      .limit(30) // Last 30 days

    if (summaryError) return NextResponse.json({ error: summaryError.message }, { status: 500 })

    return NextResponse.json({
      logs: data,
      summary,
      total: data.length,
      filters: {
        startDate,
        endDate,
        actionTypes,
        userIds,
        categories
      }
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 })
  }
} 