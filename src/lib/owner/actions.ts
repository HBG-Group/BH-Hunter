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

  const parsed = listingSchema.safeParse(JSON.parse(raw));
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
  const result = parsePayload(formData);
  if (!result.ok) return { error: result.error };

  await createOwnerListing(owner.id, toWriteData(result.data));
  revalidatePath("/owner");
  redirect("/owner");
}

export async function updateListingAction(
  id: string,
  _prev: ListingFormState,
  formData: FormData,
): Promise<ListingFormState> {
  const owner = await requireOwner();
  const result = parsePayload(formData);
  if (!result.ok) return { error: result.error };

  // Compare availability before/after so we can alert students when a room opens up.
  const before = await findOwnerListing(owner.id, id);
  const beforeState = before ? summarizeAvailability(before.rooms).state : "FULL";

  const ok = await updateOwnerListing(owner.id, id, toWriteData(result.data));
  if (!ok) return { error: "Listing not found" };

  const afterState = summarizeAvailability(result.data.rooms).state;
  await maybeNotifyRoomAvailable(id, beforeState, afterState);

  revalidatePath("/owner");
  redirect("/owner");
}

// Small one-tap actions used by buttons on the dashboard.
export async function confirmVacanciesAction(id: string) {
  const owner = await requireOwner();
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

  // A listing needs enough photos before it can go up for review.
  if (status === "PENDING") {
    const photos = await countImages(id);
    if (photos < MIN_LISTING_PHOTOS) return { error: PHOTO_REQUIREMENT_MESSAGE };
  }

  await setListingStatus(owner.id, id, status);
  revalidatePath("/owner");
  return {};
}
