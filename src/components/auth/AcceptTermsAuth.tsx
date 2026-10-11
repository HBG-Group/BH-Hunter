"use client";

import { useState } from "react";
import Link from "next/link";
import { GoogleButton } from "@/components/auth/GoogleButton";

export function AcceptTermsAuth({ next }: { next: string }) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="space-y-4">
      <label className="flex items-start gap-2.5 text-sm text-neutral-600">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(event) => setAgreed(event.target.checked)}
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
      <GoogleButton
        next={next}
        disabled={!agreed}
        termsAccepted={agreed}
        requireTermsConsent
        label="Accept and continue with Google"
      />
    </div>
  );
}
