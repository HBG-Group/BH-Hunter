"use client";

import { motion } from "framer-motion";

// Where bug reports are collected now — a shared Google Sheet.
const BUG_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1lTFUOqrChDgIhTGI-v3YniY35LeKyBDV5ndFLyCfBU4/edit?gid=1718338933#gid=1718338933";

// A floating "report a bug" button in the bottom-left corner. It gently bobs to draw
// the eye; clicking opens the bug-report spreadsheet in a new tab.
export function BugReporter() {
  return (
    <div className="fixed bottom-4 left-4 z-[1500] print:hidden">
      <motion.a
        href={BUG_SHEET_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Report a bug"
        // Gentle float so it reads as an inviting, live control.
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg ring-1 ring-black/10 hover:bg-neutral-800"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M8 2l1.5 2.5M16 2l-1.5 2.5" />
          <rect x="8" y="6" width="8" height="12" rx="4" />
          <path d="M12 6v12M8 10H4M8 14H4.5M16 10h4M16 14h3.5M8 8L5 6M16 8l3-2M8 16l-3 2M16 16l3 2" />
        </svg>
      </motion.a>
    </div>
  );
}
