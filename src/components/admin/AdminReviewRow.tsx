"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Stars } from "@/components/ui/Stars";
import { deleteReviewAction } from "@/lib/admin/actions";

export interface AdminReviewView {
  id: string;
  authorName: string;
  listingName: string;
  listingSlug: string;
  overall: number;
  body: string | null;
}

export function AdminReviewRow({ review }: { review: AdminReviewView }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-start justify-between gap-3 px-4 py-3">
      <div>
        <div className="flex items-center gap-2">
          <Stars value={review.overall} size={14} />
          <Link
            href={`/listings/${review.listingSlug}`}
            className="text-sm font-medium text-neutral-900 hover:underline"
          >
            {review.listingName}
          </Link>
        </div>
        <p className="text-xs text-neutral-500">by {review.authorName}</p>
        {review.body && <p className="mt-1 text-sm text-neutral-600">{review.body}</p>}
      </div>

      <button
        onClick={() =>
          startTransition(async () => {
            await deleteReviewAction(review.id);
          })
        }
        disabled={pending}
        className="shrink-0 rounded-lg px-3 py-1.5 text-sm text-rose-600 ring-1 ring-inset ring-rose-200 hover:ring-rose-300 disabled:opacity-60"
      >
        Delete
      </button>
    </div>
  );
}
