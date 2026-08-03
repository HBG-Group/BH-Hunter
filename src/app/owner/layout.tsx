import { requireOwner } from "@/lib/auth/profile";
import { ProfileMenu } from "@/components/layout/ProfileMenu";
import { Logo } from "@/components/brand/Logo";
import { OwnerFrozenNotice } from "@/components/owner/OwnerFrozenNotice";
import { OwnerBetaNotice } from "@/components/owner/OwnerBetaNotice";

// Every /owner page shares this shell. requireOwner here means the whole area is
// protected in one place (the middleware guards it too, as defence in depth).
export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const owner = await requireOwner();

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Logo href="/owner" label="Owner" />

          <ProfileMenu
            name={owner.fullName}
            avatarUrl={owner.avatarUrl}
            links={[
              { href: "/", label: "Back to site" },
              { href: "/owner", label: "My listings" },
              { href: "/owner/requests", label: "Viewing requests" },
              { href: "/settings", label: "Account settings" },
            ]}
          />
        </div>
      </header>

      {/* Frozen owners keep the shell (so they can sign out) but lose all management. */}
      <main className="mx-auto max-w-5xl px-4 py-6">
        {owner.frozen ? (
          <OwnerFrozenNotice />
        ) : (
          <>
            <OwnerBetaNotice />
            {children}
          </>
        )}
      </main>
    </div>
  );
}
