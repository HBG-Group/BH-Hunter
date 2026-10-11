"use client";

import { useActionState } from "react";
import { requestPasswordResetAction } from "@/lib/auth/actions";

export function PasswordResetForm() {
  const [state, action, pending] = useActionState(
    requestPasswordResetAction,
    {},
  );
  return (
    <form action={action} className="space-y-3">
      <input
        name="email"
        type="email"
        autoComplete="email"
        maxLength={254}
        required
        placeholder="Email address"
        className="min-h-11 w-full rounded-xl border border-line px-3.5"
      />
      <div aria-live="polite">
        {state.error && <p className="text-sm text-rose-600">{state.error}</p>}
        {state.notice && (
          <p className="text-sm text-emerald-700">{state.notice}</p>
        )}
      </div>
      <button
        disabled={pending}
        className="min-h-11 w-full rounded-xl bg-primary px-4 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
