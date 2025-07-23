import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { scheduleMusiciansAI } from "@/lib/ai-music-ministry";

const supabase = createAdminClient();

export async function POST(request: NextRequest) {
  const { setListId, date, requiredInstruments } = await request.json();
  const { data: musicians, error } = await supabase.from("music_musicians").select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const result = await scheduleMusiciansAI(musicians, setListId, date, requiredInstruments);
  return NextResponse.json(result);
} 