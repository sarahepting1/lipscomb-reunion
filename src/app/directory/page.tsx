import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatYears, formatCityState } from "@/lib/format";
import { searchWords } from "@/lib/search";

type Row = {
  id: string;
  name: string;
  aka: string | null;
  birth_year: number | null;
  death_year: number | null;
  city: string | null;
  state: string | null;
};

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const search = q?.trim() ?? "";

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let rows: Row[] = [];

  const words = searchWords(search);

  if (user) {
    let query = supabase
      .from("people")
      .select("id,name,aka,birth_year,death_year,city,state")
      .order("name");
    for (const word of words) {
      query = query.or(`name.ilike.%${word}%,aka.ilike.%${word}%`);
    }
    const { data } = await query;
    rows = data ?? [];
  } else {
    let query = supabase
      .from("people_public")
      .select("id,name,aka,birth_year,death_year")
      .order("name");
    for (const word of words) {
      query = query.or(`name.ilike.%${word}%,aka.ilike.%${word}%`);
    }
    const { data } = await query;
    rows = (data ?? []).map((p) => ({ ...p, city: null, state: null }));
  }

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <h1 className="text-3xl font-semibold text-stone-900">Family Directory</h1>
      {!user && (
        <p className="mt-2 text-stone-600">
          Showing deceased family members only.{" "}
          <Link href="/login" className="font-medium text-amber-800 underline">
            Log in
          </Link>{" "}
          to see the full directory.
        </p>
      )}

      <form action="/directory" method="get" className="mt-6">
        <input
          type="search"
          name="q"
          defaultValue={search}
          placeholder="Search by name..."
          className="w-full rounded-md border border-stone-300 px-4 py-3 text-lg"
        />
      </form>

      <ul className="mt-6 divide-y divide-stone-200">
        {rows.map((p) => (
          <li key={p.id} className="py-3">
            <Link href={`/person/${p.id}`} className="block hover:bg-stone-100 -mx-2 px-2 py-1 rounded">
              <span className="text-lg font-medium text-stone-900">{p.name}</span>
              {p.aka && <span className="text-stone-500"> ({p.aka})</span>}
              <div className="text-stone-600">
                {[formatYears(p.birth_year, p.death_year), formatCityState(p.city, p.state)]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
            </Link>
          </li>
        ))}
        {rows.length === 0 && <li className="py-6 text-stone-500">No matches found.</li>}
      </ul>
    </div>
  );
}
