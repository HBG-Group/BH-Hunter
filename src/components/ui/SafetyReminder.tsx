interface Props {
  message: string;
  className?: string;
}

// Small, non-dismissible safety nudge shown near places where money or contact info
// changes hands (contact panel, viewing request). Deliberately plain — not a modal,
// not something to click through, just a reminder that stays visible.
export function SafetyReminder({ message, className }: Props) {
  return (
    <p className={`flex items-start gap-1.5 text-xs text-muted ${className ?? ""}`}>
      <span aria-hidden>🛡️</span>
      <span>{message}</span>
    </p>
  );
}
