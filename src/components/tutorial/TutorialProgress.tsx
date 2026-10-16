"use client";

// A slim progress bar of dots for the tour + sandbox steps.
export function TutorialProgress({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex gap-1.5" aria-label={`Step ${current} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-colors ${
            i < current ? "bg-primary" : "bg-neutral-200"
          }`}
        />
      ))}
    </div>
  );
}
