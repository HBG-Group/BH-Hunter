-- Prevent a retried viewing submission from creating a second request.
CREATE UNIQUE INDEX "viewing_requests_studentId_boardingHouseId_preferredAt_key"
ON "viewing_requests"("studentId", "boardingHouseId", "preferredAt");

CREATE TYPE "ModerationAction" AS ENUM (
  'LISTING_VERIFICATION',
  'LISTING_STATUS',
  'LISTING_FEATURED',
  'LISTING_DELETION',
  'OWNER_VERIFICATION',
  'REVIEW_DELETION'
);

CREATE TABLE "moderation_events" (
  "id" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "action" "ModerationAction" NOT NULL,
  "targetType" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "detail" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "moderation_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "moderation_events_actorId_createdAt_idx"
ON "moderation_events"("actorId", "createdAt");

CREATE INDEX "moderation_events_targetType_targetId_createdAt_idx"
ON "moderation_events"("targetType", "targetId", "createdAt");

ALTER TABLE "moderation_events"
ADD CONSTRAINT "moderation_events_actorId_fkey"
FOREIGN KEY ("actorId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "moderation_events" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "moderation_events" FROM anon, authenticated;
