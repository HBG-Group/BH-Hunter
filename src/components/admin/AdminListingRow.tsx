"use client";

import Link from "next/link";
import { useTransition } from "react";
import { moderateStatusAction, setVerifiedAction } from "@/lib/admin/actions";

export interface AdminListingView {
  id: string;
  name: string;
  slug: string;
  status: "DRAFT" | "PENDING" | "PUBLISHED" | "ARCHIVED";
  isVerified: boolean;
  ownerName: string;
}

interface Props {
  listing: AdminListingView;
  // The queue only needs verify; the moderation list shows status controls too.
  showModeration?: boolean;
}

export function AdminListingRow({ listing, showModeration }: Props) {
  const [pending, startTransition] = useTransition();

  const run = (fn: () => Promise<void>) => startTransition(() => fn());

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div>
        <div className="flex items-center gap-2">
          <Link href={`/listings/${listing.slug}`} className="text-sm font-medium text-neutral-900 hover:underline">
            {listing.name}
          </Link>
          {listing.isVerified && (
            <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-xs text-emerald-700">Verified</span>
          )}
          <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-500">
            {listing.status.toLowerCase()}
          </span>
        </div>
        <p className="text-xs text-neutral-500">by {listing.ownerName}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <button
          onClick={() => run(() => setVerifiedAction(listing.id, !listing.isVerified))}
          disabled={pending}
          className="rounded-lg bg-neutral-900 px-3 py-1.5 text-white hover:bg-neutral-800 disabled:opacity-60"
        >
          {listing.isVerified ? "Unverify" : "Verify"}
        </button>

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
              disabled={pending}
              className="rounded-lg px-3 py-1.5 text-neutral-700 ring-1 ring-inset ring-neutral-200 hover:ring-neutral-300 disabled:opacity-60"
            >
              Publish
            </button>
          ))}

        {showModeration && listing.status !== "ARCHIVED" && (
          <button
            onClick={() => run(() => moderateStatusAction(listing.id, "ARCHIVED"))}
            disabled={pending}
            className="rounded-lg px-3 py-1.5 text-rose-600 ring-1 ring-inset ring-rose-200 hover:ring-rose-300 disabled:opacity-60"
          >
            Archive
          </button>
        )}
      </div>
    </div>
  );
}
