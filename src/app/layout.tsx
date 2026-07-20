import type { Metadata } from "next";
// Self-hosted Geist (no build-time Google Fonts fetch).
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { AuthModalProvider } from "@/components/auth/AuthModalProvider";
import { RouteProgress } from "@/components/system/RouteProgress";
import "./globals.css";

export const metadata: Metadata = {
  title: "BH Hunter — Boarding houses near VSU",
  description:
    "Discover available boarding houses around Visayas State University. Compare prices, check vacancies, and see the walk to campus on an interactive map.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <RouteProgress />
        <AuthModalProvider>{children}</AuthModalProvider>
      </body>
    </html>
  );
}
