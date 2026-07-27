import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";

export const metadata: Metadata = {
  title: "Security | Meino",
  description: "Security disclosure and incident-response information for Meino.",
};

const sections = [
  {
    title: "Report a vulnerability",
    body: "Use the repository security advisory flow when possible. If that is not available, open a private coordination channel through the repository maintainers before publishing details.",
  },
  {
    title: "Scope",
    body: "Reports should focus on vulnerabilities affecting authentication, authorization, uploads, listings, reviews, privacy controls, storage access, or administrative workflows.",
  },
  {
    title: "What to include",
    body: "Share clear reproduction steps, impact, affected URLs or routes, required privileges, and any proof-of-concept material that helps verify the issue quickly.",
  },
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">Security</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          This page summarizes the repository disclosure policy and links to the fuller process documents
          kept in version control.
        </p>

        <div className="mt-8 space-y-8">
          {sections.map((section, index) => (
            <section key={section.title}>
              <h2 className="text-lg font-semibold text-ink">
                {index + 1}. {section.title}
              </h2>
              <p className="mt-2 leading-relaxed text-muted">{section.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-10 space-y-2 text-sm text-muted">
          <p>
            Advisory intake:
            {" "}
            <Link
              href="https://github.com/HBG-Group/BH-Hunter/security/advisories/new"
              className="underline hover:text-ink"
            >
              GitHub security advisory
            </Link>
          </p>
          <p>
            Repository policy:
            {" "}
            <Link href="https://github.com/HBG-Group/BH-Hunter" className="underline hover:text-ink">
              HBG-Group/BH-Hunter
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
