"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function linkPerson(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const personId = formData.get("person_id")?.toString();
  if (!personId) {
    redirect(`/link-person?error=${encodeURIComponent("Please select yourself from the search results.")}`);
  }

  const { error } = await supabase
    .from("user_people")
    .upsert({ user_id: user.id, person_id: personId }, { onConflict: "user_id" });

  if (error) {
    redirect(`/link-person?error=${encodeURIComponent("Something went wrong. Please try again.")}`);
  }

  redirect("/directory");
}

export async function skipLinkPerson() {
  redirect("/directory");
}
