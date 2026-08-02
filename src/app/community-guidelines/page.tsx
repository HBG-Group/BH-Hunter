import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";

export const metadata: Metadata = {
  title: "Community Guidelines — Meino",
  description: "The rules that keep Meino trustworthy for students and owners.",
};

const LAST_UPDATED = "August 2, 2026";

const RULES: { heading: string; body: string }[] = [
  {
    heading: "Respect others",
    body: "Treat other students, owners, and admins the way you'd want to be treated. Disagreements happen — keep them civil.",
  },
  {
    heading: "No harassment",
    body: "Don't threaten, intimidate, or repeatedly target another person, whether in a review, a message, or a viewing request.",
  },
  {
    heading: "No scams",
    body: "Never ask for or send money outside of a legitimate rental agreement made directly with a verified owner. Meino does not process rent payments.",
  },
  {
    heading: "No hate speech or discrimination",
    body: "Content that attacks people based on identity, or listings that discriminate unlawfully, are not allowed.",
  },
  {
    heading: "No fake listings",
    body: "Listings must represent a real, available boarding house with accurate photos, pricing, and location. Misleading listings will be removed.",
  },
  {
    heading: "No fake reviews",
    body: "Reviews must reflect a genuine experience with the listing. Posting reviews for properties you haven't stayed at, or on behalf of someone else, is not allowed.",
  },
  {
    heading: "No spam",
    body: "Don't post repetitive, irrelevant, or promotional content unrelated to finding or listing a boarding house.",
  },
];

export default function CommunityGuidelinesPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">Community Guidelines</h1>
        <p className="mt-2 text-sm text-muted">Last updated: {LAST_UPDATED}</p>
        <p className="mt-4 leading-relaxed text-muted">
          Meino only works if students and owners can trust what they see. These are the ground
          rules for everyone using the platform.
        </p>

        <div className="mt-8 space-y-8">
          {RULES.map((rule, index) => (
            <section key={rule.heading}>
              <h2 className="text-lg font-semibold text-ink">
                {index + 1}. {rule.heading}
              </h2>
              <p className="mt-2 leading-relaxed text-muted">{rule.body}</p>
            </section>
          ))}
        </div>

        <section className="mt-10 rounded-xl border border-line bg-white p-5">
          <h2 className="text-lg font-semibold text-ink">Consequences</h2>
          <p className="mt-2 leading-relaxed text-muted">
            Violating these guidelines can result in content removal, a review-message warning, a
            temporary account freeze, or permanent removal from Meino, depending on severity. You
            can report a listing, review, owner, or student that breaks these rules — see our{" "}
            <Link href="/contact" className="text-primary underline hover:text-primary-hover">
              Contact page
            </Link>{" "}
            or use the Report action where it appears in the product.
          </p>
        </section>

        <p className="mt-12 text-sm text-muted">
          <Link href="/" className="underline hover:text-ink">
            Back to Meino
          </Link>
        </p>
      </main>
    </div>
  );
}
