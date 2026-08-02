import { ManageConsentButton } from "@/components/cookies/ManageConsentButton";

export const metadata = {
  title: "Cookie Policy — Meino",
};

export default function CookiePolicyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Cookie Policy</h1>
      <p className="mt-4 text-muted">
        Meino uses two kinds of cookies. Essential cookies keep you signed in and are managed by
        Supabase Auth — they&apos;re always on. Optional cookies remember things like your search
        filters, recently viewed listings, and which announcements you&apos;ve dismissed. They
        only get set once you accept the cookie banner.
      </p>
      <p className="mt-4 text-muted">
        We never store passwords, payment details, or other sensitive information in cookies —
        that data lives in our database, protected by row-level security and server-side
        authorization checks.
      </p>
      <p className="mt-4 text-muted">
        You can change your mind at any time. Resetting clears every optional cookie already set
        and brings the consent banner back on your next page view.
      </p>
      <ManageConsentButton />
    </div>
  );
}
