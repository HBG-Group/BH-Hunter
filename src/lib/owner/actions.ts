"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { invalidate } from "@/lib/cache/redis";
import { requireWritableOwner } from "@/lib/auth/profile";
import {
  confirmVacancies,
  createOwnerListing,
  findOwnerListing,
  requestOwnerVerification,
  setListingStatus,
  updateOwnerListing,
} from "@/lib/db/owner";
import { deleteViewingRequest, setViewingRequestStatus } from "@/lib/db/viewing-requests";
import { countImages } from "@/lib/db/images";
import { MIN_LISTING_PHOTOS, PHOTO_REQUIREMENT_MESSAGE } from "@/config/listing";
import { listingSchema } from "@/lib/validation/listing";
import { toWriteData } from "@/services/owner-listings";
import { summarizeAvailability } from "@/services/availability";
import { maybeNotifyRoomAvailable } from "@/services/notifications";
import { allow, LIMITS, RATE_LIMITED } from "@/lib/security/rate-limit";
import { guarded, reportError } from "@/lib/security/errors";
import { getListingQuota } from "@/lib/owner/billing";
import { getOwnerRoomEntitlement } from "@/lib/owner/entitlements";
import { notifyAdmins } from "@/lib/db/admin-notifications";

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
  const owner = await requireWritableOwner();
  if (!(await allow("write", LIMITS.write, owner.id))) return { error: RATE_LIMITED };

  const result = parsePayload(formData);
  if (!result.ok) return { error: result.error };

  const entitlement = await getOwnerRoomEntitlement(owner.id);
  if (result.data.rooms.length > entitlement.roomLimit) {
    return { error: `${entitlement.planName} allows up to ${entitlement.roomLimit} rooms per listing.` };
  }

  // Hard gate at the free limit: extra listings must be arranged with the admin, so we
  // never let the 6th+ listing through the server action regardless of the client UI.
  const quota = await getListingQuota(owner.id);
  if (quota.atLimit) {
    return { error: `You've used all ${quota.freeLimit} free listings. Contact the admin to add more (₱${quota.extraPrice} each).` };
  }

  const created = await guarded<{ error?: string; slug?: string }>(
    "createListing",
    async () => {
      const row = await createOwnerListing(owner.id, toWriteData(result.data));
      return { slug: row.slug };
    },
    (message) => ({ error: message }),
  );
  if (created.error) return created;

  // New listings start as DRAFT (not in the published cache yet), but the owner's
  // metrics tile and the listing's own cache key should reflect it right away.
  await invalidate("listings:published", `listing:${created.slug}`, `metrics:owner:${owner.id}`);
  revalidatePath("/owner");
  redirect("/owner");
}

export async function updateListingAction(
  id: string,
  _prev: ListingFormState,
  formData: FormData,
): Promise<ListingFormState> {
  const owner = await requireWritableOwner();
  if (!(await allow("write", LIMITS.write, owner.id))) return { error: RATE_LIMITED };

  const result = parsePayload(formData);
  if (!result.ok) return { error: result.error };

  const entitlement = await getOwnerRoomEntitlement(owner.id);
  if (result.data.rooms.length > entitlement.roomLimit) {
    return { error: `${entitlement.planName} allows up to ${entitlement.roomLimit} rooms per listing.` };
  }

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

  const keys = ["listings:published", `metrics:owner:${owner.id}`];
  if (before) keys.push(`listing:${before.slug}`);
  await invalidate(...keys);
  revalidatePath("/owner");
  redirect("/owner");
}

// The owner taps "Be verified". Records the request so an admin can act on it. The
// ₱ payment is arranged out-of-band with the admin; this only flags the intent.
export async function requestVerificationAction(): Promise<{ ok: boolean }> {
  const owner = await requireWritableOwner();
  if (!(await allow("write", LIMITS.write, owner.id))) return { ok: false };

  await requestOwnerVerification(owner.id);
  revalidatePath("/owner");
  return { ok: true };
}

// Small one-tap actions used by buttons on the dashboard.
export async function confirmVacanciesAction(id: string) {
  const owner = await requireWritableOwner();
  if (!(await allow("write", LIMITS.write, owner.id))) return;

  // Verify ownership — confirmVacancies is scoped by ownerId.
  await confirmVacancies(owner.id, id);
  revalidatePath("/owner");
}

// Confirm a viewing request. Scoped to the owner's own listings in the DB layer.
export async function confirmViewingRequestAction(id: string): Promise<{ error?: string }> {
  const owner = await requireWritableOwner();
  if (!(await allow("write", LIMITS.write, owner.id))) return { error: RATE_LIMITED };

  const ok = await setViewingRequestStatus(owner.id, id, "CONFIRMED");
  if (!ok) return { error: "Request not found" };
  revalidatePath("/owner/requests");
  return {};
}

// Delete a viewing request the owner is done with. Scoped to their own listings.
export async function deleteViewingRequestAction(id: string): Promise<{ error?: string }> {
  const owner = await requireWritableOwner();
  if (!(await allow("write", LIMITS.write, owner.id))) return { error: RATE_LIMITED };

  const ok = await deleteViewingRequest(owner.id, id);
  if (!ok) return { error: "Request not found" };
  revalidatePath("/owner/requests");
  return {};
}

// Owners can submit for review (PENDING) or pull a listing back to DRAFT — but never
// publish. Publishing is an admin action.
export async function setStatusAction(
  id: string,
  status: "DRAFT" | "PENDING",
): Promise<{ error?: string }> {
  const owner = await requireWritableOwner();
  if (!(await allow("write", LIMITS.write, owner.id))) return { error: RATE_LIMITED };

  // Verify ownership before reading anything about the listing.
  const existing = await findOwnerListing(owner.id, id);
  if (!existing) return { error: "Listing not found" };

  // A listing needs enough photos before it can go up for review.
  if (status === "PENDING") {
    const photos = await countImages(id);
    if (photos < MIN_LISTING_PHOTOS) return { error: PHOTO_REQUIREMENT_MESSAGE };
  }

  const ok = await setListingStatus(owner.id, id, status);
  if (!ok) return { error: "Listing not found" };

  // Pulling a listing back to DRAFT drops it out of the public set; either direction
  // can leave the published/listing caches stale otherwise.
  await invalidate("listings:published", `listing:${existing.slug}`, `metrics:owner:${owner.id}`);
  if (status === "PENDING") {
    await notifyAdmins({
      type: "LISTING_REVIEW",
      title: "Listing submitted for review",
      body: `${existing.name} was submitted by ${owner.fullName}.`,
    });
  }

  revalidatePath("/owner");
  return {};
}
