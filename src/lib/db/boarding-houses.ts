// Data-access layer: the ONLY place that talks to the database for boarding houses.
// Functions here return raw Prisma rows. Turning those rows into something the UI
// can use (availability, distance) is the service layer's job, not this file's.

import { prisma } from "@/lib/db/prisma";
import { cached } from "@/lib/cache/redis";

// Everything a listing needs, loaded in one query to avoid N+1 round trips.
const listingInclude = {
  rooms: true,
  images: { orderBy: { sortOrder: "asc" } },
  amenities: { include: { amenity: true } },
  nearbyPlaces: true,
  reviews: { select: { overall: true } },
  owner: { select: { fullName: true, verified: true, verifiedUntil: true } },
} as const;

// Also backs the homepage map's marker set — there's no separate "map markers" query,
// it's the same published-listings read, so one cache entry covers both (docs/CACHING.md).
export function findPublishedBoardingHouses() {
  return cached("listings:published", 300, () =>
    prisma.boardingHouse.findMany({
      where: { status: "PUBLISHED" },
      include: listingInclude,
      orderBy: { createdAt: "desc" },
    }),
  );
}

export function findBoardingHouseBySlug(slug: string) {
  return cached(`listing:${slug}`, 600, () =>
    prisma.boardingHouse.findFirst({
      where: { slug, status: "PUBLISHED" },
      include: listingInclude,
    }),
  );
}

// The row type produced by the queries above, so the service layer stays type-safe.
export type BoardingHouseWithRelations = Awaited<
  ReturnType<typeof findPublishedBoardingHouses>
>[number];
