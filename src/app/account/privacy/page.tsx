import type { Metadata } from "next";
import Link from "next/link";
import { requireProfile } from "@/lib/auth/profile";
import { deleteMyAccountAction } from "@/lib/account/privacy-actions";
import { SiteHeader } from "@/components/layout/SiteHeader";

export const metadata: Metadata = {
  title: "Privacy Controls | Meino",
  description: "Export your account data or delete your Meino account.",
};

export default async function AccountPrivacyPage() {
  const profile = await requireProfile("/account/privacy");
  const backHref = profile.role === "OWNER" ? "/owner" : "/account";

  return (
    <div className="min-h-screen bg-canvas">
      <SiteHeader />
      <main className="mx-auto max-w-3xl space-y-8 px-4 py-10">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Privacy controls</h1>
          <p className="text-sm text-neutral-600">
            Export the account data tied to your profile or permanently delete your account.
          </p>
        </div>

        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-neutral-900">Export your data</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Download a JSON export of your profile, listings, favorites, reviews, requests, and related
            account records currently stored by the application.
          </p>
          <Link
            href="/account/privacy/export"
            className="mt-4 inline-flex rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            Download export
          </Link>
        </section>

        <section className="rounded-2xl border border-red-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-red-700">Delete your account</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            This permanently removes your profile and application data. Owner listings and their related
            records will also be deleted.
          </p>
          <form action={deleteMyAccountAction} className="mt-4">
            <button
              type="submit"
              className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
            >
              Delete my account
            </button>
          </form>
        </section>

        <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
          <Link href={backHref} className="underline hover:text-neutral-900">
            Back
          </Link>
          <Link href="/terms" className="underline hover:text-neutral-900">
            Terms and privacy summary
          </Link>
          <Link href="/security" className="underline hover:text-neutral-900">
            Security disclosures
          </Link>
        </div>
      </main>
    </div>
  );
}
