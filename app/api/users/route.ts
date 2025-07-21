import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { data: users, error } = await supabase
      .from("user_profiles")
      .select("user_id, email, first_name, last_name")
      .order("first_name", { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    
    // Format users for display
    const formattedUsers = users.map(user => ({
      id: user.user_id,
      email: user.email,
      name: user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email
    }))

    return NextResponse.json(formattedUsers)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
} 