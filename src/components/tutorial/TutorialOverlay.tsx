"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface Props {
  onEscape: () => void;
  label: string;
  // When true the backdrop is a plain dim; the tour phase draws its own spotlight.
  dim?: boolean;
  children: React.ReactNode;
}

// Shared modal shell: dim backdrop, focus trap, Escape to leave, and correct dialog
// semantics for screen readers. Presentational — the flow decides what goes inside.
export function TutorialOverlay({ onEscape, label, dim = true, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement;
    const focusables = () =>
      Array.from(
        ref.current?.querySelectorAll<HTMLElement>(
          'button, a[href], input, textarea, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => !el.hasAttribute("disabled"));
    focusables()[0]?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") return onEscape();
      if (event.key !== "Tab") return;
      const list = focusables();
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
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused.current?.focus();
    };
  }, [onEscape]);

  return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[2400] flex items-center justify-center p-4 ${
        dim ? "bg-black/50 backdrop-blur-sm" : "pointer-events-none"
      }`}
    >
      {children}
    </motion.div>
  );
}
