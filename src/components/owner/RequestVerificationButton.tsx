"use client";

import { useTransition } from "react";
import { requestVerificationAction } from "@/lib/owner/actions";
import type { VerificationStatus } from "@/lib/owner/verification";

const STATUS_COPY: Partial<Record<VerificationStatus, string>> = {
  PENDING: "Verification request sent — an admin will review it soon.",
  VERIFIED: "You're a Verified Owner.",
};

// Lets an owner without a plan request the Verified Owner badge directly. An admin
// approves or rejects it from the owner's admin detail page (OwnerVerificationPanel).
export function RequestVerificationButton({ status }: { status: VerificationStatus }) {
  const [pending, startTransition] = useTransition();

  if (status === "VERIFIED" || status === "PENDING") {
    return <p className="text-sm text-muted">{STATUS_COPY[status]}</p>;
  }

  return (
    <button
      onClick={() => startTransition(async () => void (await requestVerificationAction()))}
      disabled={pending}
      className="rounded-lg px-3 py-1.5 text-sm font-medium text-primary ring-1 ring-inset ring-line hover:ring-neutral-300 disabled:opacity-60"
    >
      {pending ? "Sending…" : "Request Verified Owner badge"}
    </button>
  );
}
