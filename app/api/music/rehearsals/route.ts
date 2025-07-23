import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

const supabase = createAdminClient();

export async function GET(request: NextRequest) {
  const { data, error } = await supabase.from("music_rehearsals").select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rehearsals: data });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { data, error } = await supabase.from("music_rehearsals").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, rehearsal: data });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, ...updates } = body;
  const { data, error } = await supabase.from("music_rehearsals").update(updates).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, rehearsal: data });
}

export async function DELETE(request: NextRequest) {
  const body = await request.json();
  const { id } = body;
  const { error } = await supabase.from("music_rehearsals").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
} 