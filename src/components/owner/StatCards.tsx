import type { AnalyticsSummary } from "@/lib/db/analytics";

interface Props {
  summary: AnalyticsSummary;
}

const tiles: { key: keyof AnalyticsSummary; label: string }[] = [
  { key: "views", label: "Profile views" },
  { key: "contactClicks", label: "Contact clicks" },
  { key: "favorites", label: "Favorites" },
  { key: "viewingRequests", label: "Viewing requests" },
];

// The row of headline numbers across all of the owner's listings.
export function StatCards({ summary }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {tiles.map((tile) => (
        <div key={tile.key} className="rounded-2xl border border-neutral-200 bg-white p-4">
          <p className="text-2xl font-semibold text-neutral-900">{summary[tile.key]}</p>
          <p className="text-xs text-neutral-500">{tile.label}</p>
        </div>
      ))}
    </div>
  );
}
