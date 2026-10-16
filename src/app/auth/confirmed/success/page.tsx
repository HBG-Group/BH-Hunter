import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";

export default function ConfirmationSuccessPage() {
  return (
    <AuthLayout
      title="Account confirmed"
      subtitle="Your email address has been verified successfully."
    >
      <div className="space-y-4">
        <p className="text-sm text-neutral-600">
          Your Meino account is ready. Return to the login page to continue.
        </p>
        <Link
          href="/login"
          className="flex w-full items-center justify-center rounded-xl bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
        >
          Go to login
        </Link>
      </div>
    </AuthLayout>
  );
}
