import Link from "next/link";
import { SignUpLayout } from "@/components/auth/SignUpLayout";
import { SignUpAuth } from "@/components/auth/SignUpAuth";

export default function SignUpPage() {
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
      footer={
        <>
          Own a boarding house?{" "}
          <Link href="/list-your-property" className="underline hover:text-neutral-800">
            Create an owner account instead
          </Link>
        </>
      }
    >
      <SignUpAuth role="STUDENT" next="/account" />
    </SignUpLayout>
  );
}
