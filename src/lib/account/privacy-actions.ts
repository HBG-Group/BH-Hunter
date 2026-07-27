"use server";

import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth/profile";
import { deleteAccountData, ownedListingPhotoUrls } from "@/lib/account/privacy";
import { logSecurityEvent } from "@/lib/security/events";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { removeListingPhoto } from "@/lib/storage/photos";

export async function deleteMyAccountAction(): Promise<void> {
  const profile = await requireProfile("/account/privacy");
  const photoUrls = await ownedListingPhotoUrls(profile.id);
  await deleteAccountData(profile.id);
  for (const url of photoUrls) await removeListingPhoto(url);

  const admin = createSupabaseAdminClient();
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  await admin.auth.admin.deleteUser(profile.id);

  await logSecurityEvent({
    action: "account.delete",
    outcome: "allowed",
    actorId: profile.id,
    actorRole: profile.role,
    targetType: "profile",
    targetId: profile.id,
  });
  redirect("/");
}
