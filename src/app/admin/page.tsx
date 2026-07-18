import { requireAdmin } from "@/lib/auth/profile";
import { findListingsAwaitingReview, getPlatformStats } from "@/lib/db/admin";
import { PlatformStatCards } from "@/components/admin/PlatformStatCards";
import { AdminListingRow } from "@/components/admin/AdminListingRow";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function AdminOverviewPage() {
  await requireAdmin();
  const [stats, queue] = await Promise.all([getPlatformStats(), findListingsAwaitingReview()]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Overview</h1>
      <PlatformStatCards stats={stats} />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Needs attention</h2>
        <p className="text-sm text-neutral-500">
          New, pending, or unverified listings. Verify and publish to make them go live.
        </p>
        {queue.length === 0 ? (
          <EmptyState title="All caught up" message="No listings need attention right now." />
        ) : (
          <div className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white">
            {queue.map((row) => (
              <AdminListingRow
                key={row.id}
                showModeration
                listing={{
                  id: row.id,
                  name: row.name,
                  slug: row.slug,
                  status: row.status,
                  isVerified: row.verifiedAt !== null,
                  ownerName: row.owner.fullName,
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
