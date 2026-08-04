"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireProfile } from "@/lib/auth/profile";
import { prisma } from "@/lib/db/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { deleteAccountCompletely } from "@/lib/account/deletion";
import { safeRedirectPath } from "@/lib/security/redirect";
import { allow, LIMITS, RATE_LIMITED } from "@/lib/security/rate-limit";
import { reportError } from "@/lib/security/errors";

export interface OnboardingState {
  error?: string;
}

export interface AccountSettingsState {
  error?: string;
  success?: string;
}

const accountSettingsSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter a name between 2 and 80 characters.")
    .max(80),
  phone: z
    .string()
    .trim()
    .max(20)
    .transform((value) => value.replace(/\D/g, ""))
    .refine(
      (value) => value === "" || /^09\d{9}$/.test(value),
      "Use an 11-digit Philippine mobile number starting with 09.",
    ),
});

export async function updateAccountSettingsAction(
  _prev: AccountSettingsState,
  formData: FormData,
): Promise<AccountSettingsState> {
  const profile = await requireProfile("/settings");
  if (!(await allow("write", LIMITS.write, profile.id)))
    return { error: RATE_LIMITED };
  const parsed = accountSettingsSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone") ?? "",
  });
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Check your details." };

  await prisma.profile.update({
    where: { id: profile.id },
    data: { fullName: parsed.data.fullName, phone: parsed.data.phone || null },
  });
  revalidatePath("/settings");
  revalidatePath("/account");
  revalidatePath("/owner");
  return { success: "Profile updated." };
}

export async function revokeOtherSessionsAction(): Promise<void> {
  await requireProfile("/settings");
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut({ scope: "others" });
  revalidatePath("/settings");
}

// First-time users pick a display name here, then continue into the app. Existing users
// never reach this (the OAuth callback only routes brand-new profiles to onboarding).
export async function completeOnboardingAction(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const profile = await requireProfile();

  const name = String(formData.get("displayName") ?? "").trim();
  if (name.length < 2 || name.length > 80) {
    return { error: "Enter a name between 2 and 80 characters." };
  }

  await prisma.profile.update({
    where: { id: profile.id },
    data: { fullName: name },
  });

  const next = safeRedirectPath(formData.get("next") as string | null, "/");
  redirect(next);
}

// Self-service permanent account deletion (Danger Zone). Removes all of the user's data
// (and their listings/files if they're an owner), signs them out, and sends them home.
export async function deleteMyAccountAction(): Promise<{ error?: string }> {
  const profile = await requireProfile();
  if (!(await allow("write", LIMITS.write, profile.id)))
    return { error: RATE_LIMITED };

  try {
    await deleteAccountCompletely(profile.id);
  } catch (error) {
    reportError("deleteMyAccount", error);
    return { error: "Could not delete your account. Please try again." };
  }

  // Clear the session cookie before leaving.
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
