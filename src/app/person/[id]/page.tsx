import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatYears } from "@/lib/format";

function RelLink({ id, name }: { id: string | null; name: string }) {
  return id ? (
    <Link href={`/person/${id}`} className="text-amber-800 underline">
      {name}
    </Link>
  ) : (
    <span>{name}</span>
  );
}

export default async function PersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const { data: person } = await supabase
      .from("people_public")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!person) {
      const admin = createAdminClient();
      const { data: exists } = await admin.from("people").select("id").eq("id", id).maybeSingle();
      if (!exists) notFound();

      return (
        <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
          <p className="text-lg text-stone-700">
            This profile is only visible to logged-in family members.{" "}
            <Link href="/login" className="font-medium text-amber-800 underline">
              Log in
            </Link>{" "}
            to view it.
          </p>
        </div>
      );
    }

    return (
      <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
        <h1 className="text-3xl font-semibold text-stone-900">
          {person.name}
          {person.aka && <span className="text-stone-500 text-xl"> ({person.aka})</span>}
        </h1>
        <p className="mt-2 text-lg text-stone-600">
          {formatYears(person.birth_year, person.death_year)}
        </p>
        {(person.birth_location || person.death_location) && (
          <dl className="mt-6 space-y-2 text-stone-700">
            {person.birth_location && (
              <div>
                <dt className="inline font-medium">Born: </dt>
                <dd className="inline">{person.birth_location}</dd>
              </div>
            )}
            {person.death_location && (
              <div>
                <dt className="inline font-medium">Died: </dt>
                <dd className="inline">{person.death_location}</dd>
              </div>
            )}
          </dl>
        )}
        <p className="mt-8 text-stone-500">
          <Link href="/login" className="font-medium text-amber-800 underline">
            Log in
          </Link>{" "}
          to see family relationships and more.
        </p>
      </div>
    );
  }

  const { data: person } = await supabase.from("people").select("*").eq("id", id).maybeSingle();
  if (!person) notFound();

  const [{ data: parentLinks }, { data: childLinks }, { data: marriages }] = await Promise.all([
    supabase.from("parent_child").select("parent_id,parent_name,relationship").eq("child_id", id),
    supabase.from("parent_child").select("child_id,child_name,relationship").eq("parent_id", id),
    supabase.from("marriages").select("*").or(`husband_id.eq.${id},wife_id.eq.${id}`),
  ]);

  const address = [person.street, person.city, person.state, person.zip].filter(Boolean).join(", ");

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <h1 className="text-3xl font-semibold text-stone-900">
        {person.name}
        {person.aka && <span className="text-stone-500 text-xl"> ({person.aka})</span>}
      </h1>
      <p className="mt-2 text-lg text-stone-600">
        {formatYears(person.birth_year, person.death_year)}
      </p>

      <dl className="mt-6 space-y-2 text-stone-700">
        {person.birth_date_raw && (
          <div>
            <dt className="inline font-medium">Born: </dt>
            <dd className="inline">
              {person.birth_date_raw}
              {person.birth_location && ` — ${person.birth_location}`}
            </dd>
          </div>
        )}
        {person.death_date_raw && (
          <div>
            <dt className="inline font-medium">Died: </dt>
            <dd className="inline">
              {person.death_date_raw}
              {person.death_location && ` — ${person.death_location}`}
            </dd>
          </div>
        )}
        {address && (
          <div>
            <dt className="inline font-medium">Address: </dt>
            <dd className="inline">{address}</dd>
          </div>
        )}
      </dl>

      <div className="mt-8 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-stone-900">Parents</h2>
          {parentLinks && parentLinks.length > 0 ? (
            <ul className="mt-2 space-y-1">
              {parentLinks.map((p, i) => (
                <li key={i}>
                  <RelLink id={p.parent_id} name={p.parent_name} />
                  {p.relationship && p.relationship !== "Natural" && (
                    <span className="text-stone-500"> ({p.relationship})</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-stone-500">None on record.</p>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-stone-900">Spouses</h2>
          {marriages && marriages.length > 0 ? (
            <ul className="mt-2 space-y-1">
              {marriages.map((m) => {
                const isHusband = m.husband_id === id;
                const spouseId = isHusband ? m.wife_id : m.husband_id;
                const spouseName = isHusband ? m.wife_name : m.husband_name;
                return (
                  <li key={m.id}>
                    <RelLink id={spouseId} name={spouseName ?? "Unknown"} />
                    {m.ending_status && (
                      <span className="text-stone-500"> ({m.ending_status})</span>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-2 text-stone-500">None on record.</p>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-stone-900">Children</h2>
          {childLinks && childLinks.length > 0 ? (
            <ul className="mt-2 space-y-1">
              {childLinks.map((c, i) => (
                <li key={i}>
                  <RelLink id={c.child_id} name={c.child_name} />
                  {c.relationship && c.relationship !== "Natural" && (
                    <span className="text-stone-500"> ({c.relationship})</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-stone-500">None on record.</p>
          )}
        </div>
      </div>
    </div>
  );
}
