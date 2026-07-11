import Link from "next/link";
import { notFound } from "next/navigation";
import { recipes } from "@/data/recipes";

export default async function RecipePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const recipe = recipes.find((r) => r.slug === slug);
  if (!recipe) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <Link href="/recipes" className="text-amber-800 underline">
        &larr; Back to all recipes
      </Link>

      <h1 className="mt-4 text-3xl font-semibold text-stone-900">{recipe.title}</h1>
      <p className="mt-1 text-lg text-stone-600">
        {recipe.category} — submitted by {recipe.contributor}
      </p>

      <h2 className="mt-8 text-xl font-semibold text-stone-900">Ingredients</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-stone-700">
        {recipe.ingredients.map((ing, i) => (
          <li key={i}>{ing}</li>
        ))}
      </ul>

      <h2 className="mt-8 text-xl font-semibold text-stone-900">Instructions</h2>
      <div className="mt-2 space-y-3 text-stone-700">
        {recipe.instructions.split("\n\n").map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>

      {recipe.note && (
        <p className="mt-6 rounded-md bg-stone-100 px-4 py-3 italic text-stone-600">{recipe.note}</p>
      )}
    </div>
  );
}
