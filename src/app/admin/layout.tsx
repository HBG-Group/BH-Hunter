import Link from "next/link";
import { requireAdmin } from "@/lib/auth/profile";
import { signOutAction } from "@/lib/auth/actions";

const navLinks = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/listings", label: "Listings" },
  { href: "/admin/reviews", label: "Reviews" },
];

// The whole /admin area is admin-only, enforced once here (and by the proxy guard).
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-900 text-sm font-bold text-white">
                BH
              </span>
              <span className="font-semibold tracking-tight">Admin</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm text-neutral-600">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-neutral-900">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <span className="text-neutral-500">{admin.fullName}</span>
            <form action={signOutAction}>
              <button className="text-neutral-500 hover:text-neutral-900">Sign out</button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
