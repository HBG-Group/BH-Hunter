import { AuthLayout } from "@/components/auth/AuthLayout";
import { PasswordResetForm } from "@/components/auth/PasswordResetForm";

export default function ForgotPasswordPage() {
  return <AuthLayout title="Reset your password" subtitle="Enter your email and we’ll send a secure reset link."><PasswordResetForm /></AuthLayout>;
}
