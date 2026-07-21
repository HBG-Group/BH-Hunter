"use client";

import { usePathname } from "next/navigation";
import { useAuthModal } from "@/hooks/useAuthModal";

// Opens the sign-in modal and returns the user to the current page afterwards.
export function SignInButton() {
  const { open } = useAuthModal();
  const pathname = usePathname();

  return (
    <button
      onClick={() => open(pathname)}
      className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-hover"
    >
      Sign in
    </button>
  );
}
