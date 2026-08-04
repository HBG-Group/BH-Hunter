import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { PasswordResetForm } from "@/components/auth/PasswordResetForm";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We’ll email a secure, time-limited reset link."
    >
      <PasswordResetForm />
      <Link
        href="/login"
        className="mt-4 inline-flex min-h-11 items-center text-sm text-primary underline"
      >
        ← Back to sign in
      </Link>
    </AuthLayout>
  );
}
