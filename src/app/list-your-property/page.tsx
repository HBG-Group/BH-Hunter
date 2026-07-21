import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthForm } from "@/components/auth/AuthForm";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { signUpAction } from "@/lib/auth/actions";

export default function OwnerSignUpPage() {
  return (
    <AuthLayout
      title="Owner account"
      subtitle="For boarding house owners — list your place, keep vacancies honest, and meet students looking for a home."
    >
      <GoogleButton next="/owner" role="OWNER" />
      <AuthDivider />
      <AuthForm mode="signup" action={signUpAction} role="OWNER" />

      <p className="mt-4 text-center text-xs text-neutral-500">
        Looking for a place to stay?{" "}
        <Link href="/signup" className="underline hover:text-neutral-800">
          Create a student account instead
        </Link>
      </p>
    </AuthLayout>
  );
}
