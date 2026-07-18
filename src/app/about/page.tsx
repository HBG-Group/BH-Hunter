import { SiteHeader } from "@/components/layout/SiteHeader";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">About BH Hunter</h1>
        <p className="mt-4 text-neutral-600">
          BH Hunter is a boarding house discovery platform for students of Visayas State University
          in Baybay, Leyte. Browse available boarding houses on an interactive map, compare prices,
          check real vacancies, and see the walk to campus — no account needed.
        </p>
        <p className="mt-4 text-neutral-600">
          Sign in with your VSU email or Google to save favorites, leave reviews, and get notified
          when a room opens up.
        </p>
      </main>
    </div>
  );
}
