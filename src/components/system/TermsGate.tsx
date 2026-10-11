"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

// Bump this if the terms change materially and you want everyone to re-accept.
const STORAGE_KEY = "meino:terms-accepted-v1";

// A blocking welcome gate: on a visitor's first arrival, the Terms & Conditions must be
// read and the box ticked before they can use the site. The choice is remembered in the
// browser, so it only appears once. It renders nothing until mounted to avoid a
// hydration mismatch, and never blocks the /terms page itself.
export function TermsGate() {
  // ready=false until we've read localStorage after mount; accepted assumed true so the
  // gate never flashes during SSR/hydration.
  const [gate, setGate] = useState({ ready: false, accepted: true });
  const [checked, setChecked] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // One-time read of the persisted choice; localStorage is only available on the client.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGate({
      ready: true,
      accepted: window.localStorage.getItem(STORAGE_KEY) === "true",
    });
  }, []);

  const accept = () => {
    if (!checked) return;
    window.localStorage.setItem(STORAGE_KEY, "true");
    setGate((g) => ({ ...g, accepted: true }));
  };

  // Never block the /terms page itself — that's where they go to read before agreeing.
  const open = gate.ready && !gate.accepted && pathname !== "/terms";

  // While the gate is open, prevent the page behind it from scrolling.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="terms-gate-title"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2
              id="terms-gate-title"
              className="text-lg font-semibold text-neutral-900"
            >
              Welcome to Meino
            </h2>
            <p className="mt-2 text-sm text-neutral-500">
              Before you continue, please read and agree to how Meino works. We
              help students near VSU find boarding houses — we&apos;re not the
              landlord, and rental agreements are made directly between you and
              the owner.
            </p>

            <Link
              href={`/terms?returnTo=${encodeURIComponent(pathname)}`}
              className="mt-3 inline-block text-sm font-medium text-primary underline hover:text-primary-hover"
            >
              Read the full Terms &amp; Conditions
            </Link>

            <label className="mt-5 flex items-start gap-2.5 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
              />
              <span>I have read and agree to the Terms &amp; Conditions.</span>
            </label>

            <button
              onClick={accept}
              disabled={!checked}
              className="mt-5 w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              Agree and continue
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
