"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { deleteOwnerAction, setOwnerFrozenAction, setOwnerPlanAction } from "@/lib/admin/actions";
import { VerifiedOwnerBadge } from "@/components/ui/VerifiedOwnerBadge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PLANS } from "@/config/pricing";

export interface AdminOwnerView {
  id: string;
  fullName: string;
  email: string;
  listingCount: number;
  isVerified: boolean; // effective (not expired)
  frozen: boolean;
  plan: string | null; // BASIC | ADVANCE | PREMIUM | null
}

// The plan chips, sourced from the pricing config so labels stay in sync.
const PLAN_OPTIONS = PLANS.map((p) => ({ id: p.id.toUpperCase(), label: p.name }));

export function OwnerRow({ owner }: { owner: AdminOwnerView }) {
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const run = (fn: () => Promise<unknown>) => startTransition(async () => void (await fn()));

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/owners/${owner.id}`}
            className="truncate text-sm font-medium text-neutral-900 hover:underline"
          >
            {owner.fullName}
          </Link>
          {owner.isVerified && <VerifiedOwnerBadge compact />}
          {owner.frozen && (
            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-800">
              Frozen
            </span>
          )}
        </div>
        <p className="truncate text-xs text-neutral-500">
          {owner.email} · {owner.listingCount} listing(s)
          {owner.plan ? ` · ${owner.plan.toLowerCase()} plan` : " · no plan"}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {/* Assign plan — clicking applies the plan's perks automatically. */}
        {PLAN_OPTIONS.map((option) => {
          const active = owner.plan === option.id;
          return (
            <button
              key={option.id}
              onClick={() => run(() => setOwnerPlanAction(owner.id, option.id))}
              disabled={pending || active}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium ring-1 ring-inset disabled:opacity-60 ${
                active
                  ? "bg-primary text-white ring-primary"
                  : "text-neutral-700 ring-neutral-200 hover:ring-neutral-300"
              }`}
            >
              {option.label}
            </button>
          );
        })}

        <button
          onClick={() => run(() => setOwnerFrozenAction(owner.id, !owner.frozen))}
          disabled={pending}
          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-sky-700 ring-1 ring-inset ring-sky-200 hover:ring-sky-300 disabled:opacity-60"
        >
          {owner.frozen ? "Unfreeze" : "Freeze"}
        </button>

        <button
          onClick={() => setConfirmDelete(true)}
          disabled={pending}
          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-600 ring-1 ring-inset ring-rose-200 hover:ring-rose-300 disabled:opacity-60"
        >
          Delete
        </button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title={`Delete ${owner.fullName}?`}
        message="This permanently removes the owner, all their listings, photos, viewing requests, reviews, and files. This cannot be undone."
        confirmLabel="Delete permanently"
        pending={pending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() =>
          run(async () => {
            await deleteOwnerAction(owner.id);
            setConfirmDelete(false);
          })
        }
      />
    </div>
  );
}
