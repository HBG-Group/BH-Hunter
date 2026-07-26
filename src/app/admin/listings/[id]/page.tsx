import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getAdminOrNull } from "@/lib/auth/profile";
import { findListingForAdmin } from "@/lib/db/admin";
import { AdminListingRow } from "@/components/admin/AdminListingRow";
import { VerifiedOwnerBadge } from "@/components/ui/VerifiedOwnerBadge";
import { AMENITIES } from "@/config/amenities";
import { formatPeso } from "@/lib/utils/format";
import { formatCurfew } from "@/lib/utils/curfew";
import { parseContactNumbers, formatContactNumber } from "@/lib/contact/phones";

interface PageProps {
  params: Promise<{ id: string }>;
}

const genderLabels: Record<string, string> = { MALE: "Male", FEMALE: "Female", MIXED: "Mixed" };

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-neutral-500">{label}</dt>
      <dd className="text-sm text-neutral-900">{value}</dd>
    </div>
  );
}

export default async function AdminListingDetailPage({ params }: PageProps) {
  if (!(await getAdminOrNull())) return null;
  const { id } = await params;
  const listing = await findListingForAdmin(id);
  if (!listing) notFound();

  const amenityLabels = new Map(AMENITIES.map((a) => [a.key, a.label]));
  const amenities = listing.amenities.map((link) => amenityLabels.get(link.amenity.key) ?? link.amenity.key);

  return (
    <div className="space-y-6">
      <Link href="/admin/listings" className="text-sm text-neutral-500 hover:text-neutral-900">
        ← Back to listings
      </Link>

      {/* Moderation controls at the top so the admin can act after reviewing */}
      <div className="rounded-2xl border border-neutral-200 bg-white">
        <AdminListingRow
          showModeration
          listing={{
            id: listing.id,
            name: listing.name,
            slug: listing.slug,
            status: listing.status,
            isVerified: listing.verifiedAt !== null,
            featured: listing.featured,
            ownerId: listing.owner.id,
            ownerName: listing.owner.fullName,
            ownerVerified: listing.owner.verified,
          }}
        />
      </div>

      {/* Images — the main thing to vet */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-neutral-900">Photos ({listing.images.length})</h2>
        {listing.images.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-500">
            No photos uploaded yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {listing.images.map((image, i) => (
              <a
                key={image.id}
                href={image.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-[4/3] overflow-hidden rounded-xl bg-neutral-100 ring-1 ring-neutral-200"
              >
                <Image src={image.url} alt={`Photo ${i + 1}`} fill sizes="240px" className="object-cover" />
              </a>
            ))}
          </div>
        )}
      </section>

      {/* Owner */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-neutral-900">Owner</h2>
          {listing.owner.verified && <VerifiedOwnerBadge compact />}
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Fact label="Name" value={listing.owner.fullName} />
          <Fact label="Email" value={listing.owner.email} />
          <Fact label="Phone" value={listing.owner.phone ?? "—"} />
        </dl>
      </section>

      {/* Details */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-neutral-900">Details</h2>
        <dl className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Fact label="Name" value={listing.name} />
          <Fact label="Address" value={listing.addressLine} />
          <Fact label="Gender policy" value={genderLabels[listing.genderPolicy]} />
          <Fact label="Monthly rent" value={formatPeso(listing.priceMonthly)} />
          <Fact label="Advance" value={`${listing.advanceMonths} mo`} />
          <Fact label="Deposit" value={`${listing.depositMonths} mo`} />
          <Fact label="Utilities included" value={listing.utilitiesIncluded ? "Yes" : "No"} />
          <Fact label="Internet included" value={listing.internetIncluded ? "Yes" : "No"} />
          <Fact label="Curfew" value={formatCurfew(listing.curfew)} />
          <Fact label="Coordinates" value={`${listing.latitude.toFixed(5)}, ${listing.longitude.toFixed(5)}`} />
        </dl>
        {listing.houseRules && (
          <div className="mt-4">
            <p className="text-xs text-neutral-500">House rules</p>
            <p className="mt-0.5 whitespace-pre-line text-sm text-neutral-900">{listing.houseRules}</p>
          </div>
        )}
      </section>

      {/* Contact */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-neutral-900">Contact</h2>
        <dl className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Fact
            label="Phone"
            value={
              parseContactNumbers(listing.contactPhone).map(formatContactNumber).join(", ") || "—"
            }
          />
          <Fact label="Messenger" value={listing.messengerUrl ?? "—"} />
          <Fact label="Email" value={listing.contactEmail ?? "—"} />
        </dl>
      </section>

      {/* Rooms */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-neutral-900">Rooms ({listing.rooms.length})</h2>
        <div className="mt-3 divide-y divide-neutral-100">
          {listing.rooms.map((room) => (
            <div key={room.id} className="flex items-center justify-between py-2 text-sm">
              <span className="text-neutral-900">{room.label}</span>
              <span className="text-neutral-500">
                {room.occupied}/{room.capacity} occupied
                {room.priceMonthly ? ` · ${formatPeso(room.priceMonthly)}` : ""}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Amenities */}
      {amenities.length > 0 && (
        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-neutral-900">Amenities</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {amenities.map((label) => (
              <span key={label} className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700">
                {label}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
