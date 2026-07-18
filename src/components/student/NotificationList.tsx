import { formatRelativeTime } from "@/lib/utils/format";

export interface NotificationItem {
  id: string;
  title: string;
  body: string | null;
  createdAt: string;
  isRead: boolean;
}

export function NotificationList({ notifications }: { notifications: NotificationItem[] }) {
  if (notifications.length === 0) {
    return <p className="text-sm text-neutral-500">No notifications yet.</p>;
  }

  return (
    <div className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white">
      {notifications.map((notification) => (
        <div key={notification.id} className="flex gap-3 px-4 py-3">
          {!notification.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-neutral-900" />}
          <div className={notification.isRead ? "pl-5" : ""}>
            <p className="text-sm font-medium text-neutral-900">{notification.title}</p>
            {notification.body && <p className="text-xs text-neutral-500">{notification.body}</p>}
            <p className="mt-0.5 text-xs text-neutral-400">{formatRelativeTime(notification.createdAt)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
