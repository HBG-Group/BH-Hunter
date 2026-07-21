"use client";

import Link from "next/link";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { MIN_LISTING_PHOTOS } from "@/config/listing";
import { AvailabilityBadge } from "@/components/ui/AvailabilityBadge";
import { formatRelativeTime } from "@/lib/utils/format";
import { confirmVacanciesAction, setStatusAction } from "@/lib/owner/actions";
import type { AvailabilityState } from "@/types/domain";

export interface OwnerListingView {
  id: string;
  slug: string;
  name: string;
  status: "DRAFT" | "PENDING" | "PUBLISHED" | "ARCHIVED";
  availabilityState: AvailabilityState;
  remainingVacancies: number;
  totalCapacity: number;
  lastConfirmedAt: string | null;
  favorites: number;
  viewingRequests: number;
  photoCount: number;
}

const STATUS_LABELS: Record<OwnerListingView["status"], string> = {
  DRAFT: "Draft",
  PENDING: "Pending review",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

export function OwnerListingCard({ listing }: { listing: OwnerListingView }) {
  const [pending, setPending] = useState(false);
  const [confirmTakeDown, setConfirmTakeDown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isPublished = listing.status === "PUBLISHED";
  const isPending = listing.status === "PENDING";
  const needsPhotos = listing.photoCount < MIN_LISTING_PHOTOS;

  const confirm = async () => {
    setPending(true);
    await confirmVacanciesAction(listing.id);
    setPending(false);
  };

  const setStatus = async (status: "DRAFT" | "PENDING") => {
    setPending(true);
    setError(null);
    const result = await setStatusAction(listing.id, status);
    setPending(false);
    setError(result?.error ?? null);
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium text-neutral-900">{listing.name}</h3>
          <p className="mt-0.5 text-xs text-neutral-500">
            {listing.totalCapacity} beds · {formatRelativeTime(listing.lastConfirmedAt)}
          </p>
        </div>
        <AvailabilityBadge state={listing.availabilityState} remaining={listing.remainingVacancies} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <button
          onClick={confirm}
          disabled={pending}
          className="rounded-lg bg-neutral-900 px-3 py-1.5 text-white hover:bg-neutral-800 disabled:opacity-60"
        >
          Confirm vacancies
        </button>
        <Link
          href={`/owner/listings/${listing.id}/edit`}
          className="rounded-lg px-3 py-1.5 text-neutral-700 ring-1 ring-inset ring-neutral-200 hover:ring-neutral-300"
        >
          Edit
        </Link>
        <Link
          href={`/owner/listings/${listing.id}/photos`}
          className={`rounded-lg px-3 py-1.5 ring-1 ring-inset ${
            needsPhotos
              ? "text-amber-700 ring-amber-300 hover:ring-amber-400"
              : "text-neutral-700 ring-neutral-200 hover:ring-neutral-300"
          }`}
        >
          Photos
        </Link>
        {isPublished ? (
          <button
            onClick={() => setConfirmTakeDown(true)}
            disabled={pending}
            className="rounded-lg px-3 py-1.5 text-neutral-700 ring-1 ring-inset ring-neutral-200 hover:ring-neutral-300 disabled:opacity-60"
          >
            Take down
          </button>
        ) : isPending ? (
          <button
            onClick={() => setStatus("DRAFT")}
            disabled={pending}
            className="rounded-lg px-3 py-1.5 text-neutral-700 ring-1 ring-inset ring-neutral-200 hover:ring-neutral-300 disabled:opacity-60"
          >
            Withdraw
          </button>
        ) : (
          <button
            onClick={() => setStatus("PENDING")}
            disabled={pending}
            className="rounded-lg px-3 py-1.5 text-neutral-700 ring-1 ring-inset ring-neutral-200 hover:ring-neutral-300 disabled:opacity-60"
          >
            Submit for review
          </button>
        )}

        <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
          {STATUS_LABELS[listing.status]}
        </span>

        {isPublished && (
          <Link href={`/listings/${listing.slug}`} className="px-1 text-neutral-500 hover:text-neutral-900">
            View public page →
          </Link>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {error}
        </p>
      )}

      <ConfirmDialog
        open={confirmTakeDown}
        title={`Take down "${listing.name}"?`}
        message="Students won't see it on the map anymore. You can submit it for review again anytime."
        confirmLabel="Take down"
        onCancel={() => setConfirmTakeDown(false)}
        onConfirm={() => {
          setConfirmTakeDown(false);
          setStatus("DRAFT");
        }}
      />
    </div>
  );
}
