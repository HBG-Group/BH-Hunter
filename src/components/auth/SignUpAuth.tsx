"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { signUpAction } from "@/lib/auth/actions";

interface Props {
  role: "OWNER" | "STUDENT";
  next: string;
}

// The full sign-up block (Google + email). One Terms & Conditions checkbox governs
// both paths: until it's ticked, neither can create an account. The server also
// re-checks, so this is UX, not the only gate.
export function SignUpAuth({ role, next }: Props) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="space-y-4">
      <label className="flex items-start gap-2.5 text-sm text-neutral-600">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
        />
        <span>
          I agree to Meino&apos;s{" "}
          <Link href="/terms" target="_blank" className="text-neutral-900 underline hover:text-neutral-700">
            Terms &amp; Conditions
          </Link>
          .
        </span>
      </label>

      <GoogleButton next={next} role={role} disabled={!agreed} />
      <AuthDivider />
      <AuthForm mode="signup" action={signUpAction} role={role} agreed={agreed} />
    </div>
  );
}
