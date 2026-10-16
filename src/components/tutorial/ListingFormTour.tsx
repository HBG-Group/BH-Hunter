"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { completeOwnerTutorialAction } from "@/lib/owner/tutorial-actions";
import { TutorialOverlay } from "./TutorialOverlay";
import { useTargetRect, TutorialHighlight } from "./TutorialHighlight";
import { TutorialTooltip } from "./TutorialTooltip";
import { TutorialCelebration } from "./TutorialCelebration";
import { FORM_TOUR_STEPS } from "./steps";

type Phase = "tour" | "publish" | "celebrate";

// Runs on the REAL listing form. Highlights each real field, waits for the owner to type
// where it matters, then simulates publishing — with ZERO backend calls, so it's a true
// sandbox. Completion is persisted only for the first run (mode === "first").
export function ListingFormTour({ mode }: { mode: "first" | "replay" }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("tour");
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState(false);

  const step = FORM_TOUR_STEPS[index];
  const rect = useTargetRect(step?.target ?? "");
  const isLast = index === FORM_TOUR_STEPS.length - 1;

  // Guided interaction: for requireInput steps, watch the real field until it has a value.
  useEffect(() => {
    if (!step?.requireInput) return;
    const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
    if (!el) return;
    const filled = () => {
      const inputs = el.matches("input, textarea")
        ? [el as HTMLInputElement]
        : Array.from(el.querySelectorAll<HTMLInputElement>("input, textarea"));
      return inputs.some((i) => i.value.trim() !== "");
    };
    const onInput = () => setTyped(filled());
    // Sync from the real DOM field on entry, then on every keystroke.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTyped(filled());
    el.addEventListener("input", onInput, true);
    return () => el.removeEventListener("input", onInput, true);
  }, [step]);

  const end = () => {
    if (mode === "first") void completeOwnerTutorialAction();
    router.push("/owner");
  };

  const createReal = () => {
    if (mode === "first") void completeOwnerTutorialAction();
    // Drop the tutorial flag so they get a clean, real form.
    router.push("/owner/listings/new");
  };

  const next = () => {
    if (step?.requireInput && !typed) return;
    if (!isLast) return setIndex((i) => i + 1);
    setPhase("publish");
  };

  if (phase === "publish") return <PublishPhase onDone={() => setPhase("celebrate")} />;

  if (phase === "celebrate") {
    return (
      <TutorialOverlay onEscape={end} label="Tutorial complete">
        <TutorialCelebration onCreate={createReal} onReturn={end} />
      </TutorialOverlay>
    );
  }

  return (
    <AnimatePresence>
      <TutorialOverlay onEscape={end} label="Listing form practice" dim={!rect}>
        {rect && <TutorialHighlight rect={rect} />}
        <TutorialTooltip
          rect={rect}
          stepLabel={`Step ${index + 1} of ${FORM_TOUR_STEPS.length}`}
          title={step.title}
          body={step.requireInput && !typed ? `${step.body} (Try typing to continue.)` : step.body}
          isFirst={index === 0}
          isLast={isLast}
          nextLabel={isLast ? "Publish (demo)" : "Next"}
          onNext={next}
          onPrev={() => setIndex((i) => Math.max(0, i - 1))}
          onSkip={end}
        />
      </TutorialOverlay>
    </AnimatePresence>
  );
}

// Simulated publish — a brief spinner then success. No database writes.
function PublishPhase({ onDone }: { onDone: () => void }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const a = window.setTimeout(() => setDone(true), 1400);
    const b = window.setTimeout(onDone, 2600);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [onDone]);

  return (
    <TutorialOverlay onEscape={() => {}} label="Publishing">
      <div className="w-full max-w-xs rounded-2xl bg-white p-8 text-center shadow-xl">
        {done ? (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              ✓
            </div>
            <p className="mt-3 text-sm font-medium text-neutral-900">Published! (demo)</p>
          </>
        ) : (
          <>
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-primary" />
            <p className="mt-3 text-sm text-neutral-600">Publishing…</p>
          </>
        )}
      </div>
    </TutorialOverlay>
  );
}
