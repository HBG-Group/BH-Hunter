"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getConsent, setConsent } from "@/lib/cookies/consent";
import { clearAllOptionalCookies } from "@/lib/cookies/clearAll";

// First-visit banner. Shown only when no consent decision exists yet.
// Rejecting keeps essential cookies (auth session) working; every optional
// cookie helper in lib/cookies checks consent before writing.
export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(getConsent() === null);
  }, []);

  useEffect(() => {
    if (visible) dialogRef.current?.focus();
  }, [visible]);

  const accept = () => {
    setConsent("accepted");
    setVisible(false);
  };

  const reject = () => {
    setConsent("rejected");
    // Rejecting clears anything optional that may already be set.
    clearAllOptionalCookies();
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="region"
          aria-labelledby="cookie-consent-title"
          aria-describedby="cookie-consent-desc"
          ref={dialogRef}
          tabIndex={-1}
          onKeyDown={(e) => {
            if (e.key === "Escape") reject();
          }}
          className="fixed inset-x-0 bottom-0 z-[1200] px-4 pb-4 sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-md sm:px-0"
        >
          <div className="rounded-2xl border border-line bg-white p-5 shadow-lg">
            <p id="cookie-consent-title" className="text-sm font-semibold text-ink">
              We use cookies
            </p>
            <p id="cookie-consent-desc" className="mt-1.5 text-sm text-muted">
              Essential cookies keep you signed in. With your consent, we&apos;ll also remember
              things like your search filters and recently viewed places.{" "}
              <a href="/cookies" className="text-primary underline hover:text-primary-hover">
                Learn more
              </a>
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={accept}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
              >
                Accept
              </button>
              <button
                onClick={reject}
                className="rounded-lg px-4 py-2 text-sm font-medium text-ink ring-1 ring-inset ring-line hover:ring-neutral-300"
              >
                Reject non-essential
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
