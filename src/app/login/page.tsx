import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthForm } from "@/components/auth/AuthForm";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { signInAction } from "@/lib/auth/actions";

interface Props {
  searchParams: Promise<{ next?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const { next, error } = await searchParams;

  return (
    <AuthLayout title="Sign in" subtitle="Welcome back to BH Hunter.">
      {error === "oauth" && (
        <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          Google sign-in didn&apos;t complete. Please try again.
        </p>
      )}
      <GoogleButton next={next ?? "/"} />
      <AuthDivider />
      <AuthForm mode="signin" action={signInAction} next={next} />
    </AuthLayout>
  );
}
