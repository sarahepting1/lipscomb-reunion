import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SubmitForm } from "./submit-form";

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; submitted?: string; recipe?: string }>;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error, submitted, recipe } = await searchParams;

  return (
    <div className="mx-auto w-full max-w-xl flex-1 px-6 py-12">
      <h1 className="text-3xl font-semibold text-stone-900">Submit a Family Update</h1>
      <p className="mt-2 text-lg text-stone-600">
        Submissions are reviewed before they&apos;re added to the directory.
      </p>

      {submitted && (
        <p className="mt-4 rounded-md bg-green-50 px-4 py-3 text-green-800">
          Thanks! Your submission has been sent for review.
        </p>
      )}
      {error && <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-red-800">{error}</p>}

      <SubmitForm
        initialEventType={recipe ? "recipe_correction" : undefined}
        initialRecipeSlug={recipe}
      />
    </div>
  );
}
