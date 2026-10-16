import { SignUpLayout } from "@/components/auth/SignUpLayout";
import { SignUpAuth } from "@/components/auth/SignUpAuth";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <SignUpLayout
      variant="student"
      eyebrow="For students"
      headline="Find a boarding house that feels like home near VSU."
      points={[
        "Every boarding house around campus on one map",
        "Real vacancies and honest walk times",
        "Save your favorites and compare them side by side",
        "Ask to visit — no more scrolling Facebook groups",
      ]}
      formTitle="Create your student account"
      formSubtitle="Join Meino and find your place near campus. It's free to browse and save."
    >
      {error === "terms" && <p role="alert" className="text-sm text-rose-600">Please accept the current Terms &amp; Conditions before creating an account.</p>}
      <SignUpAuth role="STUDENT" next="/account" />
    </SignUpLayout>
  );
}
