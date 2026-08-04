import Link from "next/link";
import { requireAdmin } from "@/lib/auth/profile";
import { findAdminNotificationHistory } from "@/lib/db/admin-notifications";
import { markAllAdminNotificationsReadAction } from "@/lib/admin/actions";

function notificationHref(type: string) {
  if (type.includes("PAYMENT")) return "/admin/owners";
  if (type.includes("REVIEW")) return "/admin/reviews";
  if (type.includes("LISTING")) return "/admin/listings";
  if (type.includes("OWNER")) return "/admin/owners";
  return "/admin/audit-log";
}

export default async function AdminNotificationsPage() {
  const admin = await requireAdmin();
  const notifications = await findAdminNotificationHistory(admin.id);
  const unread = notifications.filter(
    (notification) => !notification.readAt,
  ).length;
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">
            Notifications
          </h1>
          <p className="text-sm text-neutral-500">
            {unread} unread operational event{unread === 1 ? "" : "s"}
          </p>
        </div>
        {unread > 0 && (
          <form action={markAllAdminNotificationsReadAction}>
            <button className="min-h-11 rounded-xl px-4 text-sm ring-1 ring-inset ring-neutral-200">
              Mark all read
            </button>
          </form>
        )}
      </div>
      {notifications.length === 0 ? (
        <p className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-500">
          No operational notifications yet.
        </p>
      ) : (
        <ul className="divide-y divide-neutral-100 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={notification.readAt ? "p-4" : "bg-sky-50 p-4"}
            >
              <Link
                href={notificationHref(notification.type)}
                className="block min-h-11"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-neutral-900">
                    {notification.title}
                  </p>
                  <span className="rounded-full bg-neutral-100 px-2 py-1 text-[11px] text-neutral-600">
                    {notification.type.replaceAll("_", " ").toLowerCase()}
                  </span>
                </div>
                {notification.body && (
                  <p className="mt-1 text-sm text-neutral-600">
                    {notification.body}
                  </p>
                )}
                <p className="mt-2 text-xs text-neutral-400">
                  {notification.createdAt.toLocaleString()}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
