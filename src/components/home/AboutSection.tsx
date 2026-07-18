import Link from "next/link";
import { FadeIn } from "@/components/ui/FadeIn";

const points = [
  { title: "Real vacancies", body: "Owners keep availability current, so a green pin means a room is actually open." },
  { title: "Walk-time, not guesswork", body: "Every listing shows the minutes to VSU's main gate, not just a distance." },
  { title: "Built for VSU", body: "Focused on Baybay boarding houses near campus — nothing irrelevant to sift through." },
];

// Homepage "about" band. The standalone /about page has the fuller story.
export function AboutSection() {
  return (
    <section id="about" className="scroll-mt-20 border-t border-neutral-200 py-14">
      <FadeIn className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-ink">Why BH Hunter</h2>
        <p className="mt-3 text-lg text-muted">
          Finding a boarding house near VSU shouldn&apos;t mean scrolling Facebook groups and walking
          around Baybay. BH Hunter puts every option on one map — free to browse, no sign-in needed.
        </p>
      </FadeIn>

      <div className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-3">
        {points.map((point, index) => (
          <FadeIn key={point.title} delay={index * 0.08}>
            <div className="h-full rounded-2xl border border-line bg-white p-6">
              <h3 className="font-medium text-ink">{point.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{point.body}</p>
            </div>
          </FadeIn>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link href="/about" className="text-sm text-neutral-600 underline hover:text-neutral-900">
          More about the project
        </Link>
      </div>
    </section>
  );
}
