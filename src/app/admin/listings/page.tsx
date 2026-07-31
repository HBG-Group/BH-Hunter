import Link from "next/link";
import { getAdminOrNull } from "@/lib/auth/profile";
import { findAllListingsForAdmin, type AdminListingFilter } from "@/lib/db/admin";
import { AdminListingRow } from "@/components/admin/AdminListingRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { resilientRead } from "@/lib/async/resilient-read";

interface PageProps {
  searchParams: Promise<{ filter?: string }>;
}

const FILTERS: { value: AdminListingFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unverified", label: "Unverified" },
  { value: "unpublished", label: "Unpublished" },
];

function normalizeFilter(value: string | undefined): AdminListingFilter {
  return value === "unverified" || value === "unpublished" ? value : "all";
}

export default async function AdminListingsPage({ searchParams }: PageProps) {
  if (!(await getAdminOrNull())) return null;
  const filter = normalizeFilter((await searchParams).filter);
  const rows = await resilientRead(() => findAllListingsForAdmin(filter));

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold tracking-tight text-neutral-900">All listings</h1>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((option) => {
          const active = option.value === filter;
          return (
            <Link
              key={option.value}
              href={option.value === "all" ? "/admin/listings" : `/admin/listings?filter=${option.value}`}
              className={`rounded-full px-3 py-1.5 text-sm ring-1 ring-inset transition ${
                active
                  ? "bg-neutral-900 text-white ring-neutral-900"
                  : "bg-white text-neutral-700 ring-neutral-200 hover:ring-neutral-300"
              }`}
            >
              {option.label}
            </Link>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No listings" message="Nothing matches this filter." />
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
                featured: row.featured,
                ownerId: row.owner.id,
                ownerName: row.owner.fullName,
                ownerVerified: row.owner.verified,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
