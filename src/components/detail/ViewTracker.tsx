"use client";

import { useEffect, useRef } from "react";
import { logProfileViewAction } from "@/lib/analytics/actions";
import { recordViewAction } from "@/lib/student/actions";
import { recordRecentListing } from "@/lib/cookies/recentListings";

// Records a profile view (analytics) and the student's recently viewed list once the
// page is shown. A client effect avoids counting prefetches. The cookie-based recent
// list works even for guests; recordViewAction additionally persists it to the DB
// for signed-in students.
export function ViewTracker({ boardingHouseId }: { boardingHouseId: string }) {
  const logged = useRef(false);

  useEffect(() => {
    if (logged.current) return;
    logged.current = true;
    void logProfileViewAction(boardingHouseId);
    void recordViewAction(boardingHouseId);
    recordRecentListing(boardingHouseId);
  }, [boardingHouseId]);

  return null;
}
