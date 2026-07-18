import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthForm } from "@/components/auth/AuthForm";
import { signUpAction } from "@/lib/auth/actions";

export default function OwnerSignUpPage() {
  return (
    <AuthLayout
      title="List your boarding house"
      subtitle="Create an owner account to manage listings and vacancies."
    >
      <AuthForm mode="signup" action={signUpAction} role="OWNER" />
    </AuthLayout>
  );
}
