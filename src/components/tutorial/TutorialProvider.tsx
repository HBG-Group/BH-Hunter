"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { TOUR_STEPS } from "./steps";

type Phase = "welcome" | "tour";

interface TutorialState {
  phase: Phase;
  tourIndex: number;
  isLastTour: boolean;
  start: () => void;
  next: () => void;
  prev: () => void;
  skip: () => void;
  // Fired when the dashboard tour is finished — the parent then sends the owner to the
  // real listing form to practice there.
  finishTour: () => void;
}

const Ctx = createContext<TutorialState | null>(null);
export const useTutorial = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTutorial must be used inside TutorialProvider");
  return ctx;
};

// The dashboard portion of onboarding: a welcome screen and the spotlight tour. The
// hands-on listing practice happens afterwards on the real form (see ListingFormTour).
export function TutorialProvider({
  onSkip,
  onFinishTour,
  children,
}: {
  onSkip: () => void;
  onFinishTour: () => void;
  children: React.ReactNode;
}) {
  const [phase, setPhase] = useState<Phase>("welcome");
  const [tourIndex, setTourIndex] = useState(0);

  const state = useMemo<TutorialState>(
    () => ({
      phase,
      tourIndex,
      isLastTour: tourIndex === TOUR_STEPS.length - 1,
      start: () => setPhase("tour"),
      skip: onSkip,
      finishTour: onFinishTour,
      next: () => {
        if (phase === "welcome") return setPhase("tour");
        if (tourIndex < TOUR_STEPS.length - 1) return setTourIndex((i) => i + 1);
        return onFinishTour();
      },
      prev: () => {
        if (phase !== "tour") return;
        if (tourIndex === 0) return setPhase("welcome");
        return setTourIndex((i) => i - 1);
      },
    }),
    [phase, tourIndex, onSkip, onFinishTour],
  );

  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
}
