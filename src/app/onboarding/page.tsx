import { requireProfile } from "@/lib/auth/profile";
import { safeRedirectPath } from "@/lib/security/redirect";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { OnboardingForm } from "@/components/auth/OnboardingForm";

interface PageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function OnboardingPage({ searchParams }: PageProps) {
  const profile = await requireProfile();
  const { next } = await searchParams;
  const safeNext = safeRedirectPath(next ?? null, "/");

  return (
    <AuthLayout
      title="Welcome to Meino"
      subtitle="One quick thing before you start — what name would you like students and owners to see?"
    >
      <OnboardingForm defaultName={profile.fullName} next={safeNext} />
    </AuthLayout>
  );
}
