import { AuthLayout } from "@/components/auth/AuthLayout";
import { AcceptTermsAuth } from "@/components/auth/AcceptTermsAuth";
import { safeRedirectPath } from "@/lib/security/redirect";

export default async function AcceptCurrentTermsPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next: rawNext } = await searchParams;
  const next = safeRedirectPath(rawNext, "/");

  return (
    <AuthLayout
      title="Terms have been updated"
      subtitle="Your account is still here. Please review and accept the current Terms & Conditions to continue."
    >
      <AcceptTermsAuth next={next} />
    </AuthLayout>
  );
}
