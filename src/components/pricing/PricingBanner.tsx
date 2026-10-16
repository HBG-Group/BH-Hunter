"use client";

import { useEffect, useState } from "react";
import { dismissNotice, isNoticeDismissed } from "@/lib/cookies/dismissed";

const NOTICE_ID = "beta-announcement";

// The beta announcement at the top of the pricing page — noticeable but calm.
// Dismissible; won't reappear on later visits once closed (consenting visitors).
export function PricingBanner() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDismissed(isNoticeDismissed(NOTICE_ID));
  }, []);

  if (dismissed) return null;

  return (
    <div className="relative rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center sm:p-5">
      <button
        onClick={() => {
          dismissNotice(NOTICE_ID);
          setDismissed(true);
        }}
        aria-label="Dismiss beta announcement"
        className="absolute right-3 top-3 rounded-md p-1 text-emerald-700 hover:bg-emerald-100"
      >
        ✕
      </button>
      <p className="text-sm font-semibold text-emerald-900">
        🧪 Meino is currently in Free Beta
      </p>
      <p className="mx-auto mt-1 max-w-2xl text-sm text-emerald-800">
        All features are completely free during our one-month testing period. The pricing below
        represents our planned launch pricing after the beta ends.
      </p>
    </div>
  );
}
