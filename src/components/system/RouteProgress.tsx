"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// A thin top bar (GitHub/YouTube style) that starts the instant a link is clicked
// and completes when the new route commits — so navigation never feels frozen.
export function RouteProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const started = useRef(false);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const start = useCallback(() => {
    clearTimers();
    started.current = true;
    setVisible(true);
    setProgress(8);
    // Trickle upward while we wait for the route to commit.
    timers.current.push(window.setTimeout(() => setProgress(35), 120));
    timers.current.push(window.setTimeout(() => setProgress(60), 350));
    timers.current.push(window.setTimeout(() => setProgress(80), 800));
  }, []);

  // Start on internal link clicks (ignore buttons, hashes, new-tab, external).
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const el = (event.target as HTMLElement)?.closest?.("a[href], button");
      if (!el || el.tagName !== "A") return;

      const anchor = el as HTMLAnchorElement;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      start();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [start]);

  // Complete once the route has changed.
  useEffect(() => {
    if (!started.current) return;
    started.current = false;
    clearTimers();
    setProgress(100);
    timers.current.push(window.setTimeout(() => setVisible(false), 220));
    timers.current.push(window.setTimeout(() => setProgress(0), 450));
    return clearTimers;
  }, [pathname]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[3000] h-0.5 origin-left bg-primary"
      style={{
        transform: `scaleX(${progress / 100})`,
        opacity: visible ? 1 : 0,
        transition: "transform 200ms ease-out, opacity 300ms ease-out",
      }}
    />
  );
}
