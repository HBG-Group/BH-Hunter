import Link from "next/link";

interface Props {
  href?: string;
  // Wordmark shown beside the mark; omit for a compact mark-only lockup.
  label?: string | null;
  className?: string;
}

// The Meino mark: a doorway, for the "find your place" idea. Kept as inline SVG so it
// inherits currentColor and stays crisp at every size.
export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`flex items-center justify-center rounded-xl bg-primary text-white ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-[60%] w-[60%]">
        <path
          d="M4 20V10.2c0-.4.18-.77.49-1.02l6.5-5.2a1.3 1.3 0 0 1 1.62 0l6.5 5.2c.31.25.49.62.49 1.02V20"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.6 20v-5.1a2.4 2.4 0 0 1 4.8 0V20"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

// Header lockup. Links home by default.
export function Logo({ href = "/", label = "Meino", className = "" }: Props) {
  return (
    <Link href={href} className={`flex items-center gap-2 ${className}`}>
      <LogoMark />
      {label && (
        <span className="text-lg font-semibold tracking-tight text-ink">{label}</span>
      )}
    </Link>
  );
}
