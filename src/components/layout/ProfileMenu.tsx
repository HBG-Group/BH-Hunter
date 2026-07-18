"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { signOutAction } from "@/lib/auth/actions";

interface Props {
  name: string;
  avatarUrl: string | null;
}

const links = [
  { href: "/account", label: "My profile" },
  { href: "/account#favorites", label: "Favorites" },
  { href: "/account#settings", label: "Settings" },
];

// The signed-in avatar with a dropdown. Closes on outside click.
export function ProfileMenu({ name, avatarUrl }: Props) {
  const [open, setOpen] = useState(false);
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
      <button onClick={() => setOpen((v) => !v)} className="flex items-center rounded-full">
        <Avatar name={name} src={avatarUrl} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg">
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
          <form action={signOutAction} className="border-t border-neutral-100">
            <button className="block w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50">
              Log out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
