import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";

export const metadata: Metadata = {
  title: "Terms & Conditions — Meino",
  description: "The terms of use and privacy summary for Meino.",
};

// ─────────────────────────────────────────────────────────────────────────────
//  EDIT YOUR TERMS HERE
//  This is the only file you need to change to update the Terms & Conditions.
//  Each { heading, body } item below becomes a numbered section on the page.
//  Add, remove, or reword freely — keep the shape the same.
//  Last updated date is shown to users, so bump it when you make changes.
// ─────────────────────────────────────────────────────────────────────────────
const LAST_UPDATED = "July 25, 2026";

const SECTIONS: { heading: string; body: string }[] = [
  {
    heading: "Acceptance of terms",
    body: "By creating an account or using Meino, you agree to these Terms & Conditions. If you do not agree, please do not create an account or use the service.",
  },
  {
    heading: "About Meino",
    body: "Meino is a platform that helps students near Visayas State University find boarding houses. We list properties provided by owners; we are not the landlord and are not a party to any rental agreement between a student and an owner.",
  },
  {
    heading: "Your account",
    body: "You are responsible for keeping your login details secure and for all activity under your account. Provide accurate information when signing up, and let us know if you believe your account has been used without your permission.",
  },
  {
    heading: "Listings and accuracy",
    body: "Owners are responsible for the accuracy of their listings, including prices, availability, and photos. Meino does not guarantee that any listing is current, accurate, or available, and you should confirm details directly with the owner before making any commitment or payment.",
  },
  {
    heading: "Reviews and conduct",
    body: "Reviews must reflect a genuine experience. You agree not to post content that is false, misleading, abusive, or unlawful, and not to misuse the platform (for example, spam, scraping, or attempting to gain unauthorized access).",
  },
  {
    heading: "Payments",
    body: "Any payment for a room is arranged directly between the student and the owner. Meino does not process rent payments and is not responsible for any transaction that happens off the platform.",
  },
  {
    heading: "Privacy",
    body: "We collect the information you provide when you sign up (such as your name and email) and basic activity needed to run the service, such as your saved listings. We do not sell your personal information. Contact us if you would like your account and data removed.",
  },
  {
    heading: "Limitation of liability",
    body: "Meino is provided on an \"as is\" basis. To the extent permitted by law, we are not liable for any loss or damage arising from your use of the service or from any dealing between students and owners.",
  },
  {
    heading: "Changes to these terms",
    body: "We may update these terms from time to time. Continued use of Meino after an update means you accept the revised terms.",
  },
  {
    heading: "Contact",
    body: "Questions about these terms? Reach us at the support email listed on our sign-in screens.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">Terms &amp; Conditions</h1>
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
