import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { recommendSongsAI } from "@/lib/ai-music-ministry";

const supabase = createAdminClient();

export async function POST(request: NextRequest) {
  const criteria = await request.json();
  const { data: songs, error } = await supabase.from("music_songs").select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const recommended = await recommendSongsAI(songs, criteria);
  return NextResponse.json({ songs: recommended });
} 