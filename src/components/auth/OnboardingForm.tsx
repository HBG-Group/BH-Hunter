"use client";

import { useActionState } from "react";
import { completeOnboardingAction, type OnboardingState } from "@/lib/account/actions";
import { Spinner } from "@/components/ui/Spinner";

interface Props {
  defaultName: string;
  next: string;
}

const field =
  "w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-neutral-400";

// Asks a first-time user for their preferred display name before entering the app.
export function OnboardingForm({ defaultName, next }: Props) {
  const [state, formAction, pending] = useActionState<OnboardingState, FormData>(
    completeOnboardingAction,
    {},
  );

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="next" value={next} />
      <label className="block space-y-1">
        <span className="text-sm font-medium text-neutral-700">Display name</span>
        <input
          name="displayName"
          defaultValue={defaultName === "New user" ? "" : defaultName}
          required
          minLength={2}
          maxLength={80}
          placeholder="How should we show your name?"
          className={field}
          autoFocus
        />
      </label>

      {state.error && <p className="text-sm text-rose-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60"
      >
        {pending && <Spinner />}
        {pending ? "Saving…" : "Continue"}
      </button>
    </form>
  );
}
