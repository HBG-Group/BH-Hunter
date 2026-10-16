"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CHECKLIST_ITEMS } from "./steps";

const DISMISS_KEY = "meino:getting-started-dismissed-v1";

// A small "Getting Started" checklist on the dashboard. `done` is computed from real
// data server-side. It auto-hides once everything is complete, and can be dismissed
// manually (dismissal is a view preference, so localStorage is fine for that alone).
export function TutorialChecklist({ done }: { done: Record<string, boolean> }) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDismissed(window.localStorage.getItem(DISMISS_KEY) === "true");
  }, []);

  const allDone = CHECKLIST_ITEMS.every((item) => done[item.key]);
  const completed = CHECKLIST_ITEMS.filter((item) => done[item.key]).length;

  const dismiss = () => {
    window.localStorage.setItem(DISMISS_KEY, "true");
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      {!dismissed && !allDone && (
        <motion.section
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden rounded-2xl border border-neutral-200 bg-white"
        >
          <div className="flex items-center justify-between px-5 pt-4">
            <h2 className="text-base font-semibold text-neutral-900">
              Getting started
              <span className="ml-2 text-sm font-normal text-neutral-400">
                {completed}/{CHECKLIST_ITEMS.length}
              </span>
            </h2>
            <button onClick={dismiss} aria-label="Dismiss checklist" className="text-sm text-neutral-400 hover:text-neutral-700">
              Dismiss
            </button>
          </div>
          <ul className="space-y-1 px-5 pb-4 pt-2">
            {CHECKLIST_ITEMS.map((item) => (
              <li key={item.key} className="flex items-center gap-2.5 text-sm">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                    done[item.key] ? "bg-emerald-500 text-white" : "border border-neutral-300 text-transparent"
                  }`}
                >
                  ✓
                </span>
                <span className={done[item.key] ? "text-neutral-400 line-through" : "text-neutral-700"}>
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
