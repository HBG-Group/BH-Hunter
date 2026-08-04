import { redirect } from "next/navigation";
import { SignUpLayout } from "@/components/auth/SignUpLayout";
import { SignUpAuth } from "@/components/auth/SignUpAuth";
import { getCurrentProfile } from "@/lib/auth/profile";

export default async function OwnerSignUpPage() {
  // A logged-in owner clicking "List your property" should land on their listings,
  // not the sign-up form. Students/guests continue to the sign-up flow.
  const profile = await getCurrentProfile();
  if (profile?.role === "OWNER") redirect("/owner");

  return (
    <SignUpLayout
      variant="owner"
      eyebrow="For property owners"
      headline="Grow your boarding house business with Meino."
      points={[
        "List your properties and reach more students",
        "Manage rooms and keep vacancies accurate",
        "Track views, favorites, and contacts with analytics",
        "Handle viewing requests from one dashboard",
      ]}
      formTitle="Create your owner account"
      formSubtitle="Put your boarding house in front of students looking for a home near VSU."
    >
      <SignUpAuth role="OWNER" next="/owner" />
    </SignUpLayout>
  );
}
