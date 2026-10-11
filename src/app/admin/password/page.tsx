import Link from "next/link";
import { requireAdmin } from "@/lib/auth/profile";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";

export default async function AdminPasswordPage() {
  await requireAdmin();
  return (
    <AuthLayout
      title="Change staff password"
      subtitle="Choose a new password for your staff account."
    >
      <UpdatePasswordForm />
      <Link
        href="/admin"
        className="mt-4 inline-flex min-h-11 items-center text-sm text-primary underline"
      >
        ← Back to admin
      </Link>
    </AuthLayout>
  );
}
