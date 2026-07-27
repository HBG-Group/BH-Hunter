import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminOrNull } from "@/lib/auth/profile";
import { findOwnerForAdmin } from "@/lib/db/admin";
import { OwnerRow, type AdminOwnerView } from "@/components/admin/OwnerRow";
import { isVerified, verificationStatus } from "@/lib/owner/verification";

interface PageProps {
  params: Promise<{ id: string }>;
}

function dateLabel(date: Date | null): string {
  return date
    ? date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    : "—";
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-neutral-50 p-3">
      <dt className="text-xs text-neutral-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-neutral-900">{value}</dd>
    </div>
  );
}

const statusLabels: Record<string, string> = {
  VERIFIED: "Verified",
  PENDING: "Requested — awaiting verification",
  EXPIRED: "Expired",
  NONE: "Not verified",
};

export default async function AdminOwnerDetailPage({ params }: PageProps) {
  if (!(await getAdminOrNull())) return null;
  const { id } = await params;
  const owner = await findOwnerForAdmin(id);
  if (!owner) notFound();

  const rowView: AdminOwnerView = {
    id: owner.id,
    fullName: owner.fullName,
    email: owner.email,
    listingCount: owner.boardingHouses.length,
    isVerified: isVerified(owner),
    verifiedUntilLabel: owner.verifiedUntil ? dateLabel(owner.verifiedUntil) : null,
    requested: !isVerified(owner) && owner.verificationRequestedAt !== null,
  };

  return (
    <div className="space-y-5">
      <Link href="/admin/owners" className="text-sm text-neutral-500 hover:text-neutral-900">
        ← Back to owners
      </Link>
      <h1 className="text-xl font-semibold tracking-tight text-neutral-900">{owner.fullName}</h1>

      {/* Verify / unverify control */}
      <div className="rounded-2xl border border-neutral-200 bg-white">
        <OwnerRow owner={rowView} />
      </div>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-neutral-900">Details</h2>
        <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Fact label="Email" value={owner.email} />
          <Fact label="Phone" value={owner.phone ?? "—"} />
          <Fact label="Status" value={statusLabels[verificationStatus(owner)] ?? "—"} />
          <Fact label="Verified until" value={dateLabel(owner.verifiedUntil)} />
          <Fact label="Requested on" value={dateLabel(owner.verificationRequestedAt)} />
          <Fact label="Joined" value={dateLabel(owner.createdAt)} />
        </dl>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-neutral-900">
          Listings ({owner.boardingHouses.length})
        </h2>
        {owner.boardingHouses.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">No listings yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-neutral-100">
            {owner.boardingHouses.map((listing) => (
              <li key={listing.id} className="flex items-center justify-between py-2">
                <Link
                  href={`/admin/listings/${listing.id}`}
                  className="text-sm font-medium text-neutral-900 hover:underline"
                >
                  {listing.name}
                </Link>
                <span className="text-xs text-neutral-500">{listing.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
