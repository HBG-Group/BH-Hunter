import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // We access the dev server through a VS Code Dev Tunnel, whose host differs from
  // localhost. Server Actions reject cross-origin requests by default (CSRF guard),
  // so we explicitly trust the tunnel domain during development.
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "*.devtunnels.ms"],
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
};

export default nextConfig;
