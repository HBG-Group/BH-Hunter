import Link from "next/link";
import { PricingBadge } from "./PricingBadge";
import type { Plan, PlanTheme } from "@/config/pricing";

// Static class strings per theme so Tailwind can see them at build time.
const THEMES: Record<PlanTheme, { ring: string; accent: string; button: string; check: string }> = {
  blue: {
    ring: "hover:ring-blue-300",
    accent: "text-blue-600",
    button: "bg-blue-600 hover:bg-blue-700",
    check: "text-blue-500",
  },
  purple: {
    ring: "ring-purple-300 hover:ring-purple-400",
    accent: "text-purple-600",
    button: "bg-purple-600 hover:bg-purple-700",
    check: "text-purple-500",
  },
  gold: {
    ring: "hover:ring-amber-300",
    accent: "text-amber-600",
    button: "bg-amber-500 hover:bg-amber-600",
    check: "text-amber-500",
  },
};

// A single SaaS-style plan card with a gentle lift on hover. The button starts the
// GCash subscription flow (owner-only — the pricing page is gated to owners).
export function PricingCard({ plan }: { plan: Plan }) {
  const theme = THEMES[plan.theme];

  return (
    <div
      className={`relative flex flex-col rounded-2xl border border-line bg-white p-6 shadow-sm ring-1 ring-transparent transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${theme.ring} ${
        plan.popular ? "ring-purple-300 lg:scale-[1.03]" : ""
      }`}
    >
      {plan.popular && <PricingBadge label="Most Popular" />}

      <h3 className={`text-lg font-semibold ${theme.accent}`}>{plan.name}</h3>
      <p className="mt-0.5 text-sm text-muted">{plan.target}</p>

      <div className="mt-4">
        <span className="text-3xl font-bold text-ink">₱{plan.price}</span>
        <span className="text-sm text-muted"> / {plan.period}</span>
      </div>

      <ul className="mt-5 flex-1 space-y-2.5">
        {plan.features.map((feature) => (
          <li key={feature.label} className="flex items-start gap-2 text-sm text-ink">
            <svg className={`mt-0.5 h-4 w-4 shrink-0 ${theme.check}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-7 7a1 1 0 0 1-1.4 0l-3-3a1 1 0 1 1 1.4-1.4l2.3 2.29 6.3-6.29a1 1 0 0 1 1.4 0z" clipRule="evenodd" />
            </svg>
            {feature.label}
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs text-muted">
        Additional listings: <span className="font-medium text-ink">₱{plan.extraListingPrice} each</span>
      </p>

      <Link
        href={`/subscribe/${plan.id}`}
        className={`mt-4 block w-full rounded-xl py-2.5 text-center text-sm font-medium text-white transition-colors ${theme.button}`}
      >
        Subscribe
      </Link>
    </div>
  );
}
