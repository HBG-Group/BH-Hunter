CREATE TABLE "rate_limit_windows" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "reset_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "rate_limit_windows_pkey" PRIMARY KEY ("key")
);

CREATE INDEX "rate_limit_windows_reset_at_idx" ON "rate_limit_windows"("reset_at");

ALTER TABLE "rate_limit_windows" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "rate_limit_windows" FROM anon, authenticated;
