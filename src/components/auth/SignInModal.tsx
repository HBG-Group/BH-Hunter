"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { safeRedirectPath } from "@/lib/security/redirect";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
  next: string | null;
  onClose: () => void;
}

// The gentle sign-in prompt shown when a guest uses a student-only feature.
export function SignInModal({ next, onClose }: Props) {
  const router = useRouter();
  const isOpen = next !== null;
  const returnTo = safeRedirectPath(next, "/");
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const goToEmail = () => {
    onClose();
    router.push(`/login?next=${encodeURIComponent(returnTo)}`);
  };

  // Focus trap: Escape closes, Tab cycles inside, focus returns to the trigger.
  useEffect(() => {
    if (!isOpen) return;
    previouslyFocused.current = document.activeElement as HTMLElement;
    const items = () =>
      Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>('button, a[href], input, [tabindex]:not([tabindex="-1"])') ?? [],
      ).filter((el) => !el.hasAttribute("disabled"));
    items()[0]?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") return onClose();
      if (event.key !== "Tab") return;
      const list = items();
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previouslyFocused.current?.focus();
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="signin-modal-title"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 id="signin-modal-title" className="text-lg font-semibold text-neutral-900">
              Sign in to unlock extra features
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Save favorites, leave reviews, and get room alerts. Browsing stays free.
            </p>

            <div className="mt-5 space-y-2.5">
              <button
                onClick={goToEmail}
                className="w-full rounded-xl bg-neutral-900 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
              >
                Sign in with Email
              </button>
              <button
                onClick={onClose}
                className="w-full rounded-xl py-2.5 text-sm font-medium text-neutral-500 hover:text-neutral-800"
              >
                Continue as Guest
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
