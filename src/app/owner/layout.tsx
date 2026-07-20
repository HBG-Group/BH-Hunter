import Link from "next/link";
import { requireOwner } from "@/lib/auth/profile";
import { ProfileMenu } from "@/components/layout/ProfileMenu";

// Every /owner page shares this shell. requireOwner here means the whole area is
// protected in one place (the middleware guards it too, as defence in depth).
export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const owner = await requireOwner();

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/owner" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-900 text-sm font-bold text-white">
              BH
            </span>
            <span className="font-semibold tracking-tight">Owner dashboard</span>
          </Link>

          <ProfileMenu
            name={owner.fullName}
            avatarUrl={owner.avatarUrl}
            links={[
              { href: "/", label: "Back to site" },
              { href: "/owner", label: "My listings" },
              { href: "/owner/requests", label: "Viewing requests" },
            ]}
          />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
