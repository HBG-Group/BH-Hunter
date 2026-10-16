"use client";

import { useActionState } from "react";
import { revokeOtherSessionsAction } from "@/lib/account/actions";

export function RevokeOtherSessionsForm() {
  const [state, action, pending] = useActionState(revokeOtherSessionsAction, {});
  return (
    <form action={action}>
      <button disabled={pending} className="min-h-11 rounded-xl px-4 text-sm ring-1 ring-inset ring-line disabled:opacity-60">
        {pending ? "Signing out…" : "Sign out other sessions"}
      </button>
      {state.error && <p role="alert" className="mt-2 text-sm text-rose-600">{state.error}</p>}
      {state.success && <p role="status" className="mt-2 text-sm text-emerald-700">{state.success}</p>}
    </form>
  );
}
