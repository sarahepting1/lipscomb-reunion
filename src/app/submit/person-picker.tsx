"use client";

import { useEffect, useState } from "react";
import { formatYears } from "@/lib/format";

type Person = {
  id: string;
  name: string;
  aka: string | null;
  birth_year: number | null;
  death_year: number | null;
};

export function PersonPicker({
  fieldName,
  label,
  required,
}: {
  fieldName: string;
  label: string;
  required?: boolean;
}) {
  const [mode, setMode] = useState<"search" | "manual">("search");
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<Person[]>([]);
  const [selected, setSelected] = useState<Person | null>(null);
  const [manualName, setManualName] = useState("");

  useEffect(() => {
    if (mode !== "search" || selected || term.trim().length < 2) {
      setResults([]);
      return;
    }
    const handle = setTimeout(async () => {
      const res = await fetch(`/api/people/search?q=${encodeURIComponent(term.trim())}`);
      if (res.ok) {
        const { results } = await res.json();
        setResults(results);
      }
    }, 250);
    return () => clearTimeout(handle);
  }, [term, mode, selected]);

  return (
    <div className="flex flex-col gap-1" data-testid={`person-picker-${fieldName}`}>
      <span className="text-sm font-medium text-stone-700">{label}</span>

      <input type="hidden" name={`${fieldName}_id`} value={selected?.id ?? ""} />
      <input
        type="hidden"
        name={`${fieldName}_name`}
        value={mode === "search" ? selected?.name ?? "" : manualName}
      />

      {mode === "manual" ? (
        <>
          <input
            type="text"
            value={manualName}
            onChange={(e) => setManualName(e.target.value)}
            required={required}
            placeholder="Full name"
            className="rounded-md border border-stone-300 px-4 py-3 text-lg"
          />
          <button
            type="button"
            onClick={() => {
              setMode("search");
              setManualName("");
            }}
            className="self-start text-sm text-amber-800 underline"
          >
            Search the directory instead
          </button>
        </>
      ) : selected ? (
        <div className="flex items-center justify-between rounded-md border border-stone-300 bg-stone-100 px-4 py-3 text-lg">
          <span>
            {selected.name}
            {" — "}
            {formatYears(selected.birth_year, selected.death_year) || "no dates on record"}
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
            placeholder="Start typing a name..."
            className="rounded-md border border-stone-300 px-4 py-3 text-lg"
          />
          {results.length > 0 && (
            <ul className="rounded-md border border-stone-300 bg-white text-lg shadow-sm">
              {results.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(p);
                      setResults([]);
                    }}
                    className="block w-full px-4 py-2 text-left hover:bg-stone-100"
                  >
                    {p.name}
                    {p.aka && <span className="text-stone-500"> ({p.aka})</span>}
                    {" — "}
                    {formatYears(p.birth_year, p.death_year) || "no dates on record"}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={() => setMode("manual")}
            className="self-start text-sm text-amber-800 underline"
          >
            Can&apos;t find them? Enter a name manually
          </button>
        </>
      )}
    </div>
  );
}
