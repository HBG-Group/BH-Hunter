// Shown on listings an admin has verified — the trust signal for students.
export function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
      <svg viewBox="0 0 24 24" width={12} height={12} fill="currentColor">
        <path d="M12 2l2.4 1.8 3 .1 1 2.8 2.4 1.7-.9 2.9.9 2.9-2.4 1.7-1 2.8-3 .1L12 22l-2.4-1.8-3-.1-1-2.8L3.2 15l.9-2.9-.9-2.9 2.4-1.7 1-2.8 3-.1L12 2zm-1 13l5-5-1.4-1.4L11 12.2 9.4 10.6 8 12l3 3z" />
      </svg>
      Verified
    </span>
  );
}
