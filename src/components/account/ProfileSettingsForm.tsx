"use client";

import { useActionState } from "react";
import { updateAccountSettingsAction } from "@/lib/account/actions";

export function ProfileSettingsForm({
  fullName,
  phone,
}: {
  fullName: string;
  phone: string | null;
}) {
  const [state, action, pending] = useActionState(
    updateAccountSettingsAction,
    {},
  );
  return (
    <form
      action={action}
      className="space-y-4 rounded-2xl border border-line bg-white p-5"
    >
      <div>
        <h2 className="font-semibold text-ink">Profile and contact details</h2>
        <p className="mt-1 text-sm text-muted">
          Used on your account and owner contact workflows.
        </p>
      </div>
      <label className="block text-sm text-ink">
        Full name
        <input
          name="fullName"
          defaultValue={fullName}
          minLength={2}
          maxLength={80}
          autoComplete="name"
          required
          className="mt-1 min-h-11 w-full rounded-xl border border-line px-3"
        />
      </label>
      <label className="block text-sm text-ink">
        Mobile number
        <input
          name="phone"
          defaultValue={phone ?? ""}
          inputMode="tel"
          autoComplete="tel"
          maxLength={20}
          placeholder="09XXXXXXXXX"
          className="mt-1 min-h-11 w-full rounded-xl border border-line px-3"
        />
      </label>
      <div aria-live="polite">
        {state.error && <p className="text-sm text-rose-600">{state.error}</p>}
        {state.success && (
          <p className="text-sm text-emerald-700">{state.success}</p>
        )}
      </div>
      <button
        disabled={pending}
        className="min-h-11 rounded-xl bg-primary px-4 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
