import type { PlatformStats } from "@/lib/db/admin";

const tiles: { key: keyof PlatformStats; label: string }[] = [
  { key: "listings", label: "Listings" },
  { key: "published", label: "Published" },
  { key: "unverified", label: "Awaiting verification" },
  { key: "owners", label: "Owners" },
  { key: "students", label: "Students" },
  { key: "reviews", label: "Reviews" },
  { key: "viewingRequests", label: "Viewing requests" },
];

export function PlatformStatCards({ stats }: { stats: PlatformStats }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {tiles.map((tile) => (
        <div key={tile.key} className="rounded-2xl border border-neutral-200 bg-white p-4">
          <p className="text-2xl font-semibold text-neutral-900">{stats[tile.key]}</p>
          <p className="text-xs text-neutral-500">{tile.label}</p>
        </div>
      ))}
    </div>
  );
}
