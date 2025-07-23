import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

const supabase = createAdminClient();

export async function GET(request: NextRequest) {
  const { data, error } = await supabase.from("music_musicians").select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ musicians: data });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { data, error } = await supabase.from("music_musicians").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, musician: data });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, ...updates } = body;
  const { data, error } = await supabase.from("music_musicians").update(updates).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, musician: data });
}

export async function DELETE(request: NextRequest) {
  const body = await request.json();
  const { id } = body;
  const { error } = await supabase.from("music_musicians").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
} 