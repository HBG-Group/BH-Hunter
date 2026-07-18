import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/auth/profile";
import { findOwnerListing } from "@/lib/db/owner";
import { findImages } from "@/lib/db/images";
import { PhotoManager } from "@/components/owner/photos/PhotoManager";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ListingPhotosPage({ params }: PageProps) {
  const { id } = await params;
  const owner = await requireOwner();

  const listing = await findOwnerListing(owner.id, id);
  if (!listing) notFound();

  const images = await findImages(id);

  return (
    <div className="space-y-4">
      <Link href="/owner" className="text-sm text-neutral-500 hover:text-neutral-900">
        ← Back to dashboard
      </Link>
      <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Photos · {listing.name}</h1>

      <PhotoManager
        boardingHouseId={id}
        images={images.map((image) => ({ id: image.id, url: image.url }))}
      />
    </div>
  );
}
