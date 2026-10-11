import { AuthLayout } from "@/components/auth/AuthLayout";
import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";
import { requireAdmin } from "@/lib/auth/profile";
import { adminHref } from "@/config/admin";
import Link from "next/link";

export default async function StaffPasswordPage() {
  await requireAdmin();

  return (
    <AuthLayout
      title="Reset staff password"
      subtitle="Choose a new password for your staff account."
    >
      <UpdatePasswordForm />
      <Link
        href={adminHref()}
        className="mt-4 inline-flex min-h-11 items-center text-sm text-primary underline"
      >
        Return to staff sign-in
      </Link>
    </AuthLayout>
  );
}
