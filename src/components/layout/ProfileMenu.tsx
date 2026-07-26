"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { signOutAction } from "@/lib/auth/actions";

interface MenuLink {
  href: string;
  label: string;
}

interface Props {
  name: string;
  avatarUrl: string | null;
  links?: MenuLink[];
  isAdmin?: boolean;
  // Where "Admin view" points. Defaults to same-site /admin; on production it's the
  // separate admin domain.
  adminHref?: string;
}

const studentLinks: MenuLink[] = [
  { href: "/account", label: "My profile" },
  { href: "/account#favorites", label: "Favorites" },
  { href: "/account#settings", label: "Settings" },
];

// The signed-in avatar with a dropdown. Closes on outside click.
export function ProfileMenu({
  name,
  avatarUrl,
  links = studentLinks,
  isAdmin = false,
  adminHref = "/admin",
}: Props) {
  const [open, setOpen] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-expanded={open}
        className="flex items-center rounded-full"
      >
        <Avatar name={name} src={avatarUrl} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg">
          <p className="truncate px-4 py-2 text-xs text-neutral-500">{name}</p>
          {isAdmin && (
            <a
              href={adminHref}
              onClick={() => setOpen(false)}
              className="block border-b border-neutral-100 px-4 py-2 text-sm font-medium text-primary hover:bg-neutral-50"
            >
              Admin view
            </a>
          )}
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => {
              setOpen(false);
              setConfirmSignOut(true);
            }}
            className="block w-full border-t border-neutral-100 px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50"
          >
            Log out
          </button>
        </div>
      )}

      {/* Confirm so an accidental tap doesn't sign you out */}
      <ConfirmDialog
        open={confirmSignOut}
        title="Log out?"
        message="You'll need to sign in again to manage your listings and favorites."
        confirmLabel={signingOut ? "Logging out…" : "Log out"}
        pending={signingOut}
        onCancel={() => setConfirmSignOut(false)}
        onConfirm={() => {
          // Keep the dialog open with a spinner; the server action redirects on success.
          setSigningOut(true);
          void signOutAction();
        }}
      />
    </div>
  );
}
