import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthForm } from "@/components/auth/AuthForm";
import { signInAction } from "@/lib/auth/actions";

// Hidden admin entrance. This route is intentionally not linked anywhere in the UI —
// only people who know the URL can reach it. The real protection is the ADMIN role
// check in requireAdmin(); this page just avoids advertising an "admin login".
// To change the secret path, rename this folder (e.g. app/bh-control -> app/your-slug).

// Keep it out of search engines.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return (
    <AuthLayout title="Staff sign in" subtitle="Administrator access only.">
      {/* On success, admins are routed to /admin by signInAction. */}
      <AuthForm mode="signin" action={signInAction} next="/admin" showFooter={false} />
    </AuthLayout>
  );
}
