import type { NextConfig } from "next";
import { securityHeaders } from "@/lib/security/headers";

const isProduction = process.env.NODE_ENV === "production";
const devTunnelHost = process.env.DEV_TUNNEL_HOST?.trim();

const allowedOrigins = ["localhost:3000"];
if (!isProduction && devTunnelHost) {
  allowedOrigins.push(devTunnelHost);
}

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins,
      bodySizeLimit: "256kb",
    },
  },
  images: {
    // Serve modern formats where the browser supports them; Next negotiates and falls
    // back to the original automatically.
    formats: ["image/avif", "image/webp"],
    // Hosts we load listing photos from. Add real storage/CDN hosts here later.
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
      // Supabase Storage public URLs for uploaded listing photos.
      { protocol: "https", hostname: "*.supabase.co" },
      // Google account profile photos (from OAuth sign-in).
      { protocol: "https", hostname: "*.googleusercontent.com" },
      // Themed demo photos used by the seed data.
      { protocol: "https", hostname: "loremflickr.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders(isProduction),
      },
    ];
  },
};

export default nextConfig;
