"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { fileReportAction } from "@/lib/report/actions";
import {
  REPORT_REASONS_BY_TARGET,
  REPORT_REASON_LABELS,
  REPORT_TARGET_LABELS,
  type ReportReason,
  type ReportTargetType,
} from "@/config/reports";

interface Props {
  targetType: ReportTargetType;
  targetId: string;
  onClose: () => void;
}

// Shared report dialog for listings, reviews, owners, and students — only the
// reason list changes per target type (config/reports.ts is the single source).
export function ReportModal({ targetType, targetId, onClose }: Props) {
  const [reason, setReason] = useState<ReportReason | "">("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const reasons = REPORT_REASONS_BY_TARGET[targetType];

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement;
    dialogRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previouslyFocused.current?.focus();
    };
  }, [onClose]);

  const submit = async () => {
    if (!reason) {
      setError("Please choose a reason.");
      return;
    }
    setStatus("submitting");
    setError(null);
    const result = await fileReportAction({ targetType, targetId, reason, message: message || undefined });
    if (result.error) {
      setError(result.error);
      setStatus("idle");
      return;
    }
    setStatus("done");
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      >
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-modal-title"
          tabIndex={-1}
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          onClick={(event) => event.stopPropagation()}
          className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"
        >
          {status === "done" ? (
            <div>
              <h2 id="report-modal-title" className="text-lg font-semibold text-ink">
                Report received
              </h2>
              <p className="mt-2 text-sm text-muted">
                Thanks for helping keep Meino trustworthy. An admin will review this shortly.
              </p>
              <button
                onClick={onClose}
                className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <h2 id="report-modal-title" className="text-lg font-semibold text-ink">
                Report this {REPORT_TARGET_LABELS[targetType]}
              </h2>
              <p className="mt-1 text-sm text-muted">
                Let us know what&apos;s wrong. Reports are reviewed by an admin.
              </p>

              <fieldset className="mt-4">
                <legend className="text-sm font-medium text-ink">Reason</legend>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {reasons.map((r) => (
                    <label
                      key={r}
                      className={`cursor-pointer rounded-lg border px-3 py-2 text-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary ${
                        reason === r ? "border-primary bg-primary/5 text-ink" : "border-line text-muted"
                      }`}
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={r}
                        checked={reason === r}
                        onChange={() => setReason(r)}
                        className="sr-only"
                      />
                      {REPORT_REASON_LABELS[r]}
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="mt-4 block text-sm font-medium text-ink" htmlFor="report-message">
                Details (optional)
              </label>
              <textarea
                id="report-message"
                value={message}
                onChange={(event) => setMessage(event.target.value.slice(0, 500))}
                rows={3}
                maxLength={500}
                className="mt-1.5 w-full rounded-lg border border-line px-3 py-2 text-sm text-ink outline-none focus:border-primary"
                placeholder="Anything that helps us review this."
              />

              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={onClose}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-ink ring-1 ring-inset ring-line hover:ring-neutral-300"
                >
                  Cancel
                </button>
                <button
                  onClick={submit}
                  disabled={status === "submitting"}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60"
                >
                  {status === "submitting" ? "Sending…" : "Submit report"}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
