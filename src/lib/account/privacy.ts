import "server-only";
import { prisma } from "@/lib/db/prisma";

export async function exportAccountData(profileId: string) {
  const profile = await prisma.profile.findUnique({
    where: { id: profileId },
    include: {
      boardingHouses: {
        include: {
          amenities: { include: { amenity: true } },
          images: true,
          nearbyPlaces: true,
          reviews: true,
          rooms: true,
          viewingRequests: true,
        },
      },
      favorites: { include: { boardingHouse: true } },
      notificationPreference: true,
      notifications: true,
      recentlyViewed: { include: { boardingHouse: true } },
      reviews: { include: { boardingHouse: true } },
      subscription: true,
      viewingRequests: { include: { boardingHouse: true } },
    },
  });

  return {
    exportedAt: new Date().toISOString(),
    profile,
  };
}

export async function ownedListingPhotoUrls(profileId: string): Promise<string[]> {
  const listings = await prisma.boardingHouse.findMany({
    where: { ownerId: profileId },
    select: { images: { select: { url: true } } },
  });
  return listings.flatMap((listing) => listing.images.map((image) => image.url));
}

export async function deleteAccountData(profileId: string): Promise<void> {
  await prisma.profile.delete({ where: { id: profileId } });
}
