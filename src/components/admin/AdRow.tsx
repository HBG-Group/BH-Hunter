"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { deleteAdAction, toggleAdAction } from "@/lib/admin/ad-actions";

export interface AdView {
  id: string;
  title: string;
  active: boolean;
  live: boolean; // active AND within its date window
  expiresAt: string | null;
  coverUrl: string | null;
  imageCount: number;
}

export function AdRow({ ad }: { ad: AdView }) {
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = (fn: () => Promise<{ error?: string }>) =>
    startTransition(async () => {
      const result = await fn();
      setError(result.error ?? null);
    });

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div className="flex items-center gap-3">
        {ad.coverUrl && (
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
            <Image src={ad.coverUrl} alt="" fill sizes="44px" className="object-cover" />
          </div>
        )}
        <div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-neutral-900">{ad.title}</p>
          {ad.imageCount > 1 && (
            <span className="text-xs text-neutral-400">+{ad.imageCount - 1}</span>
          )}
          <span
            className={`rounded-md px-1.5 py-0.5 text-xs ${
              ad.live ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500"
            }`}
          >
            {ad.live ? "Live" : ad.active ? "Scheduled / expired" : "Paused"}
          </span>
        </div>
        {ad.expiresAt && (
          <p className="text-xs text-neutral-500">Expires {new Date(ad.expiresAt).toLocaleDateString()}</p>
        )}
        {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={() => run(() => toggleAdAction(ad.id, !ad.active))}
          disabled={pending}
          className="rounded-lg px-3 py-1.5 text-neutral-700 ring-1 ring-inset ring-neutral-200 hover:ring-neutral-300 disabled:opacity-60"
        >
          {ad.active ? "Pause" : "Resume"}
        </button>
        <button
          onClick={() => setConfirmDelete(true)}
          disabled={pending}
          className="rounded-lg px-3 py-1.5 text-rose-600 ring-1 ring-inset ring-rose-200 hover:ring-rose-300 disabled:opacity-60"
        >
          Delete
        </button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title={`Delete "${ad.title}"?`}
        message="This advertisement will be permanently removed."
        confirmLabel="Delete"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          run(() => deleteAdAction(ad.id));
        }}
      />
    </div>
  );
}
