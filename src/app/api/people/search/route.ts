import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function escapeForOrFilter(value: string): string {
  return value.replace(/[,()]/g, "");
}

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

  const safe = escapeForOrFilter(q);
  const { data, error } = await supabase
    .from("people")
    .select("id,name,aka,birth_year,death_year")
    .or(`name.ilike.%${safe}%,aka.ilike.%${safe}%`)
    .order("name")
    .limit(10);

  if (error) {
    return NextResponse.json({ results: [] }, { status: 500 });
  }

  return NextResponse.json({ results: data });
}
