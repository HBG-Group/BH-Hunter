import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/profile";
import { ProfileMenu } from "@/components/layout/ProfileMenu";
import { Logo } from "@/components/brand/Logo";
import { AdminLogin } from "@/components/admin/AdminLogin";

// Keep the admin area out of search engines.
export const metadata: Metadata = { robots: { index: false, follow: false } };

const navLinks = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/listings", label: "Listings" },
  { href: "/admin/owners", label: "Owners" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/ads", label: "Ads" },
  { href: "/admin/audit-log", label: "Audit log" },
];

// The whole /admin area is admin-only. A non-admin (signed out or wrong role) is shown
// the sign-in form in place of the dashboard, never the dashboard itself. Each page
// re-checks independently, so this is defence in depth, not the only gate.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  const isAdmin = profile?.role === "ADMIN";

  if (!isAdmin) {
    return <AdminLogin denied={profile !== null} />;
  }

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Logo href="/admin" label="Admin" />
            <nav className="flex items-center gap-4 text-sm text-neutral-600">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-neutral-900">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <ProfileMenu
            name={profile.fullName}
            avatarUrl={profile.avatarUrl}
            links={[
              { href: "/", label: "Back to site" },
              { href: "/admin", label: "Overview" },
            ]}
          />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
