"use client";

interface Props {
  label: string;
  active: boolean;
  onToggle: () => void;
}

export function AmenityToggle({ label, active, onToggle }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className={`rounded-full px-3 py-1 text-sm transition-colors ${
        active
          ? "bg-neutral-900 text-white"
          : "bg-white text-neutral-600 ring-1 ring-inset ring-neutral-200 hover:ring-neutral-300"
      }`}
    >
      {label}
    </button>
  );
}
