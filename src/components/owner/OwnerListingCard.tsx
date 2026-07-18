"use client";

import Link from "next/link";
import { useTransition } from "react";
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
}

const STATUS_LABELS: Record<OwnerListingView["status"], string> = {
  DRAFT: "Draft",
  PENDING: "Pending review",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

export function OwnerListingCard({ listing }: { listing: OwnerListingView }) {
  const [pending, startTransition] = useTransition();
  const isPublished = listing.status === "PUBLISHED";
  const isPending = listing.status === "PENDING";

  const confirm = () => startTransition(() => confirmVacanciesAction(listing.id));
  const setStatus = (status: "DRAFT" | "PENDING") =>
    startTransition(() => setStatusAction(listing.id, status));

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
          className="rounded-lg px-3 py-1.5 text-neutral-700 ring-1 ring-inset ring-neutral-200 hover:ring-neutral-300"
        >
          Photos
        </Link>
        {isPublished ? (
          <button
            onClick={() => setStatus("DRAFT")}
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
    </div>
  );
}
