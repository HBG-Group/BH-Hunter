import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { requireOwner } from "@/lib/auth/profile";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PaymentForm } from "@/components/subscribe/PaymentForm";
import { PLANS } from "@/config/pricing";
import { GCASH_NAME, GCASH_NUMBER, GCASH_QR_SRC } from "@/config/gcash";

export const metadata: Metadata = {
  title: "Subscribe — Meino",
};

interface PageProps {
  params: Promise<{ plan: string }>;
}

export default async function SubscribePage({ params }: PageProps) {
  // Owner-only; requireOwner redirects guests/students to login.
  await requireOwner();

  const { plan: planId } = await params;
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan) notFound();

  return (
    <div className="min-h-screen bg-canvas">
      <SiteHeader />
      <main className="mx-auto max-w-3xl space-y-8 px-4 py-10">
        <div>
          <Link href="/pricing" className="text-sm text-muted hover:text-ink">
            ← Back to plans
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Subscribe to {plan.name}
          </h1>
          <p className="mt-1 text-muted">
            Pay via GCash, then submit your receipt below. We&apos;ll review and activate your
            subscription — you&apos;ll get an email once it&apos;s approved.
          </p>
        </div>

        <section className="grid gap-6 md:grid-cols-2">
          {/* Amount + QR */}
          <div className="rounded-2xl border border-line bg-white p-6 text-center">
            <p className="text-sm text-muted">Amount to pay</p>
            <p className="mt-1 text-3xl font-bold text-ink">
              ₱{plan.price}
              <span className="text-sm font-normal text-muted"> / {plan.period}</span>
            </p>

            <div className="mx-auto mt-4 flex h-56 w-56 items-center justify-center overflow-hidden rounded-xl border border-line bg-neutral-50">
              <Image
                src={GCASH_QR_SRC}
                alt={`GCash QR code for ${GCASH_NAME}`}
                width={224}
                height={224}
                className="h-full w-full object-contain"
              />
            </div>

            <div className="mt-4 text-sm text-ink">
              <p className="font-medium">{GCASH_NAME}</p>
              <p className="text-muted">{GCASH_NUMBER}</p>
            </div>
          </div>

          {/* Submit proof */}
          <div className="rounded-2xl border border-line bg-white p-6">
            <h2 className="text-lg font-semibold text-ink">Submit your payment</h2>
            <p className="mt-1 text-sm text-muted">
              After paying, fill this in so we can match your payment.
            </p>
            <PaymentForm planId={plan.id} />
          </div>
        </section>
      </main>
    </div>
  );
}
