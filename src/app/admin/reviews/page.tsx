import { getAdminOrNull } from "@/lib/auth/profile";
import { findRecentReviews } from "@/lib/db/admin";
import { AdminReviewRow } from "@/components/admin/AdminReviewRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { resilientRead } from "@/lib/async/resilient-read";

export default async function AdminReviewsPage() {
  if (!(await getAdminOrNull())) return null;
  const rows = await resilientRead(findRecentReviews);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Reviews</h1>

      {rows.length === 0 ? (
        <EmptyState title="No reviews yet" message="Student reviews will show up here for moderation." />
      ) : (
        <div className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white">
          {rows.map((row) => (
            <AdminReviewRow
              key={row.id}
              review={{
                id: row.id,
                authorName: row.author.fullName,
                listingName: row.boardingHouse.name,
                listingSlug: row.boardingHouse.slug,
                overall: row.overall,
                body: row.body,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
