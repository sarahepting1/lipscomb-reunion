import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <div>
        <h1 className="text-4xl font-semibold text-stone-900">Lipscomb Family Reunion</h1>
        <p className="mt-4 text-xl text-stone-600">Date and location: TBD — check back soon!</p>
      </div>
      <p className="text-lg leading-8 text-stone-700">
        Welcome! This site is home to the Lipscomb family directory, recipes, and reunion
        updates. Family members can log in to browse the full family tree and submit updates
        like births, deaths, marriages, and address changes.
      </p>
      <div className="flex flex-wrap gap-4">
        <Link
          href="/directory"
          className="rounded-md bg-amber-700 px-5 py-3 text-lg font-medium text-white hover:bg-amber-800"
        >
          Browse the Directory
        </Link>
        <Link
          href="/recipes"
          className="rounded-md border border-stone-300 bg-white px-5 py-3 text-lg font-medium text-stone-800 hover:bg-stone-50"
        >
          Family Recipes
        </Link>
      </div>
    </div>
  );
}
