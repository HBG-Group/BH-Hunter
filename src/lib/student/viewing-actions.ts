"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth/profile";
import { createViewingRequest } from "@/lib/db/viewing-requests";
import { logAnalyticsEvent } from "@/lib/db/analytics";
import { viewingRequestSchema } from "@/lib/validation/viewing";
import { publishedListingExists } from "@/lib/db/listing-guards";
import { allow, LIMITS, RATE_LIMITED } from "@/lib/security/rate-limit";
import { guarded } from "@/lib/security/errors";

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
  if (!(await allow("viewing", LIMITS.viewing, profile.id))) return { error: RATE_LIMITED };

  // Verify the listing is real and public before creating a request against it.
  if (!(await publishedListingExists(target.boardingHouseId))) {
    return { error: "That listing is no longer available." };
  }

  const parsed = viewingRequestSchema.safeParse({
    preferredAt: formData.get("preferredAt"),
    message: formData.get("message") ?? undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the date" };
  }

  return guarded<ViewingFormState>(
    "requestViewing",
    async () => {
      const created = await createViewingRequest(
        profile.id,
        target.boardingHouseId,
        parsed.data.preferredAt,
        parsed.data.message,
      );
      if (created) {
        await logAnalyticsEvent(target.boardingHouseId, "VIEWING_REQUEST");
      }

      revalidatePath("/account");
      return { success: true };
    },
    (message) => ({ error: message }),
  );
}
