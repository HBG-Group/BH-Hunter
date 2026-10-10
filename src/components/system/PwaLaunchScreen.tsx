"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function PwaLaunchScreen() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!standalone || sessionStorage.getItem("meino-pwa-launch-seen")) return;
    sessionStorage.setItem("meino-pwa-launch-seen", "1");
    const showAfter = window.setTimeout(() => setVisible(true), 0);
    const exitAfter = window.setTimeout(() => setLeaving(true), reducedMotion ? 0 : 850);
    const removeAfter = window.setTimeout(() => setVisible(false), reducedMotion ? 80 : 1_150);
    return () => {
      window.clearTimeout(exitAfter);
      window.clearTimeout(removeAfter);
      window.clearTimeout(showAfter);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-label="Loading Meino"
      role="status"
      className={`fixed inset-0 z-[2000] flex items-center justify-center bg-[#b74726] transition-opacity duration-300 ${leaving ? "opacity-0" : "opacity-100"}`}
    >
      <div className={`flex flex-col items-center gap-5 ${leaving ? "scale-95 opacity-0" : "scale-100 opacity-100"} transition-all duration-500`}>
        <Image src="/icon-192.svg" alt="" width={96} height={96} priority className="rounded-[1.35rem] shadow-2xl" />
        <span className="text-sm font-medium tracking-[0.22em] text-white/90">MEINO</span>
      </div>
    </div>
  );
}
