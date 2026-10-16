"use client";

import { useActionState } from "react";
import { SafetyReminder } from "@/components/ui/SafetyReminder";
import type { ViewingFormState } from "@/lib/student/viewing-actions";

type Action = (state: ViewingFormState, formData: FormData) => Promise<ViewingFormState>;

interface Props {
  action: Action;
}

// Lets a signed-in student propose a date/time to visit the boarding house.
export function ViewingRequestForm({ action }: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-neutral-900">Request a viewing</h3>

      <label className="block space-y-1">
        <span className="text-xs font-medium text-neutral-600">Preferred date &amp; time</span>
        <input
          type="datetime-local"
          name="preferredAt"
          required
          className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
        />
      </label>

      <textarea
        name="message"
        rows={2}
        placeholder="Anything the owner should know? (optional)"
        className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
      />

      {state.error && <p className="text-sm text-rose-600">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-emerald-600">Request sent! The owner will get back to you.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send request"}
      </button>

      <SafetyReminder message="Always meet at the property in a well-lit, public time of day." />
    </form>
  );
}
