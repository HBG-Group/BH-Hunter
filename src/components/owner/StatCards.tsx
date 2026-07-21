import type { AnalyticsSummary } from "@/lib/db/analytics";

interface Props {
  summary: AnalyticsSummary;
}

// Each metric with a short note on how it grows.
const tiles: { key: keyof AnalyticsSummary; label: string; hint: string }[] = [
  { key: "views", label: "Profile views", hint: "Students who opened your listing" },
  { key: "contactClicks", label: "Contact clicks", hint: "Taps on call, Messenger, or email" },
  { key: "favorites", label: "Favorites", hint: "Students who saved your listing" },
  { key: "viewingRequests", label: "Viewing requests", hint: "Students asking to visit" },
];

// The row of headline numbers across all of the owner's listings.
export function StatCards({ summary }: Props) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.key} className="rounded-2xl border border-neutral-200 bg-white p-4">
            <p className="text-2xl font-semibold text-neutral-900">{summary[tile.key]}</p>
            <p className="text-xs font-medium text-neutral-700">{tile.label}</p>
            <p className="mt-1 text-xs leading-snug text-neutral-500">{tile.hint}</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-neutral-500">
        These grow once your listing is published and students start browsing.
      </p>
    </div>
  );
}
