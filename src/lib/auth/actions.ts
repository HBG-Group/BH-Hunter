"use server";

import { redirect } from "next/navigation";
import { OAUTH_CALLBACK_PATH } from "@/config/auth";
import { getCurrentProfile } from "@/lib/auth/profile";
import { resolveSiteOrigin } from "@/lib/auth/site-origin";
import { logSecurityEvent } from "@/lib/security/events";
import { allow, LIMITS, RATE_LIMITED } from "@/lib/security/rate-limit";
import { safeRedirectPath } from "@/lib/security/redirect";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { credentialsSchema, signUpSchema } from "@/lib/validation/auth";

export interface AuthFormState {
  error?: string;
  notice?: string;
}

export async function signInAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!(await allow("signin", LIMITS.auth))) {
    await logSecurityEvent({ action: "auth.signin", outcome: "denied", detail: "rate_limited" });
    return { error: RATE_LIMITED };
  }

  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    await logSecurityEvent({ action: "auth.signin", outcome: "denied", detail: "invalid_payload" });
    return { error: parsed.error.issues[0]?.message ?? "Check your details" };
  }

  const next = safeRedirectPath(formData.get("next") as string | null, "");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    await logSecurityEvent({ action: "auth.signin", outcome: "denied", detail: "invalid_credentials" });
    return { error: "Incorrect email or password." };
  }

  const profile = await getCurrentProfile();
  await logSecurityEvent({
    action: "auth.signin",
    outcome: "allowed",
    actorId: profile?.id,
    actorRole: profile?.role,
  });

  if (next) redirect(next);
  if (profile?.role === "ADMIN") redirect("/admin");
  redirect(profile?.role === "OWNER" ? "/owner" : "/account");
}

export async function signUpAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!(await allow("signup", LIMITS.auth))) {
    await logSecurityEvent({ action: "auth.signup", outcome: "denied", detail: "rate_limited" });
    return { error: RATE_LIMITED };
  }

  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role") === "OWNER" ? "OWNER" : "STUDENT",
    terms: formData.get("terms"),
  });
  if (!parsed.success) {
    await logSecurityEvent({ action: "auth.signup", outcome: "denied", detail: "invalid_payload" });
    return { error: parsed.error.issues[0]?.message ?? "Check your details" };
  }
  const { fullName, email, password, role } = parsed.data;

  const origin = await resolveSiteOrigin();
  const emailRedirectTo = `${origin}${OAUTH_CALLBACK_PATH}?next=${role === "OWNER" ? "/owner" : "/account"}`;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, role }, emailRedirectTo },
  });
  if (error) {
    await logSecurityEvent({ action: "auth.signup", outcome: "error", detail: "supabase_signup_failed" });
    return { error: error.message };
  }

  if (!data.session) {
    await logSecurityEvent({
      action: "auth.signup",
      outcome: "allowed",
      detail: "awaiting_email_confirmation",
    });
    return { notice: "Check your email to confirm your account, then sign in." };
  }

  const profile = await getCurrentProfile();
  await logSecurityEvent({
    action: "auth.signup",
    outcome: "allowed",
    actorId: profile?.id,
    actorRole: profile?.role,
  });
  redirect(role === "OWNER" ? "/owner" : "/account");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  const profile = await getCurrentProfile();
  await supabase.auth.signOut();
  await logSecurityEvent({
    action: "auth.signout",
    outcome: "allowed",
    actorId: profile?.id,
    actorRole: profile?.role,
  });
  redirect("/");
}
