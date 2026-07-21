import { Logo } from "@/components/brand/Logo";

interface Props {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

// The centered card wrapper shared by the sign-in and sign-up pages.
export function AuthLayout({ title, subtitle, children }: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <Logo className="mb-6 justify-center" />

        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-ink">{title}</h1>
          <p className="mb-4 mt-0.5 text-sm text-muted">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
