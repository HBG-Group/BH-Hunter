"use client";

import { useActionState } from "react";
import Link from "next/link";
import { PasswordField } from "@/components/auth/PasswordField";
import { Spinner } from "@/components/ui/Spinner";
import type { AuthFormState } from "@/lib/auth/actions";

type AuthAction = (
  state: AuthFormState,
  formData: FormData,
) => Promise<AuthFormState>;

interface Props {
  mode: "signin" | "signup";
  action: AuthAction;
  next?: string;
  // On sign-up, which kind of account to create.
  role?: "OWNER" | "STUDENT";
  // Hidden for the admin login, which has no public sign-up.
  showFooter?: boolean;
  // Sign-up only: whether the Terms & Conditions box is ticked. When defined, the
  // submit button stays disabled until it's true and the value is sent to the server.
  agreed?: boolean;
}

const fieldClass =
  "w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-neutral-400";

export function AuthForm({
  mode,
  action,
  next,
  role,
  showFooter = true,
  agreed,
}: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const isSignUp = mode === "signup";
  // Only gate on the terms box when the parent actually passes it (sign-up pages).
  const blockedByTerms = isSignUp && agreed !== undefined && !agreed;

  return (
    <form action={formAction} className="space-y-3">
      {next && <input type="hidden" name="next" value={next} />}
      {isSignUp && role && <input type="hidden" name="role" value={role} />}
      {isSignUp && agreed !== undefined && (
        <input type="hidden" name="terms" value={agreed ? "on" : ""} />
      )}

      {isSignUp && (
        <input
          name="fullName"
          placeholder="Full name"
          autoComplete="name"
          required
          className={fieldClass}
        />
      )}
      <input
        name="email"
        type="email"
        placeholder="Email"
        autoComplete="email"
        required
        className={fieldClass}
      />
      <PasswordField
        autoComplete={isSignUp ? "new-password" : "current-password"}
      />

      {!isSignUp && (
        <p className="text-xs text-neutral-500">
          Password reset is coming soon — please double-check your email and
          password before signing in. After 5 incorrect attempts you&apos;ll be
          locked out for 30 seconds.
        </p>
      )}

      {state.error && <p className="text-sm text-rose-600">{state.error}</p>}
      {state.notice && (
        <p className="text-sm text-emerald-600">{state.notice}</p>
      )}

      <button
        type="submit"
        disabled={pending || blockedByTerms}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60"
      >
        {pending && <Spinner />}
        {pending
          ? "Please wait…"
          : isSignUp
            ? `Create ${role === "OWNER" ? "owner" : "student"} account`
            : "Sign in"}
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
