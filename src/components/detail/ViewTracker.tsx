"use client";

import { useEffect, useRef } from "react";
import { logProfileViewAction } from "@/lib/analytics/actions";
import { recordViewAction } from "@/lib/student/actions";

// Records a profile view (analytics) and the student's recently viewed list once the
// page is shown. A client effect avoids counting prefetches.
export function ViewTracker({ boardingHouseId }: { boardingHouseId: string }) {
  const logged = useRef(false);

  useEffect(() => {
    if (logged.current) return;
    logged.current = true;
    void logProfileViewAction(boardingHouseId);
    void recordViewAction(boardingHouseId);
  }, [boardingHouseId]);

  return null;
}
