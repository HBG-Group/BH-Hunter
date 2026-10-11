"use client";

import { useActionState } from "react";
import { updatePasswordAction } from "@/lib/auth/actions";
import { PasswordField } from "@/components/auth/PasswordField";

export function UpdatePasswordForm() {
  const [state, action, pending] = useActionState(updatePasswordAction, {});
  return (
    <form action={action} className="space-y-3">
      <label className="block space-y-1 text-sm">
        <span>Verification code (for email accounts)</span>
        <input name="nonce" inputMode="numeric" autoComplete="one-time-code" className="min-h-11 w-full rounded-xl border border-line px-3" />
      </label>
      <PasswordField
        autoComplete="new-password"
        minLength={8}
        placeholder="New password"
      />
      <PasswordField
        name="confirmation"
        autoComplete="new-password"
        minLength={8}
        placeholder="Confirm new password"
      />
      <p className="text-xs text-muted">
        Use 8–72 characters. A longer passphrase is easier to remember and
        harder to guess.
      </p>
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
        {pending ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
