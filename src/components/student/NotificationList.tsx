import { formatRelativeTime } from "@/lib/utils/format";
import { EmptyState } from "@/components/ui/EmptyState";

export interface NotificationItem {
  id: string;
  title: string;
  body: string | null;
  createdAt: string;
  isRead: boolean;
}

export function NotificationList({ notifications }: { notifications: NotificationItem[] }) {
  if (notifications.length === 0) {
    return (
      <EmptyState
        title="No notifications yet"
        message="Favorite a boarding house to get alerts when a room opens up there."
        actionLabel="Browse listings"
        actionHref="/"
      />
    );
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
