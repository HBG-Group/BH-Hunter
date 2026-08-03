import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db/prisma";
import { serverSiteUrl } from "@/config/site";

const STATIC_ROUTES = [
  "",
  "/about",
  "/pricing",
  "/terms",
  "/privacy",
  "/cookies",
  "/security",
  "/copyright",
  "/community-guidelines",
  "/contact",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = serverSiteUrl() ?? "https://meino.vercel.app";

  const listings = await prisma.boardingHouse.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
  });

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: `${base}${route}`,
      lastModified: new Date(),
    })),
    ...listings.map((listing) => ({
      url: `${base}/listings/${listing.slug}`,
      lastModified: listing.updatedAt,
    })),
  ];
}
