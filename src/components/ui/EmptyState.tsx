import Link from "next/link";

interface Props {
  title: string;
  message: string;
  // Optional CTA that guides the user back into the app.
  actionLabel?: string;
  actionHref?: string;
}

// A calm, intentional empty state — not a jarring "no results" dump.
export function EmptyState({ title, message, actionLabel, actionHref }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/50 px-6 py-16 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
        <svg
          className="h-6 w-6 text-neutral-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
      </div>
      <h3 className="font-medium text-neutral-900">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-neutral-500">{message}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
