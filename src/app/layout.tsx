import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthModalProvider } from "@/components/auth/AuthModalProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthModalProvider>{children}</AuthModalProvider>
      </body>
    </html>
  );
}
