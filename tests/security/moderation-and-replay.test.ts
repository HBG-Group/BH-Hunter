import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { isDuplicateViewingRequestError } from "@/lib/db/viewing-requests";

test("a duplicate viewing-request write is recognized as an idempotent replay", () => {
  assert.equal(isDuplicateViewingRequestError({ code: "P2002" }), true);
  assert.equal(isDuplicateViewingRequestError({ code: "P2025" }), false);
  assert.equal(isDuplicateViewingRequestError(null), false);
});

test("moderation actions persist a durable history entry", async () => {
  const source = await readFile(resolve("src/lib/admin/actions.ts"), "utf8");
  const advertisementSource = await readFile(resolve("src/lib/admin/ad-actions.ts"), "utf8");
  const migration = await readFile(
    resolve("prisma/migrations/20260731120000_moderation_audit_and_viewing_dedup/migration.sql"),
    "utf8",
  );

  assert.match(source, /recordModerationEvent/);
  assert.match(source, /LISTING_STATUS/);
  assert.match(source, /REVIEW_DELETION/);
  assert.match(migration, /CREATE TABLE "moderation_events"/);
  assert.match(migration, /CREATE UNIQUE INDEX "viewing_requests_studentId_boardingHouseId_preferredAt_key"/);
  assert.match(advertisementSource, /ADVERTISEMENT_CREATION/);
  assert.match(advertisementSource, /ADVERTISEMENT_STATUS/);
  assert.match(advertisementSource, /ADVERTISEMENT_DELETION/);
});
