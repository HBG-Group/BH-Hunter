import { SiteHeader } from "@/components/layout/SiteHeader";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">About Meino</h1>
        <p className="mt-4 text-muted">
          Meino helps students at Visayas State University in Baybay, Leyte find a boarding house
          that feels like home. Browse every option on one map, compare prices, check real
          vacancies, and see the walk to campus — no account needed to look around.
        </p>
        <p className="mt-4 text-muted">
          Sign in when you are ready to save the places you like, share what living there was
          really like, and get a nudge the moment a room opens up.
        </p>
      </main>
    </div>
  );
}
