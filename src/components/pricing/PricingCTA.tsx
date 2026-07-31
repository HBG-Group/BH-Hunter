import Link from "next/link";

// Bottom call-to-action — sends owners to the sign-up flow (still free during beta).
export function PricingCTA() {
  return (
    <div className="rounded-2xl border border-line bg-white p-8 text-center">
      <h2 className="text-xl font-semibold text-ink">Ready to list your boarding house?</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-muted">
        Join Meino today and enjoy every feature completely free during our beta.
      </p>
      <Link
        href="/list-your-property"
        className="mt-5 inline-block rounded-xl bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
      >
        Start Listing for Free
      </Link>
    </div>
  );
}
