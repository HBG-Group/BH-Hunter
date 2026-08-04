"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Rect } from "./TutorialHighlight";

interface Props {
  rect: Rect | null;
  title: string;
  body: string;
  stepLabel: string;
  isFirst: boolean;
  isLast: boolean;
  nextLabel?: string;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

const WIDTH = 300;

// A tooltip card anchored under (or above) the highlighted element, clamped so it never
// runs off-screen on mobile. Falls back to centered when there's no target.
export function TutorialTooltip({ rect, title, body, stepLabel, isFirst, isLast, nextLabel, onNext, onPrev, onSkip }: Props) {
  const [vw, setVw] = useState(1024);
  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Prefer below the target; flip above when there isn't room.
  const below = rect ? rect.top + rect.height + 12 : 0;
  const placeAbove = rect ? below + 180 > window.innerHeight : false;
  const top = rect ? (placeAbove ? Math.max(12, rect.top - 180) : below) : 0;
  const rawLeft = rect ? rect.left + rect.width / 2 - WIDTH / 2 : 0;
  const left = Math.min(Math.max(12, rawLeft), Math.max(12, vw - WIDTH - 12));

  const positioned = rect
    ? { position: "fixed" as const, top, left, width: WIDTH }
    : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      style={positioned}
      className={`pointer-events-auto z-[2420] rounded-2xl bg-white p-4 shadow-xl ${
        rect ? "" : "w-full max-w-sm"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-primary">{stepLabel}</span>
        <button onClick={onSkip} className="text-xs text-neutral-400 hover:text-neutral-700">
          Skip tutorial
        </button>
      </div>
      <h3 className="mt-2 text-base font-semibold text-neutral-900">{title}</h3>
      <p className="mt-1 text-sm text-neutral-600">{body}</p>

      <div className="mt-4 flex justify-between gap-2">
        <button
          onClick={onPrev}
          disabled={isFirst}
          className="rounded-xl px-3 py-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 disabled:opacity-40"
        >
          Previous
        </button>
        <button
          onClick={onNext}
          className="rounded-xl bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-hover"
        >
          {nextLabel ?? (isLast ? "Continue" : "Next")}
        </button>
      </div>
    </motion.div>
  );
}
