"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/auth/profile";
import {
  confirmVacancies,
  createOwnerListing,
  findOwnerListing,
  setListingStatus,
  updateOwnerListing,
} from "@/lib/db/owner";
import { countImages } from "@/lib/db/images";
import { MIN_LISTING_PHOTOS, PHOTO_REQUIREMENT_MESSAGE } from "@/config/listing";
import { listingSchema } from "@/lib/validation/listing";
import { toWriteData } from "@/services/owner-listings";
import { summarizeAvailability } from "@/services/availability";
import { maybeNotifyRoomAvailable } from "@/services/notifications";
import { allow, LIMITS, RATE_LIMITED } from "@/lib/security/rate-limit";
import { guarded, reportError } from "@/lib/security/errors";

export interface ListingFormState {
  error?: string;
}

// The complex parts of the form (rooms, amenities) arrive as a JSON payload; the
// action validates the whole thing before it ever reaches the database.
type ParseResult =
  | { ok: true; data: ReturnType<typeof listingSchema.parse> }
  | { ok: false; error: string };

function parsePayload(formData: FormData): ParseResult {
  const raw = formData.get("payload");
  if (typeof raw !== "string") return { ok: false, error: "Missing form data" };

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { ok: false, error: "That form could not be read. Please try again." };
  }

  const parsed = listingSchema.safeParse(json);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form" };
  }
  return { ok: true, data: parsed.data };
}

export async function createListingAction(
  _prev: ListingFormState,
  formData: FormData,
): Promise<ListingFormState> {
  const owner = await requireOwner();
  if (!(await allow("write", LIMITS.write, owner.id))) return { error: RATE_LIMITED };

  const result = parsePayload(formData);
  if (!result.ok) return { error: result.error };

  const created = await guarded<{ error?: string }>(
    "createListing",
    async () => {
      await createOwnerListing(owner.id, toWriteData(result.data));
      return {};
    },
    (message) => ({ error: message }),
  );
  if (created.error) return created;

  revalidatePath("/owner");
  redirect("/owner");
}

export async function updateListingAction(
  id: string,
  _prev: ListingFormState,
  formData: FormData,
): Promise<ListingFormState> {
  const owner = await requireOwner();
  if (!(await allow("write", LIMITS.write, owner.id))) return { error: RATE_LIMITED };

  const result = parsePayload(formData);
  if (!result.ok) return { error: result.error };

  // Compare availability before/after so we can alert students when a room opens up.
  const before = await findOwnerListing(owner.id, id);
  const beforeState = before ? summarizeAvailability(before.rooms).state : "FULL";

  // Verify ownership — updateOwnerListing returns false when the listing isn't theirs.
  const ok = await updateOwnerListing(owner.id, id, toWriteData(result.data));
  if (!ok) return { error: "Listing not found" };

  const afterState = summarizeAvailability(result.data.rooms).state;
  try {
    await maybeNotifyRoomAvailable(id, beforeState, afterState);
  } catch (error) {
    reportError("notifyRoomAvailable", error);
  }

  revalidatePath("/owner");
  redirect("/owner");
}

// Small one-tap actions used by buttons on the dashboard.
export async function confirmVacanciesAction(id: string) {
  const owner = await requireOwner();
  if (!(await allow("write", LIMITS.write, owner.id))) return;

  // Verify ownership — confirmVacancies is scoped by ownerId.
  await confirmVacancies(owner.id, id);
  revalidatePath("/owner");
}

// Owners can submit for review (PENDING) or pull a listing back to DRAFT — but never
// publish. Publishing is an admin action.
export async function setStatusAction(
  id: string,
  status: "DRAFT" | "PENDING",
): Promise<{ error?: string }> {
  const owner = await requireOwner();
  if (!(await allow("write", LIMITS.write, owner.id))) return { error: RATE_LIMITED };

  // Verify ownership before reading anything about the listing.
  if (!(await findOwnerListing(owner.id, id))) return { error: "Listing not found" };

  // A listing needs enough photos before it can go up for review.
  if (status === "PENDING") {
    const photos = await countImages(id);
    if (photos < MIN_LISTING_PHOTOS) return { error: PHOTO_REQUIREMENT_MESSAGE };
  }

  const ok = await setListingStatus(owner.id, id, status);
  if (!ok) return { error: "Listing not found" };

  revalidatePath("/owner");
  return {};
}
