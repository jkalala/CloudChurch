import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { generateAnalyticsAI } from "@/lib/ai-music-ministry";

const supabase = createAdminClient();

export async function GET(request: NextRequest) {
  const { data: songs } = await supabase.from("music_songs").select("*");
  const { data: setlists } = await supabase.from("music_setlists").select("*");
  const { data: musicians } = await supabase.from("music_musicians").select("*");
  const analytics = await generateAnalyticsAI({
    songs: songs || [],
    setlists: setlists || [],
    musicians: musicians || []
  });
  return NextResponse.json(analytics);
} 