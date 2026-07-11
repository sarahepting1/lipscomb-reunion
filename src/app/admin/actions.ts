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

export async function approveSubmission(formData: FormData) {
  if (!(await isAdminAuthenticated())) redirect("/admin");

  const id = formData.get("id")?.toString();
  const admin = createAdminClient();
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
