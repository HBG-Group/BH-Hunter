"use client";

import { useState, useTransition } from "react";
import { requestVerificationAction } from "@/lib/owner/actions";
import { VerifiedOwnerBadge } from "@/components/ui/VerifiedOwnerBadge";
import { VERIFICATION_PRICE } from "@/config/billing";
import { ADMIN_CONTACT } from "@/config/support";
import type { VerificationStatus } from "@/lib/owner/verification";

interface Props {
  status: VerificationStatus;
  verifiedUntilLabel: string | null;
}

// The owner-dashboard verification card. Shows the current state and lets an unverified
// owner send a "Be verified" request (payment is arranged with the admin separately).
export function OwnerVerification({ status, verifiedUntilLabel }: Props) {
  const [pending, startTransition] = useTransition();
  // Local so the card flips to "pending" instantly after a successful request.
  const [justRequested, setJustRequested] = useState(false);

  const effectiveStatus = justRequested ? "PENDING" : status;

  const request = () =>
    startTransition(async () => {
      const result = await requestVerificationAction();
      if (result.ok) setJustRequested(true);
    });

  if (effectiveStatus === "VERIFIED") {
    return (
      <div className="rounded-2xl border border-line bg-white p-4">
        <div className="flex items-center gap-2">
          <VerifiedOwnerBadge compact />
          {verifiedUntilLabel && (
            <span className="text-sm text-muted">Verified until {verifiedUntilLabel}</span>
          )}
        </div>
      </div>
    );
  }

  if (effectiveStatus === "PENDING") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-medium text-amber-900">Verification request pending</p>
        <p className="mt-1 text-sm text-amber-800">
          To complete it, please pay ₱{VERIFICATION_PRICE} to the admin, then we&apos;ll review and
          verify your account. Contact: {ADMIN_CONTACT.email} · {ADMIN_CONTACT.phone}.
        </p>
      </div>
    );
  }

  // NONE or EXPIRED — offer to request (again).
  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <p className="text-sm font-medium text-ink">
        {effectiveStatus === "EXPIRED" ? "Your verification has expired" : "Get the Verified Owner badge"}
      </p>
      <p className="mt-1 text-sm text-muted">
        Verified owners build more trust with students. It costs ₱{VERIFICATION_PRICE} and lasts one
        month. Tapping below sends a request to the admin — pay ₱{VERIFICATION_PRICE} (contact{" "}
        {ADMIN_CONTACT.email}) and we&apos;ll verify you.
      </p>
      <button
        onClick={request}
        disabled={pending}
        className="mt-3 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60"
      >
        {pending ? "Sending…" : "Be verified"}
      </button>
    </div>
  );
}
