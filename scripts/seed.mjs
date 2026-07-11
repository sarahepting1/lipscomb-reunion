import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const FULL_DATE = /^\d{4}-\d{2}-\d{2}$/;

function sqlDate(value) {
  return typeof value === "string" && FULL_DATE.test(value) ? value : null;
}

function chunk(array, size) {
  const out = [];
  for (let i = 0; i < array.length; i += size) out.push(array.slice(i, i + size));
  return out;
}

async function insertInChunks(supabase, table, rows, size = 500) {
  for (const batch of chunk(rows, size)) {
    const { error } = await supabase.from(table).insert(batch);
    if (error) throw new Error(`Insert into ${table} failed: ${error.message}`);
  }
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Run with: node --env-file=.env.local scripts/seed.mjs"
    );
  }
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  const raw = await readFile(new URL("../lipscomb_family_data.json", import.meta.url), "utf-8");
  const data = JSON.parse(raw);

  const people = data.people.map((p) => ({
    id: p.id,
    name: p.name,
    aka: p.aka,
    sex: p.sex,
    birth_date: sqlDate(p.birth?.date),
    birth_date_raw: p.birth?.date_raw ?? null,
    birth_year: p.birth?.year ?? null,
    birth_location: p.birth?.location ?? null,
    death_date: sqlDate(p.death?.date),
    death_date_raw: p.death?.date_raw ?? null,
    death_year: p.death?.year ?? null,
    death_location: p.death?.location ?? null,
    street: p.address?.street ?? null,
    city: p.address?.city ?? null,
    state: p.address?.state ?? null,
    zip: p.address?.zip ?? null,
    status: p.status,
  }));

  const marriages = data.marriages.map((m) => ({
    husband_id: m.husband_id ?? null,
    husband_name: m.husband,
    wife_id: m.wife_id ?? null,
    wife_name: m.wife,
    marriage_date: sqlDate(m.date),
    marriage_date_raw: m.date_raw ?? null,
    ending_status: m.ending_status ?? null,
  }));

  const parentChild = [];
  for (const p of data.people) {
    for (const parent of p.parents ?? []) {
      parentChild.push({
        parent_id: parent.id ?? null,
        parent_name: parent.name,
        child_id: p.id,
        child_name: p.name,
        relationship: parent.relationship ?? null,
      });
    }
  }

  console.log(`Seeding ${people.length} people...`);
  await insertInChunks(supabase, "people", people);

  console.log(`Seeding ${marriages.length} marriages...`);
  await insertInChunks(supabase, "marriages", marriages);

  console.log(`Seeding ${parentChild.length} parent_child links...`);
  await insertInChunks(supabase, "parent_child", parentChild);

  const [{ count: peopleCount }, { count: marriagesCount }, { count: pcCount }] = await Promise.all([
    supabase.from("people").select("*", { count: "exact", head: true }),
    supabase.from("marriages").select("*", { count: "exact", head: true }),
    supabase.from("parent_child").select("*", { count: "exact", head: true }),
  ]);

  console.log("\nDone. Row counts in Supabase:");
  console.log(`  people:        ${peopleCount} (expected ${data.counts.people})`);
  console.log(`  marriages:     ${marriagesCount} (expected ${data.counts.marriages})`);
  console.log(`  parent_child:  ${pcCount} (source JSON's counts.parent_child_links says ${data.counts.parent_child_links})`);

  if (peopleCount !== data.counts.people || marriagesCount !== data.counts.marriages) {
    throw new Error("people/marriages row counts do not match the JSON's counts object — see above.");
  }

  if (pcCount !== data.counts.parent_child_links) {
    console.warn(
      `\nNote: parent_child count (${pcCount}) doesn't match counts.parent_child_links (${data.counts.parent_child_links}).\n` +
        "This is a known data-quality gap in the source merge (people[].parents[] and people[].children[] arrays " +
        "don't fully agree, likely due to the documented ambiguous_links/duplicate_names issues). Rows above were " +
        "seeded from each person's own parents[] entries, which is the authoritative, relationship-preserving source."
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
