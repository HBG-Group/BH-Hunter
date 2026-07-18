import Link from "next/link";
import { ListingForm } from "@/components/owner/form/ListingForm";
import { createListingAction } from "@/lib/owner/actions";

export default function NewListingPage() {
  return (
    <div className="space-y-4">
      <Link href="/owner" className="text-sm text-neutral-500 hover:text-neutral-900">
        ← Back to dashboard
      </Link>
      <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Add a boarding house</h1>

      <ListingForm action={createListingAction} submitLabel="Create listing" />
    </div>
  );
}
