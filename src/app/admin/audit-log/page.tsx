import { getAdminOrNull } from "@/lib/auth/profile";
import { listModerationEvents } from "@/lib/db/admin";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateTime } from "@/lib/utils/format";
import { resilientRead } from "@/lib/async/resilient-read";

const ACTION_LABELS: Record<string, string> = {
  LISTING_VERIFICATION: "Listing verification changed",
  LISTING_STATUS: "Listing status changed",
  LISTING_FEATURED: "Listing featured changed",
  LISTING_DELETION: "Listing deleted",
  OWNER_VERIFICATION: "Owner verification changed",
  OWNER_FREEZE: "Owner freeze changed",
  OWNER_DELETION: "Owner deleted",
  REVIEW_DELETION: "Review deleted",
  ADVERTISEMENT_CREATION: "Ad created",
  ADVERTISEMENT_STATUS: "Ad status changed",
  ADVERTISEMENT_DELETION: "Ad deleted",
};

// Read-only — every admin action already writes here via recordModerationEvent().
// This page is a viewer only; there is intentionally no way to edit or delete a row.
export default async function AdminAuditLogPage() {
  if (!(await getAdminOrNull())) return null;
  const events = await resilientRead(listModerationEvents);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Audit log</h1>
        <p className="text-sm text-neutral-500">
          Every privileged moderation action, most recent first. Read-only.
        </p>
      </div>

      {events.length === 0 ? (
        <EmptyState title="No moderation activity yet" message="Admin actions will be recorded here." />
      ) : (
        <div className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white">
          {events.map((event) => (
            <div key={event.id} className="flex flex-wrap items-start justify-between gap-2 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-neutral-900">
                  {ACTION_LABELS[event.action] ?? event.action}
                </p>
                <p className="text-xs text-neutral-500">
                  {event.actor.fullName} · {event.targetType} {event.targetId}
                  {event.detail ? ` · ${event.detail}` : ""}
                </p>
              </div>
              <span className="shrink-0 text-xs text-neutral-400">{formatDateTime(event.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
