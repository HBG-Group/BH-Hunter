import Link from "next/link";

interface Props {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

// The centered card wrapper shared by the sign-in and sign-up pages.
export function AuthLayout({ title, subtitle, children }: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-sm font-bold text-white">
            BH
          </span>
          <span className="text-lg font-semibold tracking-tight">BH Hunter</span>
        </Link>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-neutral-900">{title}</h1>
          <p className="mb-4 mt-0.5 text-sm text-neutral-500">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
