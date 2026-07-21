import Link from "next/link";
import { FadeIn } from "@/components/ui/FadeIn";

const points = [
  { title: "Rooms that are really free", body: "Owners keep availability current, so a green pin means a room is genuinely open — not gone last week." },
  { title: "Know the walk", body: "Every listing shows the real minutes to VSU's main gate, so you know what mornings will feel like." },
  { title: "Made for Baybay", body: "Only boarding houses around VSU. Nothing to sift through that was never near campus." },
];

// Homepage "about" band. The standalone /about page has the fuller story.
export function AboutSection() {
  return (
    <section id="about" className="scroll-mt-20 border-t border-line py-14">
      <FadeIn className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-ink">A place to land</h2>
        <p className="mt-3 text-lg text-muted">
          Looking for a room shouldn&apos;t mean scrolling Facebook groups and walking Baybay in the
          heat. Meino gathers every option in one place, so you can spend less time hunting and more
          time settling in.
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
        <Link href="/about" className="text-sm text-muted underline hover:text-ink">
          More about Meino
        </Link>
      </div>
    </section>
  );
}
