"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Spinner } from "@/components/ui/Spinner";

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  // While true the confirm action is running: show a spinner and block further clicks.
  pending?: boolean;
}

// Confirmation step before destructive actions (archive, take down, delete).
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
  pending = false,
}: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !pending) onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [open, onCancel, pending]);

  // Rendered into <body> so a transformed ancestor (an animated dropdown, a sticky
  // bar) can't become the containing block and push the dialog off-centre.
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={pending ? undefined : onCancel}
          className="fixed inset-0 z-[2500] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
          >
            <h2 id="confirm-title" className="text-base font-semibold text-neutral-900">
              {title}
            </h2>
            <p className="mt-1.5 text-sm text-neutral-500">{message}</p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                ref={cancelRef}
                onClick={onCancel}
                disabled={pending}
                className="rounded-xl px-4 py-2 text-sm font-medium text-neutral-700 ring-1 ring-inset ring-neutral-200 hover:ring-neutral-300 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={pending}
                className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-70"
              >
                {pending && <Spinner />}
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
