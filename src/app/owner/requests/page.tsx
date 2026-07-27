import Link from "next/link";
import { requireOwner } from "@/lib/auth/profile";
import {
  findViewingRequestsForOwner,
  type OwnerRequestFilter,
} from "@/lib/db/viewing-requests";
import { EmptyState } from "@/components/ui/EmptyState";
import { OwnerRequestRow } from "@/components/owner/OwnerRequestRow";
import { formatDateTime } from "@/lib/utils/format";

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

const filters: { value: OwnerRequestFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
];

export default async function OwnerRequestsPage({ searchParams }: PageProps) {
  const owner = await requireOwner();
  const { status } = await searchParams;
  const active: OwnerRequestFilter =
    status === "pending" || status === "confirmed" ? status : "all";

  const requests = await findViewingRequestsForOwner(owner.id, active);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Viewing requests</h1>
        <Link href="/owner" className="text-sm text-neutral-500 hover:text-neutral-900">
          ← Back to dashboard
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {filters.map((filter) => (
          <Link
            key={filter.value}
            href={filter.value === "all" ? "/owner/requests" : `/owner/requests?status=${filter.value}`}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              active === filter.value
                ? "bg-neutral-900 text-white"
                : "bg-white text-neutral-600 ring-1 ring-inset ring-neutral-200 hover:ring-neutral-300"
            }`}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      {requests.length === 0 ? (
        <EmptyState
          title={active === "all" ? "No viewing requests yet" : `No ${active} requests`}
          message="When a student asks to visit one of your places, it will show up here."
        />
      ) : (
        <div className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white">
          {requests.map((request) => (
            <OwnerRequestRow
              key={request.id}
              request={{
                id: request.id,
                listingName: request.boardingHouse.name,
                studentName: request.student.fullName,
                studentEmail: request.student.email,
                studentPhone: request.student.phone,
                preferredAtLabel: formatDateTime(request.preferredAt),
                status: request.status,
                message: request.message,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
