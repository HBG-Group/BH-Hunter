import Link from "next/link";
import { requireOwner } from "@/lib/auth/profile";
import { getListingQuota } from "@/lib/owner/billing";
import { ListingForm } from "@/components/owner/form/ListingForm";
import { ListingQuotaBanner } from "@/components/owner/ListingQuota";
import { createListingAction } from "@/lib/owner/actions";
import { resilientRead } from "@/lib/async/resilient-read";

export default async function NewListingPage() {
  const owner = await requireOwner();
  const quota = await resilientRead(() => getListingQuota(owner.id));

  return (
    <div className="space-y-4">
      <Link href="/owner" className="text-sm text-neutral-500 hover:text-neutral-900">
        ← Back to dashboard
      </Link>
      <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Add a boarding house</h1>

      <ListingQuotaBanner quota={quota} />

      {/* When billing is on and the free tier is used up, the form waits until paid. */}
      {quota.nextNeedsPayment ? null : (
        <ListingForm action={createListingAction} submitLabel="Create listing" />
      )}
    </div>
  );
}
