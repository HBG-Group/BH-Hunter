// Replaces placeholder demo photos with believable themed images and tops each
// listing up to the required minimum. Real uploaded photos are left untouched.
//
// Usage: npx tsx scripts/refresh-demo-photos.ts

import { PrismaClient } from "@prisma/client";
import { MIN_LISTING_PHOTOS } from "../src/config/listing";

const prisma = new PrismaClient();

const THEMES = ["bedroom", "house", "kitchen", "bathroom", "apartment"];
const photoUrl = (theme: string, lock: number) =>
  `https://loremflickr.com/1200/800/${theme}?lock=${lock}`;

async function main() {
  const listings = await prisma.boardingHouse.findMany({
    select: { id: true, name: true },
    orderBy: { createdAt: "asc" },
  });

  for (const [index, listing] of listings.entries()) {
    // Drop only placeholder images; keep anything genuinely uploaded.
    const removed = await prisma.image.deleteMany({
      where: { boardingHouseId: listing.id, url: { contains: "picsum.photos" } },
    });

    const remaining = await prisma.image.count({ where: { boardingHouseId: listing.id } });
    const needed = Math.max(0, MIN_LISTING_PHOTOS - remaining);

    if (needed > 0) {
      await prisma.image.createMany({
        data: Array.from({ length: needed }, (_, i) => ({
          boardingHouseId: listing.id,
          url: photoUrl(THEMES[i % THEMES.length], index * 10 + i + 1),
          alt: `${listing.name} — ${THEMES[i % THEMES.length]}`,
          sortOrder: remaining + i,
        })),
      });
    }

    const total = await prisma.image.count({ where: { boardingHouseId: listing.id } });
    console.log(`${listing.name}: removed ${removed.count} placeholder, added ${needed} → ${total} photos`);
  }
}

main()
  .catch((e) => console.error((e as Error).message))
  .finally(() => prisma.$disconnect());
