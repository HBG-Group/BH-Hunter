import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-medium text-primary">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-ink">
        We couldn&apos;t find that page
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted">
        The link may be outdated, or the listing may no longer be published.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-medium text-white"
        >
          Browse listings
        </Link>
        <Link
          href="/contact"
          className="inline-flex min-h-11 items-center rounded-xl px-4 text-sm text-ink ring-1 ring-inset ring-line"
        >
          Contact support
        </Link>
      </div>
    </main>
  );
}
