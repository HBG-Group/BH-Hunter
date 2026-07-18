// Decides when to send "room available" alerts. Only fires on the transition into an
// available state, so students aren't notified repeatedly while a room stays open.

import type { AvailabilityState } from "@/types/domain";
import { createRoomAvailableNotifications } from "@/lib/db/notifications";

export async function maybeNotifyRoomAvailable(
  boardingHouseId: string,
  before: AvailabilityState,
  after: AvailabilityState,
): Promise<void> {
  const becameAvailable = before !== "AVAILABLE" && after === "AVAILABLE";
  if (!becameAvailable) return;
  await createRoomAvailableNotifications(boardingHouseId);
}
