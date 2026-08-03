// Subtle reminder that the owner area is in a free trial/beta period.
// Not tied to a real date field yet — just a heads-up while we validate the product.
export function OwnerBetaNotice() {
  return (
    <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-center text-xs text-amber-800">
      You&apos;re using Meino in <span className="font-medium">beta</span> — everything is free and
      unlocked while we test the platform. This runs for about a month, after which you may need to
      review your plan.
    </p>
  );
}
