-- Extend the moderation audit trail and add user-facing reporting + verification status.

ALTER TYPE "ModerationAction" ADD VALUE 'OWNER_FREEZE';
ALTER TYPE "ModerationAction" ADD VALUE 'OWNER_DELETION';
ALTER TYPE "ModerationAction" ADD VALUE 'REPORT_RESOLUTION';

CREATE TYPE "ReportTargetType" AS ENUM ('LISTING', 'REVIEW', 'OWNER', 'STUDENT');

CREATE TYPE "ReportReason" AS ENUM (
  'FAKE_LISTING',
  'SCAM',
  'WRONG_INFO',
  'OFFENSIVE',
  'DUPLICATE',
  'SPAM',
  'FALSE_INFO',
  'HARASSMENT',
  'FAKE_PROFILE',
  'ABUSIVE_BEHAVIOR',
  'OTHER'
);

CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'RESOLVED', 'DISMISSED');

CREATE TYPE "OwnerVerificationStatus" AS ENUM ('UNVERIFIED', 'PENDING', 'APPROVED', 'REJECTED');

ALTER TABLE "profiles"
ADD COLUMN "verificationStatus" "OwnerVerificationStatus" NOT NULL DEFAULT 'UNVERIFIED';

CREATE TABLE "reports" (
  "id" TEXT NOT NULL,
  "reporterId" TEXT NOT NULL,
  "targetType" "ReportTargetType" NOT NULL,
  "targetId" TEXT NOT NULL,
  "reason" "ReportReason" NOT NULL,
  "message" TEXT,
  "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
  "resolvedById" TEXT,
  "resolvedAt" TIMESTAMP(3),
  "resolution" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "reports_status_createdAt_idx" ON "reports"("status", "createdAt");
CREATE INDEX "reports_targetType_targetId_idx" ON "reports"("targetType", "targetId");
CREATE INDEX "reports_reporterId_idx" ON "reports"("reporterId");

ALTER TABLE "reports"
ADD CONSTRAINT "reports_reporterId_fkey"
FOREIGN KEY ("reporterId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "reports"
ADD CONSTRAINT "reports_resolvedById_fkey"
FOREIGN KEY ("resolvedById") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "reports" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "reports" FROM anon, authenticated;
