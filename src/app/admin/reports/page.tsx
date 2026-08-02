import { getAdminOrNull } from "@/lib/auth/profile";
import { listReports } from "@/lib/db/report";
import { AdminReportRow } from "@/components/admin/AdminReportRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateTime } from "@/lib/utils/format";
import { resilientRead } from "@/lib/async/resilient-read";
import type { ReportStatus } from "@prisma/client";

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

const filters: { value: ReportStatus | "all"; label: string }[] = [
  { value: "OPEN", label: "Open" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "DISMISSED", label: "Dismissed" },
  { value: "all", label: "All" },
];

export default async function AdminReportsPage({ searchParams }: PageProps) {
  if (!(await getAdminOrNull())) return null;
  const { status } = await searchParams;
  const active = filters.some((f) => f.value === status) ? (status as ReportStatus | "all") : "OPEN";

  const rows = await resilientRead(() => listReports(active === "all" ? undefined : active));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Reports</h1>
      </div>

      <div className="flex gap-2">
        {filters.map((filter) => (
          <a
            key={filter.value}
            href={filter.value === "OPEN" ? "/admin/reports" : `/admin/reports?status=${filter.value}`}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              active === filter.value
                ? "bg-neutral-900 text-white"
                : "bg-white text-neutral-600 ring-1 ring-inset ring-neutral-200 hover:ring-neutral-300"
            }`}
          >
            {filter.label}
          </a>
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title={active === "OPEN" ? "No open reports" : "Nothing here"}
          message="Reports filed by students and owners against listings, reviews, or accounts will show up here."
        />
      ) : (
        <div className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white">
          {rows.map((row) => (
            <AdminReportRow
              key={row.id}
              report={{
                id: row.id,
                targetType: row.targetType,
                targetId: row.targetId,
                reason: row.reason,
                message: row.message,
                status: row.status,
                resolution: row.resolution,
                reporterName: row.reporter.fullName,
                resolvedByName: row.resolvedBy?.fullName ?? null,
                createdAtLabel: formatDateTime(row.createdAt),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
