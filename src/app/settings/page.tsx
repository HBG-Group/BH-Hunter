import Link from "next/link";
import { requireProfile } from "@/lib/auth/profile";
import { revokeOtherSessionsAction } from "@/lib/account/actions";
import { signOutAction } from "@/lib/auth/actions";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ProfileSettingsForm } from "@/components/account/ProfileSettingsForm";

export default async function SettingsPage() {
  const profile = await requireProfile("/settings");
  const backHref =
    profile.role === "OWNER"
      ? "/owner"
      : profile.role === "ADMIN"
        ? "/admin"
        : "/account";
  return (
    <div className="min-h-screen bg-canvas">
      <SiteHeader />
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <Link
          href={backHref}
          className="inline-flex min-h-11 items-center text-sm text-primary underline"
        >
          ← Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-ink">
            Account &amp; settings
          </h1>
          <p className="mt-1 text-sm text-muted">
            Manage your profile, security, privacy, and support options.
          </p>
        </div>
        <ProfileSettingsForm
          fullName={profile.fullName}
          phone={profile.phone}
        />
        <section className="space-y-3 rounded-2xl border border-line bg-white p-5">
          <h2 className="font-semibold text-ink">Sign-in and sessions</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/account/password"
              className="inline-flex min-h-11 items-center rounded-xl px-4 text-sm ring-1 ring-inset ring-line"
            >
              Change password
            </Link>
            <form action={revokeOtherSessionsAction}>
              <button className="min-h-11 rounded-xl px-4 text-sm ring-1 ring-inset ring-line">
                Sign out other sessions
              </button>
            </form>
            <form action={signOutAction}>
              <button className="min-h-11 rounded-xl px-4 text-sm ring-1 ring-inset ring-line">
                Sign out this device
              </button>
            </form>
          </div>
        </section>
        <section className="grid gap-3 sm:grid-cols-2">
          {profile.role === "STUDENT" && (
            <Link
              href="/account#favorites"
              className="rounded-2xl border border-line bg-white p-5 hover:border-neutral-300"
            >
              <span className="font-semibold text-ink">Saved listings</span>
              <span className="mt-1 block text-sm text-muted">
                Review and compare the places you saved.
              </span>
            </Link>
          )}
          <Link
            href="/account/privacy"
            className="rounded-2xl border border-line bg-white p-5 hover:border-neutral-300"
          >
            <span className="font-semibold text-ink">Privacy and data</span>
            <span className="mt-1 block text-sm text-muted">
              Export data or delete your account.
            </span>
          </Link>
          <Link
            href="/cookies#manage"
            className="rounded-2xl border border-line bg-white p-5 hover:border-neutral-300"
          >
            <span className="font-semibold text-ink">Cookie preferences</span>
            <span className="mt-1 block text-sm text-muted">
              Review or reset optional cookies.
            </span>
          </Link>
          <Link
            href="/contact"
            className="rounded-2xl border border-line bg-white p-5 hover:border-neutral-300"
          >
            <span className="font-semibold text-ink">Help and support</span>
            <span className="mt-1 block text-sm text-muted">
              Contact the Meino team.
            </span>
          </Link>
          <Link
            href={
              profile.role === "OWNER"
                ? "/owner/requests"
                : "/account#notifications"
            }
            className="rounded-2xl border border-line bg-white p-5 hover:border-neutral-300"
          >
            <span className="font-semibold text-ink">Role preferences</span>
            <span className="mt-1 block text-sm text-muted">
              Manage requests and notifications.
            </span>
          </Link>
        </section>
      </main>
    </div>
  );
}
