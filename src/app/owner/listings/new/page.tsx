import Link from "next/link";
import { requireOwner } from "@/lib/auth/profile";
import { getListingQuota } from "@/lib/owner/billing";
import { ListingForm } from "@/components/owner/form/ListingForm";
import { ListingQuotaBanner } from "@/components/owner/ListingQuota";
import { ContactAdminNotice } from "@/components/owner/ContactAdminNotice";
import { ListingFormTour } from "@/components/tutorial/ListingFormTour";
import { createListingAction } from "@/lib/owner/actions";

interface PageProps {
  searchParams: Promise<{ tutorial?: string }>;
}

export default async function NewListingPage({ searchParams }: PageProps) {
  const owner = await requireOwner();
  const { tutorial } = await searchParams;
  const tutorialMode = tutorial === "first" || tutorial === "replay" ? tutorial : null;

  // Tutorial sandbox: show the real form (so owners get familiar) but never submit, and
  // bypass the quota gate — no real listing is created.
  if (tutorialMode) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
          Practice: add a boarding house
        </h1>
        <p className="text-sm text-neutral-500">
          This is a guided practice run — nothing you enter here is saved.
        </p>
        <ListingForm action={createListingAction} submitLabel="Create listing" tutorial />
        <ListingFormTour mode={tutorialMode} />
      </div>
    );
  }

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
