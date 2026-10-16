"use client";

import { resetConsent } from "@/lib/cookies/consent";
import { clearAllOptionalCookies } from "@/lib/cookies/clearAll";

// Lets a returning visitor change their mind: clears every optional cookie and
// the consent decision itself, so the banner reappears on the next page view.
export function ManageConsentButton() {
  return (
    <button
      onClick={() => {
        resetConsent();
        clearAllOptionalCookies();
        window.location.reload();
      }}
      className="mt-6 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
    >
      Reset cookie preferences
    </button>
  );
}
