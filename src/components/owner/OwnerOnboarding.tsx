"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { completeOwnerTutorialAction } from "@/lib/owner/tutorial-actions";

// Lazy-loaded so returning owners never pay for the tutorial bundle — only fetched when
// the flow opens (first-time auto-launch, or a manual replay).
const TutorialFlow = dynamic(() => import("@/components/tutorial/TutorialFlow"), { ssr: false });

// `autoLaunch` comes from the database flag (ownerTutorialCompleted === false); the
// backend is the source of truth. The dashboard tour hands off to the real listing form
// (in sandbox mode) so the owner practices on the actual UI.
export function OwnerOnboarding({ autoLaunch }: { autoLaunch: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<"auto" | "replay" | null>(autoLaunch ? "auto" : null);

  const skip = () => {
    // Skipping the FIRST run marks it complete; replays never write.
    if (mode === "auto") void completeOwnerTutorialAction();
    setMode(null);
  };

  const finishTour = () => {
    // Continue the practice on the real form, carrying the mode so the form knows
    // whether to persist completion at the very end.
    const flow = mode === "replay" ? "replay" : "first";
    setMode(null);
    router.push(`/owner/listings/new?tutorial=${flow}`);
  };

  return (
    <>
      <button
        onClick={() => setMode("replay")}
        className="text-sm font-medium text-primary hover:text-primary-hover"
      >
        Replay tutorial
      </button>
      {mode && <TutorialFlow onSkip={skip} onFinishTour={finishTour} />}
    </>
  );
}
