import { AuthForm } from "@/components/auth/AuthForm";
import { signInAction } from "@/lib/auth/actions";
import { LogoMark } from "@/components/brand/Logo";

// Shown in place of the dashboard when the visitor isn't a signed-in admin. Sign-in
// returns to /admin, where the same gate then renders the dashboard for real admins.
export function AdminLogin({ denied }: { denied?: boolean }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2">
          <LogoMark />
          <span className="text-lg font-semibold tracking-tight text-ink">Meino admin</span>
        </div>

        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-ink">Staff sign in</h1>
          <p className="mb-4 mt-0.5 text-sm text-muted">Administrator access only.</p>

          {denied && (
            <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              That account isn&apos;t an administrator.
            </p>
          )}

          {/* On success, sign-in returns to /admin; the gate re-checks the role there. */}
          <AuthForm mode="signin" action={signInAction} next="/admin" showFooter={false} />
        </div>
      </div>
    </div>
  );
}
