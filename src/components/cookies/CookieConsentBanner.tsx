"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getConsent, setConsent, setCustomConsent, type ConsentCategories } from "@/lib/cookies/consent";
import { clearAllOptionalCookies, clearCategoryCookies } from "@/lib/cookies/clearAll";

const DEFAULT_CATEGORIES: ConsentCategories = { preferences: false, activity: false };

// First-visit banner. Shown only when no consent decision exists yet.
// Rejecting keeps essential cookies (auth session) working; every optional
// cookie helper in lib/cookies checks its category's consent before writing.
export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [categories, setCategories] = useState<ConsentCategories>(DEFAULT_CATEGORIES);
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

  const saveCustom = () => {
    setCustomConsent(categories);
    if (!categories.preferences) clearCategoryCookies("preferences");
    if (!categories.activity) clearCategoryCookies("activity");
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

            {customizing ? (
              <div className="mt-4 space-y-3">
                <label className="flex items-start gap-2.5 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={categories.preferences}
                    onChange={(e) => setCategories((c) => ({ ...c, preferences: e.target.checked }))}
                    className="mt-0.5"
                  />
                  <span>
                    <span className="font-medium">Preferences</span>
                    <span className="block text-xs text-muted">Theme, sidebar, language, map style.</span>
                  </span>
                </label>
                <label className="flex items-start gap-2.5 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={categories.activity}
                    onChange={(e) => setCategories((c) => ({ ...c, activity: e.target.checked }))}
                    className="mt-0.5"
                  />
                  <span>
                    <span className="font-medium">Activity</span>
                    <span className="block text-xs text-muted">
                      Search filters, recently viewed, dismissed notices.
                    </span>
                  </span>
                </label>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={saveCustom}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
                  >
                    Save choices
                  </button>
                  <button
                    onClick={() => setCustomizing(false)}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-ink ring-1 ring-inset ring-line hover:ring-neutral-300"
                  >
                    Back
                  </button>
                </div>
              </div>
            ) : (
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
                <button
                  onClick={() => setCustomizing(true)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-muted hover:text-ink"
                >
                  Customize
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
