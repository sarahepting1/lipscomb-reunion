import Link from "next/link";
import { recipes, type Recipe } from "@/data/recipes";
import { searchWords } from "@/lib/search";

const CATEGORIES: Recipe["category"][] = ["Breads, Salads & Snacks", "Meats & Veggies", "Sweets"];

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const search = q?.trim() ?? "";
  const words = searchWords(search).map((w) => w.toLowerCase());

  const filtered =
    words.length === 0
      ? recipes
      : recipes.filter((r) => {
          const haystack = `${r.title} ${r.contributor}`.toLowerCase();
          return words.every((w) => haystack.includes(w));
        });

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <h1 className="text-3xl font-semibold text-stone-900">Family Recipes</h1>
      <p className="mt-2 text-lg text-stone-600">
        {recipes.length} recipes passed down from the 1998 Lipscomb Family Reunion cookbook,{" "}
        <em>&ldquo;Love of a Family Grows Here.&rdquo;</em>
      </p>

      <form action="/recipes" method="get" className="mt-6">
        <input
          type="search"
          name="q"
          defaultValue={search}
          placeholder="Search recipes or names..."
          className="w-full rounded-md border border-stone-300 px-4 py-3 text-lg"
        />
      </form>

      {CATEGORIES.map((category) => {
        const inCategory = filtered.filter((r) => r.category === category);
        if (inCategory.length === 0) return null;
        return (
          <div key={category} className="mt-8">
            <h2 className="text-2xl font-semibold text-stone-900">{category}</h2>
            <ul className="mt-3 divide-y divide-stone-200">
              {inCategory.map((r) => (
                <li key={r.slug} className="py-2">
                  <Link
                    href={`/recipes/${r.slug}`}
                    className="block hover:bg-stone-100 -mx-2 px-2 py-1 rounded"
                  >
                    <span className="text-lg font-medium text-stone-900">{r.title}</span>
                    <span className="text-stone-500"> — {r.contributor}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      {filtered.length === 0 && <p className="mt-8 text-stone-500">No recipes found.</p>}
    </div>
  );
}
