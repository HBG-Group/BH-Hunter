"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaSupport() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos] = useState(() => typeof window !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window));
  const [isStandalone] = useState(() => typeof window !== "undefined" && (window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator && Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone))));

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" });
    }

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  if (isStandalone || (!installEvent && !isIos)) return null;

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  }

  return (
    <aside className="fixed inset-x-3 bottom-3 z-50 rounded-2xl border border-black/10 bg-ink px-4 py-3 text-sm text-white shadow-xl sm:inset-x-auto sm:right-4 sm:max-w-sm">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold">Keep Meino close by</p>
          <p className="mt-1 text-white/75">
            {isIos ? "Tap Share, then Add to Home Screen to install the app." : "Install Meino on your home screen for quick access."}
          </p>
        </div>
        {installEvent && <button type="button" onClick={install} className="rounded-lg bg-white px-3 py-2 font-semibold text-ink">Install</button>}
      </div>
    </aside>
  );
}
