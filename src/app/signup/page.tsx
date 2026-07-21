import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthForm } from "@/components/auth/AuthForm";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { signUpAction } from "@/lib/auth/actions";

export default function SignUpPage() {
  return (
    <AuthLayout
      title="Student account"
      subtitle="For students looking for a room — save the places you like, share honest reviews, and ask for a viewing."
    >
      <GoogleButton next="/account" role="STUDENT" />
      <AuthDivider />
      <AuthForm mode="signup" action={signUpAction} role="STUDENT" />

      <p className="mt-4 text-center text-xs text-neutral-500">
        Own a boarding house?{" "}
        <Link href="/list-your-property" className="underline hover:text-neutral-800">
          Create an owner account instead
        </Link>
      </p>
    </AuthLayout>
  );
}
