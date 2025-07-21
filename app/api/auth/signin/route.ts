import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-client";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  const supabase = createServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    return NextResponse.json({ error: error?.message || "Authentication failed" }, { status: 401 });
  }

  // Set the access token cookie
  const response = NextResponse.json({
    success: true,
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    },
  });
  response.cookies.set("sb-access-token", data.session.access_token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
  return response;
} 