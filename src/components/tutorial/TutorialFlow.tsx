"use client";

import { AnimatePresence } from "framer-motion";
import { TutorialProvider, useTutorial } from "./TutorialProvider";
import { TutorialOverlay } from "./TutorialOverlay";
import { useTargetRect, TutorialHighlight } from "./TutorialHighlight";
import { TutorialTooltip } from "./TutorialTooltip";
import { WELCOME_POINTS, TOUR_STEPS } from "./steps";

// The dashboard onboarding: welcome + spotlight tour. Default export so it lazy-loads.
// `onSkip` ends the flow; `onFinishTour` hands off to the real listing form for practice.
export default function TutorialFlow({
  onSkip,
  onFinishTour,
}: {
  onSkip: () => void;
  onFinishTour: () => void;
}) {
  return (
    <TutorialProvider onSkip={onSkip} onFinishTour={onFinishTour}>
      <AnimatePresence>
        <FlowInner />
      </AnimatePresence>
    </TutorialProvider>
  );
}

function FlowInner() {
  const t = useTutorial();

  if (t.phase === "welcome") {
    return (
      <TutorialOverlay onEscape={t.skip} label="Welcome to the owner tutorial">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-neutral-900">Welcome to Meino!</h2>
          <p className="mt-1 text-sm text-neutral-600">
            We&apos;ll guide you through your dashboard, then help you practice creating a listing —
            in about 2 minutes. You&apos;ll learn how to:
          </p>
          <ul className="mt-4 space-y-2">
            {WELCOME_POINTS.map((point) => (
              <li key={point} className="flex items-center gap-2 text-sm text-neutral-700">
                <span className="text-primary">•</span>
                {point}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex justify-end gap-2">
            <button onClick={t.skip} className="rounded-xl px-4 py-2 text-sm font-medium text-neutral-500 hover:text-neutral-800">
              Skip
            </button>
            <button onClick={t.start} className="rounded-xl bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-hover">
              Start Tutorial
            </button>
          </div>
        </div>
      </TutorialOverlay>
    );
  }

  return <TourPhase />;
}

// The dashboard tour: one spotlight + tooltip at a time, following the real elements.
function TourPhase() {
  const t = useTutorial();
  const step = TOUR_STEPS[t.tourIndex];
  const rect = useTargetRect(step.target);

  return (
    <TutorialOverlay onEscape={t.skip} label="Dashboard tour" dim={!rect}>
      {rect && <TutorialHighlight rect={rect} />}
      <TutorialTooltip
        rect={rect}
        stepLabel={`Step ${t.tourIndex + 1} of ${TOUR_STEPS.length}`}
        title={step.title}
        body={step.body}
        isFirst={false}
        isLast={t.isLastTour}
        nextLabel={t.isLastTour ? "Try it out" : "Next"}
        onNext={t.next}
        onPrev={t.prev}
        onSkip={t.skip}
      />
    </TutorialOverlay>
  );
}
