"use client";

interface Props {
  label: string;
  active: boolean;
  onClick: () => void;
}

// Pill-style toggle used for quick filters. Blue when active, quiet when not.
export function Pill({ label, active, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-150 ${
        active
          ? "bg-primary text-white"
          : "bg-white text-muted ring-1 ring-inset ring-line hover:ring-neutral-300"
      }`}
    >
      {label}
    </button>
  );
}
