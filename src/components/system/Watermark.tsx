// A subtle, non-interactive watermark shown on every page. Sits above content but below
// modals, and never intercepts clicks.
export function Watermark() {
  return (
    <span
      aria-hidden
      className="pointer-events-none fixed bottom-2 right-3 z-40 select-none text-[10px] font-medium uppercase tracking-wider text-neutral-400/50"
    >
      HBG Production
    </span>
  );
}
