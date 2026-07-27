"use client";

import Link from "next/link";
import { useTransition } from "react";
import { setOwnerVerifiedAction } from "@/lib/admin/actions";
import { VerifiedOwnerBadge } from "@/components/ui/VerifiedOwnerBadge";

export interface AdminOwnerView {
  id: string;
  fullName: string;
  email: string;
  listingCount: number;
  isVerified: boolean; // effective (not expired)
  verifiedUntilLabel: string | null;
  requested: boolean; // has a pending verification request
}

export function OwnerRow({ owner }: { owner: AdminOwnerView }) {
  const [pending, startTransition] = useTransition();

  const setVerified = (verified: boolean) =>
    startTransition(async () => {
      await setOwnerVerifiedAction(owner.id, verified);
    });

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/owners/${owner.id}`}
            className="truncate text-sm font-medium text-neutral-900 hover:underline"
          >
            {owner.fullName}
          </Link>
          {owner.isVerified && <VerifiedOwnerBadge compact />}
          {!owner.isVerified && owner.requested && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
              Requested
            </span>
          )}
        </div>
        <p className="truncate text-xs text-neutral-500">
          {owner.email} · {owner.listingCount} listing(s)
          {owner.isVerified && owner.verifiedUntilLabel ? ` · until ${owner.verifiedUntilLabel}` : ""}
        </p>
      </div>

      {owner.isVerified ? (
        <button
          onClick={() => setVerified(false)}
          disabled={pending}
          className="shrink-0 rounded-lg px-3 py-1.5 text-sm text-neutral-700 ring-1 ring-inset ring-neutral-200 hover:ring-neutral-300 disabled:opacity-60"
        >
          {pending ? "…" : "Unverify"}
        </button>
      ) : (
        <button
          onClick={() => setVerified(true)}
          disabled={pending}
          className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60"
        >
          {pending ? "…" : "Verify (1 month)"}
        </button>
      )}
    </div>
  );
}
