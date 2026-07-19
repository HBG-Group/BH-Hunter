"use client";

import { useEffect, useState } from "react";

interface Tab {
  id: string;
  label: string;
}

// Sticky in-page tabs with scroll-spy — jump to a section and see where you are.
export function SectionTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => entry.isIntersecting && setActive(entry.target.id));
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    tabs.forEach((tab) => {
      const el = document.getElementById(tab.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [tabs]);

  return (
    <div className="sticky top-[57px] z-[1000] -mx-4 mb-6 border-b border-line bg-white/90 px-4 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl gap-5 overflow-x-auto">
        {tabs.map((tab) => (
          <a
            key={tab.id}
            href={`#${tab.id}`}
            className={`shrink-0 border-b-2 py-3 text-sm transition-colors ${
              active === tab.id
                ? "border-primary font-medium text-primary"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {tab.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
