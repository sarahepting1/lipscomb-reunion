"use server";

import crypto from "node:crypto";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function checkSignupCode(code: string): boolean {
  const expected = process.env.FAMILY_SIGNUP_CODE ?? "";
  if (!expected || code.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(code), Buffer.from(expected));
}

export async function signUp(formData: FormData) {
  const email = formData.get("email")?.toString().trim() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const confirmPassword = formData.get("confirm_password")?.toString() ?? "";
  const familyCode = formData.get("family_code")?.toString().trim() ?? "";

  if (!checkSignupCode(familyCode)) {
    redirect(`/signup?error=${encodeURIComponent("Incorrect family code.")}`);
  }
  if (password !== confirmPassword) {
    redirect(`/signup?error=${encodeURIComponent("Passwords don't match.")}`);
  }
  if (password.length < 8) {
    redirect(`/signup?error=${encodeURIComponent("Password must be at least 8 characters.")}`);
  }

  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin") ?? "";

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/link-person` },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  if (data.session) {
    redirect("/link-person");
  }

  redirect("/signup?confirm=1");
}
