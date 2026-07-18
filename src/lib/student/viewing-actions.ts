"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth/profile";
import { createViewingRequest } from "@/lib/db/viewing-requests";
import { logAnalyticsEvent } from "@/lib/db/analytics";
import { viewingRequestSchema } from "@/lib/validation/viewing";

export interface ViewingFormState {
  error?: string;
  success?: boolean;
}

interface Target {
  boardingHouseId: string;
  slug: string;
}

// Create a viewing request for the signed-in student.
export async function requestViewingAction(
  target: Target,
  _prev: ViewingFormState,
  formData: FormData,
): Promise<ViewingFormState> {
  const profile = await requireProfile(`/listings/${target.slug}`);

  const parsed = viewingRequestSchema.safeParse({
    preferredAt: formData.get("preferredAt"),
    message: formData.get("message") ?? undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the date" };
  }

  await createViewingRequest(
    profile.id,
    target.boardingHouseId,
    parsed.data.preferredAt,
    parsed.data.message,
  );
  await logAnalyticsEvent(target.boardingHouseId, "VIEWING_REQUEST");

  revalidatePath("/account");
  return { success: true };
}
