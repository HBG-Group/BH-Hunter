"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

// A tasteful, self-contained confetti burst (no external library) that fades after a few
// seconds, plus the completion message and next-step buttons.
export function TutorialCelebration({
  onCreate,
  onReturn,
}: {
  onCreate: () => void;
  onReturn: () => void;
}) {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const id = window.setTimeout(() => setShowConfetti(false), 3200);
    return () => window.clearTimeout(id);
  }, []);

  // Deterministic spread (no Math.random in render) — enough variety to read as confetti.
  const pieces = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: (i * 37) % 100,
        delay: (i % 8) * 0.06,
        color: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"][i % 5],
        rotate: (i * 53) % 360,
      })),
    [],
  );

  return (
    <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
      {showConfetti && (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-[2430] overflow-hidden">
          {pieces.map((p) => (
            <motion.span
              key={p.id}
              initial={{ top: "-5%", opacity: 1, rotate: 0 }}
              animate={{ top: "105%", opacity: 0.9, rotate: p.rotate }}
              transition={{ duration: 2.6, delay: p.delay, ease: "easeIn" }}
              style={{ left: `${p.left}%`, backgroundColor: p.color }}
              className="absolute h-2.5 w-2.5 rounded-sm"
            />
          ))}
        </div>
      )}

      <div className="text-4xl">🎉</div>
      <h2 className="mt-3 text-lg font-semibold text-neutral-900">Congratulations!</h2>
      <p className="mt-1 text-sm text-neutral-600">
        You&apos;ve completed the Meino Owner Tutorial. You&apos;re ready to publish your first real
        boarding house.
      </p>

      <div className="mt-5 space-y-2">
        <button
          onClick={onCreate}
          className="block w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
        >
          Create My First Real Listing
        </button>
        <button
          onClick={onReturn}
          className="block w-full rounded-xl py-2.5 text-sm font-medium text-neutral-500 hover:text-neutral-800"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
