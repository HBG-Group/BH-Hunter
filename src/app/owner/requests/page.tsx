import Link from "next/link";
import { requireOwner } from "@/lib/auth/profile";
import { findViewingRequestsForOwner } from "@/lib/db/viewing-requests";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateTime } from "@/lib/utils/format";

export default async function OwnerRequestsPage() {
  const owner = await requireOwner();
  const requests = await findViewingRequestsForOwner(owner.id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Viewing requests</h1>
        <Link href="/owner" className="text-sm text-neutral-500 hover:text-neutral-900">
          ← Back to dashboard
        </Link>
      </div>

      {requests.length === 0 ? (
        <EmptyState title="No viewing requests yet" message="When a student asks to visit one of your places, it will show up here." />
      ) : (
        <div className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white">
          {requests.map((request) => (
            <div key={request.id} className="px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-neutral-900">{request.boardingHouse.name}</p>
                <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                  {request.status.toLowerCase()}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-neutral-500">
                {request.student.fullName}
                {request.student.phone ? ` · ${request.student.phone}` : ""} · {formatDateTime(request.preferredAt)}
              </p>
              {request.message && <p className="mt-1 text-sm text-neutral-600">{request.message}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
