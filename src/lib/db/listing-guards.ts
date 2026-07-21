// Shared existence/visibility checks. Student-facing writes take a listing id from
// the client, so every one of them must confirm the listing is real and public
// before touching the database — otherwise an invented id reaches a foreign key.

import { prisma } from "@/lib/db/prisma";

export async function listingExists(id: string): Promise<boolean> {
  if (typeof id !== "string" || id === "" || id.length > 64) return false;
  const row = await prisma.boardingHouse.findUnique({ where: { id }, select: { id: true } });
  return row !== null;
}

// Only published listings can be favorited, reviewed, or booked for a viewing.
export async function publishedListingExists(id: string): Promise<boolean> {
  if (typeof id !== "string" || id === "" || id.length > 64) return false;
  const row = await prisma.boardingHouse.findFirst({
    where: { id, status: "PUBLISHED" },
    select: { id: true },
  });
  return row !== null;
}
