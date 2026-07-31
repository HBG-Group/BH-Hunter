import "server-only";
import { prisma } from "@/lib/db/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { removeListingPhoto } from "@/lib/storage/photos";
import { reportError } from "@/lib/security/errors";

// Permanently delete a user and everything tied to them. Every Profile relation uses
// onDelete: Cascade (listings → rooms/images/amenities/reviews/favorites/viewing
// requests/analytics, plus the user's own favorites/reviews/notifications/etc.), so a
// single profile delete clears the database atomically. Storage files and the Supabase
// auth user are cleaned up alongside it. Works for owners and students alike.
export async function deleteAccountCompletely(userId: string): Promise<void> {
  // Collect stored image URLs before the rows cascade away.
  const listings = await prisma.boardingHouse.findMany({
    where: { ownerId: userId },
    select: { images: { select: { url: true } } },
  });
  const imageUrls = listings.flatMap((listing) => listing.images.map((image) => image.url));

  // Atomic DB cleanup via cascade.
  await prisma.profile.delete({ where: { id: userId } });

  // Best-effort external cleanup — never throw once the database is already clean.
  for (const url of imageUrls) {
    try {
      await removeListingPhoto(url);
    } catch (error) {
      reportError("deleteAccount.photo", error);
    }
  }
  try {
    await createSupabaseAdminClient().auth.admin.deleteUser(userId);
  } catch (error) {
    reportError("deleteAccount.authUser", error);
  }
}
