"use client";

import { useCallback, useState } from "react";
import { AuthModalContext } from "@/hooks/useAuthModal";
import { SignInModal } from "@/components/auth/SignInModal";

// Holds the sign-in modal state and exposes open() to the whole app through context.
export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [next, setNext] = useState<string | null>(null);

  const open = useCallback((returnTo = "/") => setNext(returnTo), []);
  const close = useCallback(() => setNext(null), []);

  return (
    <AuthModalContext.Provider value={{ open }}>
      {children}
      <SignInModal next={next} onClose={close} />
    </AuthModalContext.Provider>
  );
}
