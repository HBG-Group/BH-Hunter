"use client";

import { useState, useTransition } from "react";
import { updateRoomAlertsAction } from "@/lib/student/notification-actions";

interface Props {
  roomAlerts: boolean;
}

// Toggle for "notify me when a room opens up" at a favorited boarding house.
export function NotificationSettings({ roomAlerts }: Props) {
  const [enabled, setEnabled] = useState(roomAlerts);
  const [pending, startTransition] = useTransition();

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    startTransition(() => updateRoomAlertsAction(next));
  };

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-neutral-900">Room availability alerts</p>
        <p className="text-xs text-neutral-500">
          Get notified when a favorited boarding house has a room open up.
        </p>
      </div>
      {/* shrink-0 keeps the knob inside the track on narrow screens. The knob is
          absolutely placed so its travel can't be affected by flex sizing. */}
      <button
        onClick={toggle}
        disabled={pending}
        role="switch"
        aria-checked={enabled}
        aria-label="Room availability alerts"
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60 ${
          enabled ? "bg-neutral-900" : "bg-neutral-300"
        }`}
      >
        <span
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-[left] duration-200"
          style={{ left: enabled ? "1.375rem" : "0.125rem" }}
        />
      </button>
    </div>
  );
}
