import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PersonPicker } from "@/components/person-picker";
import { linkPerson, skipLinkPerson } from "./actions";

export default async function LinkPersonPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: link } = await supabase
    .from("user_people")
    .select("person_id")
    .eq("user_id", user.id)
    .maybeSingle();

  let currentName: string | null = null;
  if (link?.person_id) {
    const { data: person } = await supabase
      .from("people")
      .select("name")
      .eq("id", link.person_id)
      .maybeSingle();
    currentName = person?.name ?? null;
  }

  return (
    <div className="mx-auto w-full max-w-sm flex-1 px-6 py-16">
      <h1 className="text-2xl font-semibold text-stone-900">Which one is you?</h1>
      <p className="mt-2 text-lg text-stone-600">
        Search the directory and select your own record so we know who you are in the family
        tree.
      </p>

      {currentName && (
        <p className="mt-4 rounded-md bg-stone-100 px-4 py-3 text-stone-700">
          Currently linked to: <span className="font-medium">{currentName}</span>
        </p>
      )}
      {error && <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-red-800">{error}</p>}

      <form action={linkPerson} className="mt-6 flex flex-col gap-4">
        <PersonPicker fieldName="person" label="Find yourself" required allowManual={false} />
        <button
          type="submit"
          className="mt-2 rounded-md bg-amber-700 px-4 py-3 text-lg font-medium text-white hover:bg-amber-800"
        >
          This is me
        </button>
      </form>

      <form action={skipLinkPerson} className="mt-4">
        <button type="submit" className="text-stone-600 underline">
          I&apos;m not listed yet / skip for now
        </button>
      </form>
    </div>
  );
}
