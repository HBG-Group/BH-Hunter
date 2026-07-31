"use client";

import { useState, useTransition } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { deleteMyAccountAction } from "@/lib/account/actions";

// The red "Danger Zone" section shared by student and owner settings. Deleting is
// permanent and irreversible, so it always goes through a confirmation dialog.
export function DangerZone() {
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const remove = () =>
    startTransition(async () => {
      const result = await deleteMyAccountAction();
      // Success redirects server-side; only an error comes back here.
      if (result?.error) {
        setError(result.error);
        setConfirm(false);
      }
    });

  return (
    <section id="danger" className="scroll-mt-20 rounded-2xl border border-rose-200 bg-rose-50 p-5">
      <h2 className="text-base font-semibold text-rose-800">Danger Zone</h2>
      <p className="mt-1 text-sm text-rose-700">
        Permanently delete your account and all associated data. This cannot be undone.
      </p>
      {error && <p className="mt-2 text-sm font-medium text-rose-700">{error}</p>}

      <button
        onClick={() => setConfirm(true)}
        disabled={pending}
        className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
      >
        Delete Account
      </button>

      <ConfirmDialog
        open={confirm}
        title="Delete your account?"
        message="This permanently deletes your account and everything tied to it. This action cannot be undone."
        confirmLabel="Delete permanently"
        pending={pending}
        onCancel={() => setConfirm(false)}
        onConfirm={remove}
      />
    </section>
  );
}
