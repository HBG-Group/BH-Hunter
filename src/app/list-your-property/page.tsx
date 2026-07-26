import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignUpAuth } from "@/components/auth/SignUpAuth";

export default function OwnerSignUpPage() {
  return (
    <AuthLayout
      title="Owner account"
      subtitle="For boarding house owners — list your place, keep vacancies honest, and meet students looking for a home."
    >
      <SignUpAuth role="OWNER" next="/owner" />

      <p className="mt-4 text-center text-xs text-neutral-500">
        Looking for a place to stay?{" "}
        <Link href="/signup" className="underline hover:text-neutral-800">
          Create a student account instead
        </Link>
      </p>
    </AuthLayout>
  );
}
