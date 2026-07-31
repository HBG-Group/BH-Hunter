// The beta announcement at the top of the pricing page — noticeable but calm.
export function PricingBanner() {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center sm:p-5">
      <p className="text-sm font-semibold text-emerald-900">
        🧪 Meino is currently in Free Beta
      </p>
      <p className="mx-auto mt-1 max-w-2xl text-sm text-emerald-800">
        All features are completely free during our one-month testing period. The pricing below
        represents our planned launch pricing after the beta ends.
      </p>
    </div>
  );
}
