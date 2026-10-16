"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface NavLink {
  href: string;
  label: string;
}

const navLinks: NavLink[] = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/listings", label: "Listings" },
  { href: "/admin/owners", label: "Owners" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/ads", label: "Ads" },
  { href: "/admin/audit-log", label: "Audit log" },
  { href: "/admin/notifications", label: "Notifications" },
];

// Inline links on desktop; a hamburger dropdown on mobile, matching the
// student/owner header pattern instead of a horizontally-scrolling row.
export function AdminNav() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <>
      <nav className="hidden items-center gap-4 text-sm text-neutral-600 sm:flex">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="hover:text-neutral-900"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="relative sm:hidden" ref={ref}>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Admin menu"
          aria-expanded={open}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-neutral-700 hover:bg-neutral-100"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>

        {open && (
          <div className="absolute left-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
