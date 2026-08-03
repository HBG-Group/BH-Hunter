import Link from "next/link";
import { requireProfile } from "@/lib/auth/profile";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";

export default async function AccountPasswordPage() {
  await requireProfile("/account/password");
  return (
    <AuthLayout
      title="Change password"
      subtitle="Choose a new password for your Meino account."
    >
      <UpdatePasswordForm />
      <Link
        href="/settings"
        className="mt-4 inline-flex min-h-11 items-center text-sm text-primary underline"
      >
        ← Back to settings
      </Link>
    </AuthLayout>
  );
}
