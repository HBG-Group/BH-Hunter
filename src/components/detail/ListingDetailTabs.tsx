"use client";

import { useEffect, useRef, useState, type ReactNode, type TouchEvent } from "react";

interface DetailTab {
  id: string;
  label: string;
  content: ReactNode;
}

export function ListingDetailTabs({ tabs }: { tabs: DetailTab[] }) {
  const [activeId, setActiveId] = useState(tabs[0]?.id ?? "");
  const touchStartX = useRef<number | null>(null);
  const shouldScrollRef = useRef(false);
  const activeIndex = Math.max(0, tabs.findIndex((tab) => tab.id === activeId));

  useEffect(() => {
    const syncHash = () => {
      let id: string;
      try {
        id = decodeURIComponent(window.location.hash.slice(1));
      } catch {
        return;
      }
      if (tabs.some((tab) => tab.id === id)) {
        // The hash is external browser state and must be reflected when it changes.
        shouldScrollRef.current = true;
        setActiveId(id);
      }
    };
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [tabs]);

  useEffect(() => {
    if (!shouldScrollRef.current) return;
    shouldScrollRef.current = false;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(activeId)?.scrollIntoView({ block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeId]);

  function select(id: string) {
    shouldScrollRef.current = true;
    setActiveId(id);
    if (window.location.hash !== `#${id}`) {
      window.history.replaceState(null, "", `#${id}`);
    }
  }

  function onTouchStart(event: TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  }

  function onTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const distance = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(distance) < 48) return;
    const nextIndex = distance < 0 ? activeIndex + 1 : activeIndex - 1;
    const nextTab = tabs[nextIndex];
    if (nextTab) select(nextTab.id);
  }

  const activeTab = tabs[activeIndex];
  if (!activeTab) return null;

  return (
    <div className="min-w-0 space-y-6">
      <div className="sticky top-[57px] z-[1000] -mx-4 max-w-[calc(100%+2rem)] border-b border-line bg-white/90 px-4 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl gap-5 overflow-x-auto" aria-label="Listing details">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeId === tab.id}
              onClick={() => select(tab.id)}
              className={`shrink-0 border-b-2 py-3 text-sm transition-colors ${
                activeId === tab.id
                  ? "border-primary font-medium text-primary"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div
        role="tabpanel"
        aria-label={activeTab.label}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="min-w-0 max-w-full touch-pan-y"
      >
        {activeTab.content}
      </div>
    </div>
  );
}
