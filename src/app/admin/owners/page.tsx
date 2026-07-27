import { getAdminOrNull } from "@/lib/auth/profile";
import { findAllOwners } from "@/lib/db/admin";
import { OwnerRow, type AdminOwnerView } from "@/components/admin/OwnerRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { isVerified } from "@/lib/owner/verification";

function dateLabel(date: Date | null): string | null {
  return date
    ? date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    : null;
}

export default async function AdminOwnersPage() {
  if (!(await getAdminOrNull())) return null;
  const owners = await findAllOwners();

  const views: AdminOwnerView[] = owners.map((owner) => ({
    id: owner.id,
    fullName: owner.fullName,
    email: owner.email,
    listingCount: owner._count.boardingHouses,
    isVerified: isVerified(owner),
    verifiedUntilLabel: dateLabel(owner.verifiedUntil),
    requested: !isVerified(owner) && owner.verificationRequestedAt !== null,
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Owners</h1>
      <p className="text-sm text-neutral-500">
        Owners who requested verification appear first. Verifying grants the badge for one month.
      </p>

      {views.length === 0 ? (
        <EmptyState title="No owners yet" message="Owner accounts will show up here." />
      ) : (
        <div className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white">
          {views.map((owner) => (
            <OwnerRow key={owner.id} owner={owner} />
          ))}
        </div>
      )}
    </div>
  );
}
