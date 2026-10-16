import type { MetadataRoute } from "next";
import { serverSiteUrl } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  const base = serverSiteUrl() ?? "https://meino.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/owner", "/account", "/api", "/auth"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
