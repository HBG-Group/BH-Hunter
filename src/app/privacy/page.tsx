import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ADMIN_CONTACT } from "@/config/support";

export const metadata: Metadata = {
  title: "Privacy Policy — Meino",
  description: "How Meino collects, stores, and protects your information.",
};

// ─────────────────────────────────────────────────────────────────────────────
//  EDIT YOUR PRIVACY POLICY HERE — same shape as src/app/terms/page.tsx.
//  Keep this aligned with the operational detail in docs/PRIVACY.md.
// ─────────────────────────────────────────────────────────────────────────────
const LAST_UPDATED = "August 2, 2026";

const SECTIONS: { heading: string; body: string }[] = [
  {
    heading: "Information we collect",
    body: "When you create an account we collect your name, email, and (optionally) phone number and avatar. Owners additionally provide listing details, photos, and contact information. Students who use the platform signed in generate activity data: favorites, reviews, viewing requests, and recently viewed listings.",
  },
  {
    heading: "Why we collect it",
    body: "We use this information to run the service: to show you relevant listings, let owners manage their properties, let students save and request viewings, and to keep the platform trustworthy through admin verification and moderation.",
  },
  {
    heading: "Authentication",
    body: "Sign-in is handled by Supabase Auth (email/password or Google). We never see or store your password — Supabase does, using industry-standard hashing. A session cookie keeps you signed in; it is essential and cannot be turned off without signing out.",
  },
  {
    heading: "Cookies",
    body: "Essential cookies keep you signed in and are always on. Optional cookies remember your search filters, recently viewed listings, and dismissed notices — these are only set once you accept the cookie banner. See our full Cookie Policy for details and how to change your choice at any time.",
  },
  {
    heading: "Storage",
    body: "Listing photos and advertisement images are stored in Supabase Storage. Uploads are validated for file type and size on the server, not just in the browser, before they're accepted.",
  },
  {
    heading: "Security",
    body: "We use row-level security on every database table, authorization checks on every write, signed upload tickets for photos, and an HTTPS-only allowlist for links rendered on the site. See our Security page for the full list of controls.",
  },
  {
    heading: "Account deletion",
    body: "You can permanently delete your account and its data at any time from Account → Privacy. Deletion removes your profile, and for owners, their listings, photos, and related records. Some records may be retained briefly in backups before they age out.",
  },
  {
    heading: "Data export",
    body: "You can download a copy of the application data tied to your account from Account → Privacy at any time before deleting it.",
  },
  {
    heading: "Data retention",
    body: "We keep your data while your account is active. If you delete your account, application-level records are removed immediately; backup retention follows our infrastructure provider's standard backup cycle.",
  },
  {
    heading: "Contact",
    body: `Questions about this policy or your data can be sent to ${ADMIN_CONTACT.email}.`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted">Last updated: {LAST_UPDATED}</p>

        <div className="mt-8 space-y-8">
          {SECTIONS.map((section, index) => (
            <section key={section.heading}>
              <h2 className="text-lg font-semibold text-ink">
                {index + 1}. {section.heading}
              </h2>
              <p className="mt-2 leading-relaxed text-muted">{section.body}</p>
            </section>
          ))}
        </div>

        <p className="mt-12 text-sm text-muted">
          <Link href="/" className="underline hover:text-ink">
            Back to Meino
          </Link>
        </p>
      </main>
    </div>
  );
}
