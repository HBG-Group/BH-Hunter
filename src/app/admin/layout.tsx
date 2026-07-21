import Link from "next/link";
import { requireAdmin } from "@/lib/auth/profile";
import { ProfileMenu } from "@/components/layout/ProfileMenu";
import { Logo } from "@/components/brand/Logo";

const navLinks = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/listings", label: "Listings" },
  { href: "/admin/reviews", label: "Reviews" },
];

// The whole /admin area is admin-only, enforced once here (and by the proxy guard).
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

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
            name={admin.fullName}
            avatarUrl={admin.avatarUrl}
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
