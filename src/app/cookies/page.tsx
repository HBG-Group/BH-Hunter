import { ManageConsentButton } from "@/components/cookies/ManageConsentButton";

export const metadata = {
  title: "Cookie Policy — Meino",
};

export default function CookiePolicyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        Cookie Policy
      </h1>
      <p className="mt-4 text-muted">
        Meino uses essential and optional cookies. You choose which optional
        categories to allow the first time you visit, using Accept, Reject, or
        Customize on the cookie banner.
      </p>

      <div className="mt-6 space-y-4">
        <section>
          <h2 className="text-sm font-semibold text-ink">Essential</h2>
          <p className="mt-1 text-sm text-muted">
            Keeps you signed in. Managed by Supabase Auth — always on, and not
            covered by the cookie banner since the site can&apos;t function
            without it.
          </p>
        </section>
        <section>
          <h2 className="text-sm font-semibold text-ink">Preferences</h2>
          <p className="mt-1 text-sm text-muted">
            Remembers UI comfort settings: theme, sidebar state, language, map
            style.
          </p>
        </section>
        <section>
          <h2 className="text-sm font-semibold text-ink">Activity</h2>
          <p className="mt-1 text-sm text-muted">
            Remembers your search filters, recently viewed listings, and which
            announcements you&apos;ve dismissed, so the site picks up where you
            left off.
          </p>
        </section>
        <section>
          <h2 className="text-sm font-semibold text-ink">Analytics (future)</h2>
          <p className="mt-1 text-sm text-muted">
            Meino doesn&apos;t currently set any analytics or advertising
            cookies. If that changes, it will be added here as its own category
            and covered by the consent banner before it&apos;s ever set.
          </p>
        </section>
      </div>

      <p className="mt-6 text-muted">
        We never store passwords, payment details, or other sensitive
        information in cookies — that data lives in our database, protected by
        row-level security and server-side authorization checks.
      </p>
      <p className="mt-4 text-muted">
        You can change your mind at any time. Resetting clears every optional
        cookie already set and brings the consent banner back on your next page
        view, where you can Accept, Reject, or Customize again.
      </p>
      <div id="manage" className="scroll-mt-6">
        <ManageConsentButton />
      </div>
    </div>
  );
}
