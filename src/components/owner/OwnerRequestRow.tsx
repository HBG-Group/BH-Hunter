"use client";

import { useTransition } from "react";
import { confirmViewingRequestAction, deleteViewingRequestAction } from "@/lib/owner/actions";
import { ReportButton } from "@/components/reports/ReportButton";

export interface OwnerRequestView {
  id: string;
  listingName: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string | null;
  preferredAtLabel: string;
  status: string;
  message: string | null;
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-emerald-100 text-emerald-800",
  DECLINED: "bg-neutral-100 text-neutral-600",
  CANCELLED: "bg-neutral-100 text-neutral-600",
};

export function OwnerRequestRow({ request }: { request: OwnerRequestView }) {
  const [pending, startTransition] = useTransition();

  const confirm = () =>
    startTransition(async () => {
      await confirmViewingRequestAction(request.id);
    });

  const remove = () =>
    startTransition(async () => {
      await deleteViewingRequestAction(request.id);
    });

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-neutral-900">{request.listingName}</p>
        <span
          className={`rounded-md px-2 py-0.5 text-xs font-medium ${
            statusStyles[request.status] ?? "bg-neutral-100 text-neutral-600"
          }`}
        >
          {request.status.toLowerCase()}
        </span>
      </div>

      <p className="mt-0.5 text-xs text-neutral-500">
        Requested by <span className="font-medium text-neutral-700">{request.studentName}</span> ·{" "}
        {request.preferredAtLabel}
      </p>
      <p className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
        <a href={`mailto:${request.studentEmail}`} className="text-primary hover:underline">
          {request.studentEmail}
        </a>
        {request.studentPhone && (
          <a href={`tel:${request.studentPhone}`} className="text-primary hover:underline">
            {request.studentPhone}
          </a>
        )}
      </p>
      {request.message && <p className="mt-1 text-sm text-neutral-600">{request.message}</p>}

      <div className="mt-2 flex gap-2">
        {request.status !== "CONFIRMED" && (
          <button
            onClick={confirm}
            disabled={pending}
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-hover disabled:opacity-60"
          >
            {pending ? "…" : "Confirm"}
          </button>
        )}
        <button
          onClick={remove}
          disabled={pending}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-rose-600 ring-1 ring-inset ring-rose-200 hover:ring-rose-300 disabled:opacity-60"
        >
          {pending ? "…" : "Delete"}
        </button>
        <ReportButton
          targetType="STUDENT"
          targetId={request.studentId}
          label="Report student"
          className="ml-auto rounded-lg px-3 py-1.5 text-xs font-medium text-muted ring-1 ring-inset ring-line hover:ring-neutral-300"
        />
      </div>
    </div>
  );
}
