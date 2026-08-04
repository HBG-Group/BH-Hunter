import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ADMIN_CONTACT } from "@/config/support";

export const metadata: Metadata = {
  title: "Contact Us — Meino",
  description: "Reach the Meino team for support, business, or bug reports.",
};

const CHANNELS = [
  {
    title: "General questions",
    body: "Anything about using Meino as a student or an owner.",
    href: `mailto:${ADMIN_CONTACT.email}?subject=General question`,
    label: ADMIN_CONTACT.email,
  },
  {
    title: "Support",
    body: "Trouble with your account, a listing, or a viewing request.",
    href: `mailto:${ADMIN_CONTACT.email}?subject=Support request`,
    label: ADMIN_CONTACT.email,
  },
  {
    title: "Business",
    body: "Partnerships, advertising, or anything else business-related.",
    href: `mailto:${ADMIN_CONTACT.email}?subject=Business inquiry`,
    label: ADMIN_CONTACT.email,
  },
  {
    title: "Bug reports",
    body: "Found something broken? Tell us what happened and how to reproduce it.",
    href: `mailto:${ADMIN_CONTACT.email}?subject=Bug report`,
    label: ADMIN_CONTACT.email,
  },
];

const FAQ: { question: string; answer: string }[] = [
  {
    question: "Is Meino free to use?",
    answer:
      "Yes. Meino is currently in free beta for both students and owners. See our Pricing page for planned launch pricing.",
  },
  {
    question: "How do I report a fake listing or a scam?",
    answer:
      "Email us with the listing link and what happened, and we'll take a look.",
  },
  {
    question: "How do I delete my account?",
    answer: "Go to Account → Privacy and use the account deletion option. This is permanent.",
  },
  {
    question: "How does the Verified Owner badge work?",
    answer:
      "Owners can request verification from their dashboard. An admin reviews the request and approves or rejects it.",
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">Contact Us</h1>
        <p className="mt-3 leading-relaxed text-muted">
          We&apos;re a small team — reach out and we&apos;ll get back to you.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {CHANNELS.map((channel) => (
            <a
              key={channel.title}
              href={channel.href}
              className="rounded-2xl border border-line bg-white p-4 transition hover:border-primary/40"
            >
              <p className="font-medium text-ink">{channel.title}</p>
              <p className="mt-1 text-sm text-muted">{channel.body}</p>
              <p className="mt-2 text-sm text-primary underline">{channel.label}</p>
            </a>
          ))}
        </div>

        <section className="mt-10 rounded-2xl border border-line bg-white p-5">
          <h2 className="text-lg font-semibold text-ink">Other ways to reach us</h2>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            <li>
              Phone / SMS:{" "}
              <a href={`tel:${ADMIN_CONTACT.phone}`} className="text-primary underline">
                {ADMIN_CONTACT.phone}
              </a>
            </li>
            <li>
              Messenger:{" "}
              <a href={ADMIN_CONTACT.messenger} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                Message us
              </a>
            </li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-ink">Frequently asked questions</h2>
          <div className="mt-4 space-y-5">
            {FAQ.map((item) => (
              <div key={item.question}>
                <p className="font-medium text-ink">{item.question}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{item.answer}</p>
              </div>
            ))}
          </div>
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
