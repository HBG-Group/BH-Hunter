import type { Metadata } from "next";
import { getCurrentProfile } from "@/lib/auth/profile";
import { ProfileMenu } from "@/components/layout/ProfileMenu";
import { Logo } from "@/components/brand/Logo";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminNotifications } from "@/components/admin/AdminNotifications";
import { findAdminNotifications } from "@/lib/db/admin-notifications";
import { PUBLIC_SITE_HOMEPAGE } from "@/config/site";

// Keep the admin area out of search engines.
export const metadata: Metadata = { robots: { index: false, follow: false } };

// The whole /admin area is admin-only. A non-admin (signed out or wrong role) is shown
// the sign-in form in place of the dashboard, never the dashboard itself. Each page
// re-checks independently, so this is defence in depth, not the only gate.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  const isAdmin = profile?.role === "ADMIN";

  if (!isAdmin) {
    return <AdminLogin denied={profile !== null} />;
  }

  const notifications = await findAdminNotifications(profile.id);

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-6">
            <Logo href="/admin" label="Admin" />
            <AdminNav />
          </div>
          <div className="flex items-center gap-1">
            <AdminNotifications notifications={notifications.map((notification) => ({
              ...notification,
              createdAt: notification.createdAt.toISOString(),
              readAt: notification.readAt?.toISOString() ?? null,
            }))} />
            <ProfileMenu
              name={profile.fullName}
              avatarUrl={profile.avatarUrl}
              links={[
                { href: PUBLIC_SITE_HOMEPAGE, label: "Back to site" },
                { href: "/admin", label: "Overview" },
              ]}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
