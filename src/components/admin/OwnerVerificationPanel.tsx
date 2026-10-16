"use client";

import { useTransition } from "react";
import { rejectOwnerVerificationAction, setOwnerVerifiedAction } from "@/lib/admin/actions";

interface Props {
  ownerId: string;
  status: "UNVERIFIED" | "PENDING" | "APPROVED" | "REJECTED";
}

const STATUS_LABEL: Record<Props["status"], string> = {
  UNVERIFIED: "Not requested",
  PENDING: "Pending review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

const STATUS_STYLE: Record<Props["status"], string> = {
  UNVERIFIED: "bg-neutral-100 text-neutral-600",
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-rose-100 text-rose-700",
};

// Phase 3 architecture: shows the owner's verification request status and lets an
// admin approve or reject it. Document uploads aren't required yet — see LEGAL.md.
export function OwnerVerificationPanel({ ownerId, status }: Props) {
  const [pending, startTransition] = useTransition();

  const run = (fn: () => Promise<unknown>) => startTransition(async () => void (await fn()));

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-900">Verification request</h2>
        <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[status]}`}>
          {STATUS_LABEL[status]}
        </span>
      </div>

      {status === "PENDING" && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => run(() => setOwnerVerifiedAction(ownerId, true))}
            disabled={pending}
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-hover disabled:opacity-60"
          >
            {pending ? "…" : "Approve"}
          </button>
          <button
            onClick={() => run(() => rejectOwnerVerificationAction(ownerId))}
            disabled={pending}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-rose-600 ring-1 ring-inset ring-rose-200 hover:ring-rose-300 disabled:opacity-60"
          >
            {pending ? "…" : "Reject"}
          </button>
        </div>
      )}
      {status === "APPROVED" && (
        <p className="mt-2 text-xs text-neutral-500">
          Revoking the Verified Owner badge above resets this back to unverified.
        </p>
      )}
    </section>
  );
}
