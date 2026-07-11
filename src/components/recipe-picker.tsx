"use client";

import { useMemo, useState } from "react";
import { recipeIndex } from "@/data/recipes";

export function RecipePicker({
  fieldName,
  label,
  initialSlug,
}: {
  fieldName: string;
  label: string;
  initialSlug?: string;
}) {
  const initial = initialSlug ? recipeIndex.find((r) => r.slug === initialSlug) ?? null : null;
  const [term, setTerm] = useState("");
  const [selected, setSelected] = useState<(typeof recipeIndex)[number] | null>(initial);

  const results = useMemo(() => {
    const q = term.trim().toLowerCase();
    if (selected || q.length < 2) return [];
    return recipeIndex.filter((r) => r.title.toLowerCase().includes(q)).slice(0, 10);
  }, [term, selected]);

  return (
    <div className="flex flex-col gap-1" data-testid={`recipe-picker-${fieldName}`}>
      <span className="text-sm font-medium text-stone-700">{label}</span>

      <input type="hidden" name={`${fieldName}_slug`} value={selected?.slug ?? ""} />
      <input type="hidden" name={`${fieldName}_title`} value={selected?.title ?? ""} />

      {selected ? (
        <div className="flex items-center justify-between rounded-md border border-stone-300 bg-stone-100 px-4 py-3 text-lg">
          <span>
            {selected.title} <span className="text-stone-500">— {selected.contributor}</span>
          </span>
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="text-sm text-amber-800 underline"
          >
            Change
          </button>
        </div>
      ) : (
        <>
          <input
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Start typing a recipe name..."
            className="rounded-md border border-stone-300 px-4 py-3 text-lg"
          />
          {results.length > 0 && (
            <ul className="rounded-md border border-stone-300 bg-white text-lg shadow-sm">
              {results.map((r) => (
                <li key={r.slug}>
                  <button
                    type="button"
                    onClick={() => setSelected(r)}
                    className="block w-full px-4 py-2 text-left hover:bg-stone-100"
                  >
                    {r.title} <span className="text-stone-500">— {r.contributor}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
