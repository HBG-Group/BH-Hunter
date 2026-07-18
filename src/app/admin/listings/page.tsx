import { requireAdmin } from "@/lib/auth/profile";
import { findAllListingsForAdmin } from "@/lib/db/admin";
import { AdminListingRow } from "@/components/admin/AdminListingRow";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function AdminListingsPage() {
  await requireAdmin();
  const rows = await findAllListingsForAdmin();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold tracking-tight text-neutral-900">All listings</h1>

      {rows.length === 0 ? (
        <EmptyState title="No listings" message="Nothing has been created yet." />
      ) : (
        <div className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white">
          {rows.map((row) => (
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
    </div>
  );
}
