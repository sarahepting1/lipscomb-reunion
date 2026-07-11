import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { searchWords } from "@/lib/search";

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ results: [] }, { status: 401 });
  }

  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  let query = supabase.from("people").select("id,name,aka,birth_year,death_year").order("name").limit(10);
  for (const word of searchWords(q)) {
    query = query.or(`name.ilike.%${word}%,aka.ilike.%${word}%`);
  }
  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ results: [] }, { status: 500 });
  }

  return NextResponse.json({ results: data });
}
