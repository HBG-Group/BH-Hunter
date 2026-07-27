import Link from "next/link";
import { requireOwner } from "@/lib/auth/profile";
import { getListingQuota } from "@/lib/owner/billing";
import { ListingForm } from "@/components/owner/form/ListingForm";
import { ListingQuotaBanner } from "@/components/owner/ListingQuota";
import { ContactAdminNotice } from "@/components/owner/ContactAdminNotice";
import { createListingAction } from "@/lib/owner/actions";

export default async function NewListingPage() {
  const owner = await requireOwner();
  const quota = await getListingQuota(owner.id);

  return (
    <div className="space-y-4">
      <Link href="/owner" className="text-sm text-neutral-500 hover:text-neutral-900">
        ← Back to dashboard
      </Link>
      <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Add a boarding house</h1>

      <ListingQuotaBanner quota={quota} />

      {/* Past the free limit the form is blocked; the owner must contact the admin. */}
      {quota.atLimit ? (
        <ContactAdminNotice
          title={`You've used all ${quota.freeLimit} free listings`}
          message={`To add more listings (₱${quota.extraPrice} each), contact the admin to arrange it.`}
        />
      ) : (
        <ListingForm action={createListingAction} submitLabel="Create listing" />
      )}
    </div>
  );
}
