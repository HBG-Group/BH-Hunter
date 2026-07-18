"use client";

import { createContext, useContext } from "react";

export interface AuthModalContextValue {
  // Open the sign-in modal; `next` is where to return after signing in.
  open: (next?: string) => void;
}

export const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function useAuthModal(): AuthModalContextValue {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
}
