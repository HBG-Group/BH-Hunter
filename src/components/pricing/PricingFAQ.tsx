// FAQ content — edit freely. Native <details> gives keyboard + screen-reader support.
const FAQS: { q: string; a: string }[] = [
  {
    q: "How long is one semester?",
    a: "A semester is roughly five months, matching VSU's academic calendar. Plans are billed per semester when pricing launches.",
  },
  {
    q: "When will pricing begin?",
    a: "Pricing takes effect only after our one-month free beta ends. We'll announce the exact date well in advance.",
  },
  {
    q: "Will existing beta users lose access?",
    a: "No. Everything you set up during the beta stays. When pricing begins you'll simply choose a plan to keep premium perks.",
  },
  {
    q: "Can I upgrade my plan later?",
    a: "Yes. Once plans are live you'll be able to move between Basic, Advance, and Premium at any time.",
  },
  {
    q: "What happens if I exceed my free listings?",
    a: "During the beta nothing is limited. After launch, extra listings will cost a small per-listing fee shown on each plan.",
  },
];

export function PricingFAQ() {
  return (
    <div className="space-y-3">
      {FAQS.map((faq) => (
        <details
          key={faq.q}
          className="group rounded-2xl border border-line bg-white p-4 transition-colors hover:border-neutral-300"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-ink">
            {faq.q}
            <span className="ml-2 text-muted transition-transform group-open:rotate-45">+</span>
          </summary>
          <p className="mt-2 text-sm text-muted">{faq.a}</p>
        </details>
      ))}
    </div>
  );
}
