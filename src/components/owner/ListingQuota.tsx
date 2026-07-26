"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { ListingQuota } from "@/lib/owner/billing";

// Shows how many free listings an owner has left. When they're out (and billing is on)
// it explains the ₱ cost and offers a placeholder payment step. Free during Phase 1.
export function ListingQuotaBanner({ quota }: { quota: ListingQuota }) {
  const [showPay, setShowPay] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  if (quota.nextNeedsPayment) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-medium text-amber-900">
          You&apos;ve used all {quota.freeLimit} free listings.
        </p>
        <p className="mt-1 text-sm text-amber-800">
          Additional listings cost ₱{quota.extraPrice} each.
        </p>
        <button
          onClick={() => setShowPay(true)}
          className="mt-3 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
        >
          Proceed to payment
        </button>
        {notice && <p className="mt-2 text-sm text-amber-800">{notice}</p>}

        <ConfirmDialog
          open={showPay}
          title="Payment"
          message="Payment integration coming soon."
          confirmLabel="OK"
          onCancel={() => setShowPay(false)}
          onConfirm={() => {
            setShowPay(false);
            setNotice("Payment integration coming soon.");
          }}
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <p className="text-sm text-muted">
        <span className="font-medium text-ink">{quota.freeLeft}</span> of {quota.freeLimit} free
        listings remaining.
      </p>
    </div>
  );
}
