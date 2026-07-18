"use client";

import { useActionState } from "react";
import Link from "next/link";
import { PasswordField } from "@/components/auth/PasswordField";
import type { AuthFormState } from "@/lib/auth/actions";

type AuthAction = (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;

interface Props {
  mode: "signin" | "signup";
  action: AuthAction;
  next?: string;
  // On sign-up, which kind of account to create.
  role?: "OWNER" | "STUDENT";
  // Hidden for the admin login, which has no public sign-up.
  showFooter?: boolean;
}

const fieldClass =
  "w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-neutral-400";

export function AuthForm({ mode, action, next, role, showFooter = true }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const isSignUp = mode === "signup";

  return (
    <form action={formAction} className="space-y-3">
      {next && <input type="hidden" name="next" value={next} />}
      {isSignUp && role && <input type="hidden" name="role" value={role} />}

      {isSignUp && (
        <input name="fullName" placeholder="Full name" required className={fieldClass} />
      )}
      <input name="email" type="email" placeholder="Email" required className={fieldClass} />
      <PasswordField />

      {state.error && <p className="text-sm text-rose-600">{state.error}</p>}
      {state.notice && <p className="text-sm text-emerald-600">{state.notice}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-neutral-900 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
      >
        {pending ? "Please wait…" : isSignUp ? "Create owner account" : "Sign in"}
      </button>

      {showFooter && (
        <p className="pt-1 text-center text-sm text-neutral-500">
          {isSignUp ? (
            <>
              Already have an account?{" "}
              <Link href="/login" className="text-neutral-900 underline">
                Sign in
              </Link>
            </>
          ) : (
            <>
              New here?{" "}
              <Link href="/signup" className="text-neutral-900 underline">
                Create an account
              </Link>
            </>
          )}
        </p>
      )}
    </form>
  );
}
