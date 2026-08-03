-- Removes the Report feature added in 20260802180000_reports_and_verification_status.
-- The listing/review/owner/student report-and-resolve flow was built, then removed at
-- the product owner's request — no in-product report/flag feature is needed. The
-- owner verification status (OwnerVerificationStatus) added in that same migration is
-- kept; it belongs to Phase 3 (Verified Owner), not this feature.

ALTER TABLE "reports" DROP CONSTRAINT "reports_reporterId_fkey";
ALTER TABLE "reports" DROP CONSTRAINT "reports_resolvedById_fkey";

DROP TABLE "reports";

DROP TYPE "ReportTargetType";
DROP TYPE "ReportReason";
DROP TYPE "ReportStatus";

-- Postgres can't drop a single enum value directly; recreate ModerationAction without
-- REPORT_RESOLUTION and repoint every column that used the old type.
ALTER TYPE "ModerationAction" RENAME TO "ModerationAction_old";

CREATE TYPE "ModerationAction" AS ENUM (
  'LISTING_VERIFICATION',
  'LISTING_STATUS',
  'LISTING_FEATURED',
  'LISTING_DELETION',
  'OWNER_VERIFICATION',
  'OWNER_FREEZE',
  'OWNER_DELETION',
  'REVIEW_DELETION',
  'ADVERTISEMENT_CREATION',
  'ADVERTISEMENT_STATUS',
  'ADVERTISEMENT_DELETION'
);

ALTER TABLE "moderation_events"
  ALTER COLUMN "action" TYPE "ModerationAction"
  USING ("action"::text::"ModerationAction");

DROP TYPE "ModerationAction_old";
