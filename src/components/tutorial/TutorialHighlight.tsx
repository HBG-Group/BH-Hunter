"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

// Finds the element tagged [data-tour="target"], scrolls it into view, and tracks its
// position so the spotlight follows it on resize/scroll. Returns null until measured.
export function useTargetRect(target: string): Rect | null {
  const [rect, setRect] = useState<Rect | null>(null);

  useEffect(() => {
    const el = document.querySelector<HTMLElement>(`[data-tour="${target}"]`);
    if (!el) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRect(null);
      return;
    }
    el.scrollIntoView({ behavior: "smooth", block: "center" });

    const measure = () => {
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    // Let the smooth scroll settle before the first measure.
    const id = window.setTimeout(measure, 250);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [target]);

  return rect;
}

// The dimmed surround with a bright "hole" over the target — the classic product-tour
// spotlight, drawn with one big box-shadow so it never blocks clicks.
export function TutorialHighlight({ rect }: { rect: Rect }) {
  const pad = 6;
  return (
    <motion.div
      aria-hidden
      initial={false}
      animate={{ top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      className="pointer-events-none fixed z-[2410] rounded-xl ring-2 ring-primary"
      style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)" }}
    />
  );
}
