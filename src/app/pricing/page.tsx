import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PricingBanner } from "@/components/pricing/PricingBanner";
import { PricingCard } from "@/components/pricing/PricingCard";
import { PricingComparison } from "@/components/pricing/PricingComparison";
import { PricingFAQ } from "@/components/pricing/PricingFAQ";
import { PricingCTA } from "@/components/pricing/PricingCTA";
import { PLANS } from "@/config/pricing";

export const metadata: Metadata = {
  title: "Pricing — Meino",
  description: "Meino's planned launch pricing. Free for everyone during our one-month beta.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <SiteHeader />
      <main className="mx-auto max-w-5xl space-y-12 px-4 py-10">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Simple pricing for owners
            </h1>
            <p className="mx-auto mt-2 max-w-xl text-muted">
              Plans built for boarding house owners near VSU. Everything is free right now — this is
              what pricing will look like after the beta.
            </p>
          </div>
          <PricingBanner />
        </div>

        {/* Pricing cards */}
        <section aria-label="Plans" className="grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </section>

        {/* Comparison */}
        <section className="space-y-4">
          <h2 className="text-center text-xl font-semibold tracking-tight text-ink">
            Compare plans
          </h2>
          <PricingComparison />
        </section>

        {/* FAQ */}
        <section className="space-y-4">
          <h2 className="text-center text-xl font-semibold tracking-tight text-ink">
            Frequently asked questions
          </h2>
          <PricingFAQ />
        </section>

        <PricingCTA />
      </main>
    </div>
  );
}
