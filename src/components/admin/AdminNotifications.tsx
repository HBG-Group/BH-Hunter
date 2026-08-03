"use client";

import { useState, useTransition } from "react";
import { markAdminNotificationReadAction } from "@/lib/admin/actions";

export interface AdminNotificationView {
  id: string;
  title: string;
  body: string | null;
  createdAt: string;
  readAt: string | null;
}

export function AdminNotifications({ notifications }: { notifications: AdminNotificationView[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const unread = notifications.filter((notification) => !notification.readAt).length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={`Notifications${unread ? ` (${unread} unread)` : ""}`}
        aria-expanded={open}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg text-neutral-700 hover:bg-neutral-100"
      >
        <svg aria-hidden width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {unread > 0 && <span className="absolute right-1 top-1 min-w-4 rounded-full bg-rose-600 px-1 text-[10px] font-semibold text-white">{unread > 9 ? "9+" : unread}</span>}
      </button>

      {open && (
        <section className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg" aria-label="Notifications panel">
          <div className="border-b border-neutral-100 px-4 py-3 text-sm font-semibold text-neutral-900">Notifications</div>
          {notifications.length === 0 ? (
            <p className="px-4 py-6 text-sm text-neutral-500">No new operational notifications.</p>
          ) : (
            <ul className="max-h-96 divide-y divide-neutral-100 overflow-y-auto">
              {notifications.map((notification) => (
                <li key={notification.id} className={notification.readAt ? "px-4 py-3" : "bg-sky-50 px-4 py-3"}>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => startTransition(() => markAdminNotificationReadAction(notification.id))}
                    className="w-full text-left"
                  >
                    <p className="text-sm font-medium text-neutral-900">{notification.title}</p>
                    {notification.body && <p className="mt-0.5 text-xs leading-relaxed text-neutral-600">{notification.body}</p>}
                    <p className="mt-1 text-xs text-neutral-400">{new Date(notification.createdAt).toLocaleString()}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
