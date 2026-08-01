"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NAV_LINKS, type NavLink } from "@/components/layout/navLinks";

// Hamburger menu that mirrors the desktop nav links on small screens.
export function MobileMenu({ links = NAV_LINKS }: { links?: NavLink[] }) {
  const [open, setOpen] = useState(false);

  // Close on Escape and lock background scroll while open.
  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="sm:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu"
        aria-expanded={open}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-700 hover:bg-neutral-100"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Overlay fades in; tapping it closes the menu */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 top-[57px] z-[1090] bg-black/20"
            />
            {/* Panel slides down slightly and fades */}
            <motion.nav
              key="panel"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-0 right-0 top-full z-[1101] border-b border-line bg-white shadow-sm"
            >
              <div className="mx-auto flex max-w-7xl flex-col px-4 py-2">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="py-2.5 text-sm text-ink hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}

                {/* Owner login — keeps the top bar clean while giving owners a path */}
                <div className="mt-1 border-t border-line pt-2">
                  <Link
                    href="/list-your-property"
                    onClick={() => setOpen(false)}
                    className="block py-2.5 text-sm font-medium text-primary"
                  >
                    List your property
                  </Link>
                  <p className="pb-1 text-xs text-muted">Boarding house owner? Manage your listings here.</p>
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
