"use client";

import { useActionState, useState, useTransition } from "react";
import { REVIEW_ASPECTS } from "@/lib/validation/review";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { deleteReviewAction } from "@/lib/student/review-actions";
import type { ReviewFormState } from "@/lib/student/review-actions";

type Action = (state: ReviewFormState, formData: FormData) => Promise<ReviewFormState>;

// The student's existing review, if they've already left one.
export interface ExistingReview {
  id: string;
  cleanliness: number;
  internet: number;
  safety: number;
  noiseLevel: number;
  waterSupply: number;
  ownerFriendliness: number;
  body: string | null;
}

interface Props {
  action: Action;
  slug: string;
  existing?: ExistingReview | null;
}

// Rate each aspect 1–5 and leave an optional note. Prefills when editing an existing
// review, and offers delete.
export function ReviewForm({ action, slug, existing }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const [deleting, startDelete] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <form action={formAction} className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-neutral-900">
        {existing ? "Your review" : "Leave a review"}
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {REVIEW_ASPECTS.map((aspect) => (
          <label key={aspect.key} className="flex items-center justify-between gap-2 text-sm">
            <span className="text-neutral-600">{aspect.label}</span>
            <select
              name={aspect.key}
              defaultValue={String(existing?.[aspect.key] ?? 5)}
              className="rounded-lg border border-neutral-200 px-2 py-1 text-sm outline-none focus:border-neutral-400"
            >
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      <textarea
        name="body"
        rows={3}
        defaultValue={existing?.body ?? ""}
        placeholder="Share your experience (optional)"
        className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
      />

      {state.error && <p className="text-sm text-rose-600">{state.error}</p>}
      {state.success && <p className="text-sm text-emerald-600">Thanks! Your review was saved.</p>}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
        >
          {pending ? "Saving…" : existing ? "Update review" : "Submit review"}
        </button>
        {existing && (
          <button
            type="button"
            disabled={deleting}
            onClick={() => setConfirmDelete(true)}
            className="rounded-xl px-4 py-2 text-sm text-rose-600 ring-1 ring-inset ring-rose-200 hover:ring-rose-300 disabled:opacity-60"
          >
            Delete
          </button>
        )}
      </div>

      {existing && (
        <ConfirmDialog
          open={confirmDelete}
          title="Delete your review?"
          message="This permanently removes your rating and comment from this listing."
          confirmLabel="Delete review"
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => {
            setConfirmDelete(false);
            startDelete(() => deleteReviewAction(existing.id, slug));
          }}
        />
      )}
    </form>
  );
}
