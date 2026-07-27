import type { Metadata } from "next";
// Self-hosted Geist (no build-time Google Fonts fetch).
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { AuthModalProvider } from "@/components/auth/AuthModalProvider";
import { RouteProgress } from "@/components/system/RouteProgress";
import { TermsGate } from "@/components/system/TermsGate";
import { Watermark } from "@/components/system/Watermark";
import { BugReporter } from "@/components/system/BugReporter";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meino — Find your place near VSU",
  description:
    "Meino helps Visayas State University students find a boarding house that feels like home. Every option on one map, with real vacancies and honest walk times.",
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
        <TermsGate />
        <AuthModalProvider>{children}</AuthModalProvider>
        <Watermark />
        <BugReporter />
      </body>
    </html>
  );
}
