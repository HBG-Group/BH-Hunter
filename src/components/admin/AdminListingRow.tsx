"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  deleteListingAction,
  moderateStatusAction,
  setFeaturedAction,
  setOwnerVerifiedAction,
  setVerifiedAction,
} from "@/lib/admin/actions";
import { VerifiedOwnerBadge } from "@/components/ui/VerifiedOwnerBadge";

export interface AdminListingView {
  id: string;
  name: string;
  slug: string;
  status: "DRAFT" | "PENDING" | "PUBLISHED" | "ARCHIVED";
  isVerified: boolean;
  featured: boolean;
  ownerId: string;
  ownerName: string;
  ownerVerified: boolean;
}

interface Props {
  listing: AdminListingView;
  // The queue only needs verify; the moderation list shows status controls too.
  showModeration?: boolean;
}

export function AdminListingRow({ listing, showModeration }: Props) {
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = (fn: () => Promise<{ error?: string } | void>) =>
    startTransition(async () => {
      const result = await fn();
      setError(result && "error" in result ? (result.error ?? null) : null);
    });

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/listings/${listing.id}`}
            className="text-sm font-medium text-neutral-900 hover:underline"
          >
            {listing.name}
          </Link>
          {listing.isVerified && (
            <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-xs text-emerald-700">Verified</span>
          )}
          <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-500">
            {listing.status.toLowerCase()}
          </span>
          {listing.featured && (
            <span className="rounded-md bg-primary-soft px-1.5 py-0.5 text-xs font-medium text-primary">
              ★ Featured
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          <p className="text-xs text-neutral-500">by {listing.ownerName}</p>
          {listing.ownerVerified && <VerifiedOwnerBadge compact />}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <button
          onClick={() => run(() => setVerifiedAction(listing.id, !listing.isVerified))}
          disabled={pending}
          className="rounded-lg bg-neutral-900 px-3 py-1.5 text-white hover:bg-neutral-800 disabled:opacity-60"
        >
          {listing.isVerified ? "Unverify" : "Verify"}
        </button>

        <button
          onClick={() => run(() => setOwnerVerifiedAction(listing.ownerId, !listing.ownerVerified))}
          disabled={pending}
          title="Grant or revoke the Verified Owner badge"
          className="rounded-lg px-3 py-1.5 text-neutral-700 ring-1 ring-inset ring-neutral-200 hover:ring-neutral-300 disabled:opacity-60"
        >
          {listing.ownerVerified ? "Unverify owner" : "Verify owner"}
        </button>

        {showModeration && (
          <button
            onClick={() => run(() => setFeaturedAction(listing.id, !listing.featured))}
            disabled={pending}
            title="Show this listing first on the homepage"
            className="rounded-lg px-3 py-1.5 text-neutral-700 ring-1 ring-inset ring-neutral-200 hover:ring-neutral-300 disabled:opacity-60"
          >
            {listing.featured ? "Unfeature" : "Feature"}
          </button>
        )}

        {showModeration &&
          (listing.status === "PUBLISHED" ? (
            <button
              onClick={() => run(() => moderateStatusAction(listing.id, "DRAFT"))}
              disabled={pending}
              className="rounded-lg px-3 py-1.5 text-neutral-700 ring-1 ring-inset ring-neutral-200 hover:ring-neutral-300 disabled:opacity-60"
            >
              Unpublish
            </button>
          ) : (
            <button
              onClick={() => run(() => moderateStatusAction(listing.id, "PUBLISHED"))}
              disabled={pending || !listing.isVerified}
              title={listing.isVerified ? undefined : "Verify this listing first"}
              className="rounded-lg px-3 py-1.5 text-neutral-700 ring-1 ring-inset ring-neutral-200 hover:ring-neutral-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Publish
            </button>
          ))}

        {showModeration && (
          <button
            onClick={() => setConfirmDelete(true)}
            disabled={pending}
            className="rounded-lg px-3 py-1.5 text-rose-600 ring-1 ring-inset ring-rose-200 hover:ring-rose-300 disabled:opacity-60"
          >
            Delete
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-2 w-full rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {error}
        </p>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title={`Delete "${listing.name}"?`}
        message="This permanently removes the listing and all its photos. This cannot be undone."
        confirmLabel="Delete"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          run(() => deleteListingAction(listing.id));
        }}
      />
    </div>
  );
}
