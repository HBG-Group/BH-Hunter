"use client";

import { useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { toggleFavoriteAction } from "@/lib/student/actions";
import { useAuthModal } from "@/hooks/useAuthModal";

interface Props {
  boardingHouseId: string;
  initialFavorited: boolean;
  isAuthenticated?: boolean;
  variant?: "overlay" | "inline";
}

// Heart toggle. Guests get the sign-in modal; signed-in students toggle optimistically.
export function FavoriteButton({
  boardingHouseId,
  initialFavorited,
  isAuthenticated = true,
  variant = "overlay",
}: Props) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [pending, startTransition] = useTransition();
  const { open } = useAuthModal();
  const pathname = usePathname();

  const toggle = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    // Don't force sign-in — just invite it.
    if (!isAuthenticated) {
      open(pathname);
      return;
    }

    setFavorited((current) => !current);
    startTransition(async () => {
      const result = await toggleFavoriteAction(boardingHouseId);
      setFavorited(result);
    });
  };

  const base =
    variant === "overlay"
      ? "flex h-9 w-9 items-center justify-center rounded-full bg-white/85 backdrop-blur hover:bg-white"
      : "flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-inset ring-neutral-200 hover:ring-neutral-300";

  return (
    <button
      onClick={toggle}
      disabled={pending}
      aria-pressed={favorited}
      aria-label={favorited ? "Remove from favorites" : "Save to favorites"}
      className={`${base} transition disabled:opacity-60`}
    >
      <svg
        viewBox="0 0 24 24"
        style={{ width: 18, height: 18 }}
        fill={favorited ? "#e11d48" : "none"}
        stroke={favorited ? "#e11d48" : "#525252"}
        strokeWidth={2}
      >
        <path d="M12 21s-6.7-4.35-9.33-8.24C.9 10.02 1.64 6.5 4.6 5.4c1.9-.7 3.9.1 5 1.6 1.1-1.5 3.1-2.3 5-1.6 2.96 1.1 3.7 4.62 1.93 7.36C18.7 16.65 12 21 12 21z" />
      </svg>
    </button>
  );
}
