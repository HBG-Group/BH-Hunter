import Link from "next/link";
import { requireOwner } from "@/lib/auth/profile";
import { signOutAction } from "@/lib/auth/actions";

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

          <div className="flex items-center gap-4 text-sm">
            <span className="text-neutral-500">{owner.fullName}</span>
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
