import { Logo } from "@/components/brand/Logo";

interface Props {
  variant: "student" | "owner";
  eyebrow: string;
  headline: string;
  points: string[];
  formTitle: string;
  formSubtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

// Two very different-feeling sign-up experiences that still share Meino branding. The
// left panel is themed marketing copy (warm & student-y vs. professional & business-y);
// the right panel holds the actual form. On mobile only the form shows, with a themed
// header strip. Sign IN keeps using the plain AuthLayout — this is sign-up only.
const themes = {
  student: {
    panel: "bg-gradient-to-br from-emerald-500 to-teal-600",
    check: "text-emerald-200",
  },
  owner: {
    panel: "bg-gradient-to-br from-slate-800 to-slate-950",
    check: "text-sky-300",
  },
};

export function SignUpLayout({
  variant,
  eyebrow,
  headline,
  points,
  formTitle,
  formSubtitle,
  children,
  footer,
}: Props) {
  const theme = themes[variant];

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Marketing panel — desktop only */}
      <aside className={`hidden w-1/2 flex-col justify-between p-10 text-white lg:flex ${theme.panel}`}>
        <Logo className="[&_*]:text-white" />
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-white/70">{eyebrow}</p>
          <h2 className="mt-2 text-3xl font-semibold leading-tight">{headline}</h2>
          <ul className="mt-6 space-y-3">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-sm text-white/90">
                <svg className={`mt-0.5 h-5 w-5 shrink-0 ${theme.check}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-7 7a1 1 0 0 1-1.4 0l-3-3a1 1 0 1 1 1.4-1.4l2.3 2.29 6.3-6.29a1 1 0 0 1 1.4 0z" clipRule="evenodd" />
                </svg>
                {point}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-white/60">Meino — boarding houses near VSU</p>
      </aside>

      {/* Form panel */}
      <main className="flex w-full items-center justify-center px-4 py-10 lg:w-1/2">
        <div className="w-full max-w-sm">
          {/* Mobile-only themed strip so each page still feels distinct on phones */}
          <div className={`mb-6 rounded-2xl p-5 text-white lg:hidden ${theme.panel}`}>
            <p className="text-xs font-medium uppercase tracking-wide text-white/70">{eyebrow}</p>
            <p className="mt-1 text-lg font-semibold leading-snug">{headline}</p>
          </div>
          <Logo className="mb-6 hidden justify-center lg:hidden" />

          <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
            <h1 className="text-lg font-semibold text-ink">{formTitle}</h1>
            <p className="mb-4 mt-0.5 text-sm text-muted">{formSubtitle}</p>
            {children}
          </div>
          <div className="mt-4 text-center text-xs text-neutral-500">{footer}</div>
        </div>
      </main>
    </div>
  );
}
