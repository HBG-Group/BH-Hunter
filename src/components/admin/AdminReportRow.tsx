"use client";

import { useState, useTransition } from "react";
import { resolveReportAction } from "@/lib/admin/actions";
import { REPORT_REASON_LABELS, REPORT_TARGET_LABELS, type ReportReason, type ReportTargetType } from "@/config/reports";

export interface AdminReportView {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  message: string | null;
  status: "OPEN" | "RESOLVED" | "DISMISSED";
  resolution: string | null;
  reporterName: string;
  resolvedByName: string | null;
  createdAtLabel: string;
}

const statusStyles: Record<string, string> = {
  OPEN: "bg-amber-100 text-amber-800",
  RESOLVED: "bg-emerald-100 text-emerald-800",
  DISMISSED: "bg-neutral-100 text-neutral-600",
};

export function AdminReportRow({ report }: { report: AdminReportView }) {
  const [pending, startTransition] = useTransition();
  const [resolution, setResolution] = useState("");

  const act = (status: "RESOLVED" | "DISMISSED") =>
    startTransition(async () => {
      await resolveReportAction(report.id, status, resolution || undefined);
    });

  return (
    <div className="px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-neutral-900">
              {REPORT_TARGET_LABELS[report.targetType]} · {REPORT_REASON_LABELS[report.reason]}
            </span>
            <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${statusStyles[report.status]}`}>
              {report.status.toLowerCase()}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-neutral-500">
            Reported by {report.reporterName} · target id {report.targetId} · {report.createdAtLabel}
          </p>
          {report.message && <p className="mt-1 text-sm text-neutral-600">{report.message}</p>}
          {report.status !== "OPEN" && (
            <p className="mt-1 text-xs text-neutral-500">
              {report.status === "RESOLVED" ? "Resolved" : "Dismissed"} by {report.resolvedByName ?? "an admin"}
              {report.resolution ? ` — ${report.resolution}` : ""}
            </p>
          )}
        </div>
      </div>

      {report.status === "OPEN" && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            value={resolution}
            onChange={(event) => setResolution(event.target.value.slice(0, 500))}
            placeholder="Resolution note (optional)"
            aria-label="Resolution note (optional)"
            className="min-w-0 flex-1 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs outline-none focus:border-primary"
          />
          <button
            onClick={() => act("RESOLVED")}
            disabled={pending}
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-hover disabled:opacity-60"
          >
            {pending ? "…" : "Resolve"}
          </button>
          <button
            onClick={() => act("DISMISSED")}
            disabled={pending}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-600 ring-1 ring-inset ring-neutral-200 hover:ring-neutral-300 disabled:opacity-60"
          >
            {pending ? "…" : "Dismiss"}
          </button>
        </div>
      )}
    </div>
  );
}
