import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ADMIN_CONTACT } from "@/config/support";

export const metadata: Metadata = {
  title: "Copyright & Content Removal — Meino",
  description: "How to request removal of content you believe infringes your rights.",
};

const LAST_UPDATED = "August 2, 2026";

export default function CopyrightPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">
          Copyright &amp; Content Removal Policy
        </h1>
        <p className="mt-2 text-sm text-muted">Last updated: {LAST_UPDATED}</p>
        <p className="mt-4 leading-relaxed text-muted">
          Meino respects intellectual property rights. If you believe content on Meino — a photo,
          a piece of text, or other material — infringes your copyright or was posted without your
          permission, you can request its removal.
        </p>

        <div className="mt-8 space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-ink">1. Required information</h2>
            <p className="mt-2 leading-relaxed text-muted">
              To process a request, include: (a) identification of the copyrighted work or content
              you believe is being infringed, (b) the exact URL or listing where the content
              appears on Meino, (c) your contact information, and (d) a statement that you have a
              good-faith belief the use is unauthorized.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-ink">2. Contact process</h2>
            <p className="mt-2 leading-relaxed text-muted">
              Send removal requests to{" "}
              <a href={`mailto:${ADMIN_CONTACT.email}`} className="text-primary underline hover:text-primary-hover">
                {ADMIN_CONTACT.email}
              </a>
              , or use the report action on the listing directly if it&apos;s available.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-ink">3. Review process</h2>
            <p className="mt-2 leading-relaxed text-muted">
              We review each request and, where warranted, remove or disable access to the
              reported content while we investigate. We may contact the person who posted the
              content for more information.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-ink">4. Counter-notification</h2>
            <p className="mt-2 leading-relaxed text-muted">
              If your content was removed and you believe this was a mistake or misidentification,
              you can reply to the same contact address with an explanation and any evidence that
              you have the right to post the content. We will review counter-notifications in good
              faith before deciding whether to restore the content.
            </p>
          </section>
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
