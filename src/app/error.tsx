"use client";

import Link from "next/link";

// Recoverable error boundary — a brief DB/connection hiccup shows a retry instead
// of a dead page. Covers any route segment without its own error boundary.
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-xl font-semibold text-ink">That didn&apos;t load</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        Usually just a brief connection hiccup. Give it another go.
      </p>
      <div className="mt-5 flex gap-3">
        <button
          onClick={reset}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-xl px-4 py-2 text-sm text-neutral-700 ring-1 ring-inset ring-line hover:ring-neutral-300"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
