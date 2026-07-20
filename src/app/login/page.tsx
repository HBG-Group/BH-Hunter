import Link from "next/link";
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
    <AuthLayout title="Sign in" subtitle="Students and owners both sign in here.">
      {error === "oauth" && (
        <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          Sign-in didn&apos;t complete. Please try again.
        </p>
      )}
      <GoogleButton next={next ?? "/"} />
      <AuthDivider />
      <AuthForm mode="signin" action={signInAction} next={next} />

      <p className="mt-4 text-center text-xs text-neutral-500">
        Renting a room?{" "}
        <Link href="/signup" className="underline hover:text-neutral-800">
          Student sign-up
        </Link>{" "}
        · Renting one out?{" "}
        <Link href="/list-your-property" className="underline hover:text-neutral-800">
          Owner sign-up
        </Link>
      </p>
    </AuthLayout>
  );
}
