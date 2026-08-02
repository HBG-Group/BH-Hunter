"use client";

import { useState } from "react";
import { ReportModal } from "./ReportModal";
import type { ReportTargetType } from "@/config/reports";

interface Props {
  targetType: ReportTargetType;
  targetId: string;
  label?: string;
  className?: string;
}

// Small trigger that opens the shared ReportModal. Only rendered for signed-in
// users by callers — filing a report requires an account (see fileReportAction).
export function ReportButton({ targetType, targetId, label = "Report", className }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={className ?? "text-xs font-medium text-muted underline hover:text-ink"}
      >
        {label}
      </button>
      {open && <ReportModal targetType={targetType} targetId={targetId} onClose={() => setOpen(false)} />}
    </>
  );
}
