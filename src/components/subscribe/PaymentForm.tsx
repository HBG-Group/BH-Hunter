"use client";

import { useState, useTransition } from "react";
import { submitPaymentAction } from "@/lib/owner/payment-actions";
import { PHOTO_SIZE_HINT } from "@/config/storage";

// Owner-facing form: name, last 4 phone digits, and a receipt image. On submit it hands
// the FormData to the server action, which stores the receipt and emails the admin.
export function PaymentForm({ planId }: { planId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    formData.set("planId", planId);

    startTransition(async () => {
      const result = await submitPaymentAction(formData);
      if (result.error) setError(result.error);
      else setDone(true);
    });
  }

  if (done) {
    return (
      <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
        <p className="font-medium">Payment submitted!</p>
        <p className="mt-1">
          Your payment is now waiting for approval. We&apos;ll email you once your subscription is
          active.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-ink">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm text-ink outline-none focus:border-primary"
        />
      </div>

      <div>
        <label htmlFor="phoneLast4" className="block text-sm font-medium text-ink">
          Last 4 digits of phone number
        </label>
        <input
          id="phoneLast4"
          name="phoneLast4"
          type="text"
          inputMode="numeric"
          required
          maxLength={4}
          pattern="\d{4}"
          placeholder="1234"
          className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm text-ink outline-none focus:border-primary"
        />
      </div>

      <div>
        <label htmlFor="receipt" className="block text-sm font-medium text-ink">
          Upload receipt
        </label>
        <input
          id="receipt"
          name="receipt"
          type="file"
          required
          accept="image/jpeg,image/png,image/webp"
          className="mt-1 block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-ink hover:file:bg-neutral-200"
        />
        <p className="mt-1 text-xs text-muted">{PHOTO_SIZE_HINT}</p>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Submit"}
      </button>
    </form>
  );
}
