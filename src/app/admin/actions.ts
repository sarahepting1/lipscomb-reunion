"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkAdminPassword, isAdminAuthenticated, setAdminSession, clearAdminSession } from "@/lib/admin-auth";

export async function adminLogin(formData: FormData) {
  const password = formData.get("password")?.toString() ?? "";

  if (!checkAdminPassword(password)) {
    redirect(`/admin?error=${encodeURIComponent("Incorrect admin password.")}`);
  }

  await setAdminSession();
  redirect("/admin");
}

export async function adminLogout() {
  await clearAdminSession();
  redirect("/");
}

function str(formData: FormData, key: string): string | null {
  const value = formData.get(key)?.toString().trim();
  return value ? value : null;
}

export async function approveSubmission(formData: FormData) {
  if (!(await isAdminAuthenticated())) redirect("/admin");

  const id = formData.get("id")?.toString();
  const admin = createAdminClient();

  const { data: sub, error: fetchError } = await admin
    .from("submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !sub) {
    redirect(`/admin?error=${encodeURIComponent("Submission not found.")}`);
  }
  if (sub.status !== "pending") {
    redirect(`/admin?error=${encodeURIComponent("This submission is no longer pending.")}`);
  }

  const p = sub.payload as Record<string, unknown>;
  let newPayload: Record<string, unknown> = p;

  switch (sub.event_type) {
    case "birth": {
      const childName = str(formData, "child_name");
      if (!childName) redirect(`/admin?error=${encodeURIComponent("Child's name can't be empty.")}`);
      newPayload = { ...p, child_name: childName, birth_date: str(formData, "event_date"), location: str(formData, "location") };
      break;
    }
    case "death":
      newPayload = { ...p, death_date: str(formData, "event_date"), location: str(formData, "location") };
      break;
    case "marriage":
      newPayload = { ...p, marriage_date: str(formData, "event_date") };
      break;
    case "address_update":
      newPayload = {
        ...p,
        street: str(formData, "street"),
        city: str(formData, "city"),
        state: str(formData, "state"),
        zip: str(formData, "zip"),
      };
      break;
    case "correction":
    case "recipe_correction": {
      const description = str(formData, "description");
      if (!description) redirect(`/admin?error=${encodeURIComponent("Description can't be empty.")}`);
      newPayload = { ...p, description };
      break;
    }
  }

  const { error: updateError } = await admin
    .from("submissions")
    .update({ payload: newPayload })
    .eq("id", id)
    .eq("status", "pending");

  if (updateError) {
    redirect(`/admin?error=${encodeURIComponent("Could not save your edits.")}`);
  }

  const { error } = await admin.rpc("approve_submission", { p_submission_id: id });

  if (error) {
    redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  }
  redirect("/admin");
}

export async function rejectSubmission(formData: FormData) {
  if (!(await isAdminAuthenticated())) redirect("/admin");

  const id = formData.get("id")?.toString();
  const admin = createAdminClient();
  const { error } = await admin.rpc("reject_submission", { p_submission_id: id });

  if (error) {
    redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  }
  redirect("/admin");
}
