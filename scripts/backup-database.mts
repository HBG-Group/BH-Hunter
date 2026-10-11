// Manual logical database backup for the free-plan reliability drill.
// See docs/BACKUP_RESTORE.md for the full procedure.
//
// Uses the direct (non-pooled) connection string because pg_dump cannot run
// through the pgbouncer transaction pooler. Writes a timestamped custom-format
// dump to BACKUP_DIR (default ".backups", which is git-ignored) and never logs
// credentials.

import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "Set DIRECT_URL (preferred) or DATABASE_URL to the source database before running the backup.",
  );
}

function redact(value: string): string {
  try {
    const url = new URL(value);
    return `${url.host}${url.pathname}`;
  } catch {
    return "<unparsable-connection-string>";
  }
}

const outputDir = resolve(process.env.BACKUP_DIR ?? ".backups");
mkdirSync(outputDir, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const outputFile = resolve(outputDir, `meino-${stamp}.dump`);

console.log(`Backing up ${redact(connectionString)} -> ${outputFile}`);

const result = spawnSync(
  "pg_dump",
  [
    "--format=custom",
    "--no-owner",
    "--no-privileges",
    "--file",
    outputFile,
    connectionString,
  ],
  { stdio: "inherit" },
);

if (result.error) {
  throw new Error(
    "Could not run pg_dump. Install the PostgreSQL client tools and ensure pg_dump is on PATH.",
  );
}

if (result.status !== 0) {
  throw new Error(`pg_dump exited with code ${result.status}.`);
}

console.log("Backup complete. Verify and restore using docs/BACKUP_RESTORE.md.");
