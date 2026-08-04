"use server";

import { redirect } from "next/navigation";
import { OAUTH_CALLBACK_PATH } from "@/config/auth";
import { serverSiteUrl } from "@/config/site";
import {
  ensureProfileForCurrentUser,
  getCurrentProfile,
} from "@/lib/auth/profile";
import { resolveSiteOrigin } from "@/lib/auth/site-origin";
import { logSecurityEvent } from "@/lib/security/events";
import { allow, LIMITS, RATE_LIMITED } from "@/lib/security/rate-limit";
import {
  checkLockout,
  clearFailedLogins,
  recordFailedLogin,
} from "@/lib/security/login-lockout";
import { safeRedirectPath } from "@/lib/security/redirect";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  credentialsSchema,
  signUpSchema,
  MIN_PASSWORD_LENGTH,
} from "@/lib/validation/auth";

export interface AuthFormState {
  error?: string;
  notice?: string;
}

export async function requestPasswordResetAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!(await allow("password-reset", LIMITS.auth)))
    return { error: RATE_LIMITED };
  const parsed = credentialsSchema.shape.email.safeParse(formData.get("email"));
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Enter a valid email." };
  const origin = await resolveSiteOrigin();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${origin}${OAUTH_CALLBACK_PATH}?next=/account/password`,
  });
  if (error)
    return { error: "Could not send the reset email. Please try again." };
  return {
    notice: "If that account exists, a password-reset link has been sent.",
  };
}

export async function updatePasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const profile = await getCurrentProfile();
  if (!profile)
    return { error: "Open the secure link from your reset email first." };
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");
  if (password.length < MIN_PASSWORD_LENGTH || password.length > 72) {
    return { error: `Use ${MIN_PASSWORD_LENGTH}–72 characters.` };
  }
  if (password !== confirmation) return { error: "Passwords do not match." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error)
    return { error: "Could not update the password. Please try again." };
  await logSecurityEvent({
    action: "auth.password_changed",
    outcome: "allowed",
    actorId: profile.id,
    actorRole: profile.role,
  });
  return { notice: "Password updated." };
}

export async function signInAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!(await allow("signin", LIMITS.auth))) {
    await logSecurityEvent({
      action: "auth.signin",
      outcome: "denied",
      detail: "rate_limited",
    });
    return { error: RATE_LIMITED };
  }

  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    await logSecurityEvent({
      action: "auth.signin",
      outcome: "denied",
      detail: "invalid_payload",
    });
    return { error: parsed.error.issues[0]?.message ?? "Check your details" };
  }

  const next = safeRedirectPath(formData.get("next") as string | null, "");

  // Account-level lockout: 5 wrong-password attempts locks this email for 30s,
  // independent of the IP-based rate limit above. Checked before touching Supabase so a
  // locked-out account never even reaches the password check while waiting out the timer.
  const lockout = await checkLockout(parsed.data.email);
  if (lockout.locked) {
    await logSecurityEvent({
      action: "auth.signin",
      outcome: "denied",
      detail: "locked_out",
    });
    return {
      error: `Too many failed attempts. Please wait ${lockout.retryAfterSeconds}s and try again.`,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    if (error.message.toLowerCase().includes("email not confirmed")) {
      await logSecurityEvent({
        action: "auth.signin",
        outcome: "denied",
        detail: "email_not_confirmed",
      });
      return {
        error:
          "Please confirm your email address from the latest confirmation email before signing in.",
      };
    }
    const state = await recordFailedLogin(parsed.data.email);
    await logSecurityEvent({
      action: "auth.signin",
      outcome: "denied",
      detail: "invalid_credentials",
    });
    if (state.locked) {
      return {
        error: `Too many failed attempts. Please wait ${state.retryAfterSeconds}s and try again.`,
      };
    }
    return { error: "Incorrect email or password." };
  }

  await clearFailedLogins(parsed.data.email);
  const profileResult = await ensureProfileForCurrentUser();
  if (!profileResult) {
    await logSecurityEvent({
      action: "auth.signin",
      outcome: "error",
      detail: "profile_missing_after_authentication",
    });
    return { error: "We couldn’t finish signing you in. Please try again." };
  }
  if ("conflict" in profileResult && profileResult.conflict) {
    // Do not leave a valid Supabase session attached when the email belongs to a
    // different provider identity. The user must explicitly link providers first.
    await supabase.auth.signOut();
    await logSecurityEvent({
      action: "auth.signin",
      outcome: "denied",
      detail: "identity_conflict",
    });
    return {
      error:
        "This email is already connected to another Meino sign-in method. Use that provider or link this account first.",
    };
  }
  if (!("profile" in profileResult)) {
    return { error: "We couldn’t finish signing you in. Please try again." };
  }
  const profile = profileResult.profile;
  await logSecurityEvent({
    action: "auth.signin",
    outcome: "allowed",
    actorId: profile.id,
    actorRole: profile.role,
  });

  if (next) redirect(next);
  if (profile.role === "ADMIN") redirect("/admin");
  redirect(profile.role === "OWNER" ? "/owner" : "/account");
}

export async function signUpAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!(await allow("signup", LIMITS.auth))) {
    await logSecurityEvent({
      action: "auth.signup",
      outcome: "denied",
      detail: "rate_limited",
    });
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
    await logSecurityEvent({
      action: "auth.signup",
      outcome: "denied",
      detail: "invalid_payload",
    });
    return { error: parsed.error.issues[0]?.message ?? "Check your details" };
  }
  const { fullName, email, password, role } = parsed.data;

  // Supabase only accepts confirmation redirects on its allow-list. Do not use a
  // transient Vercel preview hostname when the canonical public URL has not been
  // configured: omitting it lets Supabase use its configured Site URL instead.
  const confirmationOrigin = serverSiteUrl();
  const emailRedirectTo = confirmationOrigin
    ? `${confirmationOrigin}/auth/confirmed`
    : undefined;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role },
      ...(emailRedirectTo ? { emailRedirectTo } : {}),
    },
  });
  if (error) {
    await logSecurityEvent({
      action: "auth.signup",
      outcome: "error",
      detail: "supabase_signup_failed",
    });
    const message = error.message.toLowerCase();
    if (message.includes("rate limit")) {
      return {
        error:
          "Too many confirmation emails were requested. Wait at least 60 seconds before retrying. If the limit continues, wait up to an hour for the project email quota to reset.",
      };
    }
    if (message.includes("email address") && message.includes("invalid")) {
      return { error: "Enter a valid email address." };
    }
    return {
      error: "We couldn’t create your account right now. Please try again.",
    };
  }

  // Supabase doesn't return an error for an already-registered email — for privacy, it
  // returns a 200 with a user object whose `identities` array is empty and no session,
  // which otherwise looks identical to "check your email" for a brand-new signup. That
  // silence is exactly the kind of unexplained dead end we don't want here.
  if (data.user && data.user.identities?.length === 0) {
    await logSecurityEvent({
      action: "auth.signup",
      outcome: "denied",
      detail: "email_already_registered",
    });
    return {
      error:
        "An account with this email already exists. Please sign in instead.",
    };
  }

  if (!data.session) {
    await logSecurityEvent({
      action: "auth.signup",
      outcome: "allowed",
      detail: "awaiting_email_confirmation",
    });
    return {
      notice:
        "Check your email to confirm your account, then return here to sign in. If you need another confirmation email, wait at least 60 seconds before retrying; repeated requests may be limited for up to an hour.",
    };
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
