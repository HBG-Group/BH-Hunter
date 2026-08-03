CREATE TABLE "subscription_events" (
  "id" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "plan" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "amount" INTEGER,
  "paymentReference" TEXT,
  "receiptUrl" TEXT,
  "payerName" TEXT,
  "phoneLast4" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "reviewedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "subscription_events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "subscription_events_ownerId_createdAt_idx" ON "subscription_events"("ownerId", "createdAt");
CREATE INDEX "subscription_events_status_createdAt_idx" ON "subscription_events"("status", "createdAt");
ALTER TABLE "subscription_events" ADD CONSTRAINT "subscription_events_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "subscription_events" ADD CONSTRAINT "subscription_events_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
