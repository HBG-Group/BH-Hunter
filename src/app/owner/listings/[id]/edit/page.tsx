import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/auth/profile";
import { findOwnerListing } from "@/lib/db/owner";
import { toFormValues } from "@/services/owner-listings";
import { ListingForm } from "@/components/owner/form/ListingForm";
import { updateListingAction } from "@/lib/owner/actions";
import { resilientRead } from "@/lib/async/resilient-read";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditListingPage({ params }: PageProps) {
  const { id } = await params;
  const owner = await requireOwner();

  const row = await resilientRead(() => findOwnerListing(owner.id, id));
  if (!row) notFound();

  const initialValues = toFormValues(row);
  // Bind the listing id so the form's action keeps the (state, formData) shape.
  const action = updateListingAction.bind(null, id);

  return (
    <div className="space-y-4">
      <Link href="/owner" className="text-sm text-neutral-500 hover:text-neutral-900">
        ← Back to dashboard
      </Link>
      <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Edit {row.name}</h1>

      <ListingForm action={action} initialValues={initialValues} submitLabel="Save changes" />
    </div>
  );
}
