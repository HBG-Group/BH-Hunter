// A small pill badge (e.g. "Most Popular") that sits on top of a pricing card.
export function PricingBadge({ label }: { label: string }) {
  return (
    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-purple-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
      {label}
    </span>
  );
}
