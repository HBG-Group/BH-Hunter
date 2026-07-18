import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthForm } from "@/components/auth/AuthForm";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { signUpAction } from "@/lib/auth/actions";
import { STUDENT_EMAIL_HINT } from "@/config/auth";

export default function SignUpPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Save favorites, leave reviews, and request viewings."
    >
      <GoogleButton next="/account" />
      <AuthDivider />
      <AuthForm mode="signup" action={signUpAction} role="STUDENT" />
      <p className="mt-3 text-center text-xs text-neutral-400">{STUDENT_EMAIL_HINT}</p>
    </AuthLayout>
  );
}
