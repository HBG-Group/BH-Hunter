# Database Backup and Restore Drill

Last updated: August 3, 2026

This runbook covers the manual logical backup and restore drill used to produce
evidence for the free-plan reliability review. It intentionally excludes managed
Supabase Point-in-Time Recovery (PITR), which is not part of the free-plan scope.

## Scope

- Database: a logical dump of the application Postgres database.
- Storage: an inventory of object paths (and an optional small-object archive).
- Restore target: a **separate** free Supabase project. Never restore over the
  production project.

## Proposed objectives (confirm with the team)

Record the approved values here once the drill owner signs off. These are
starting points, not approved targets:

| Objective | Proposed value | Approved value |
| --- | --- | --- |
| Recovery point objective (RPO) | 24 hours (daily manual backup) | _pending_ |
| Recovery time objective (RTO) | 4 hours (manual restore) | _pending_ |

## Prerequisites

- PostgreSQL client tools (`pg_dump`, `pg_restore`) on `PATH`.
- The source connection string in the environment only. Use the direct
  (non-pooled) `DIRECT_URL`; the pooler cannot serve `pg_dump`.
- A second free Supabase project available as the restore target.
- Restore credentials are separate from production and stored in the platform
  secret manager, not in the repository.

Never commit dump files or connection strings. `.backups/` is git-ignored.

## Procedure

1. Export the database (writes a timestamped custom-format dump):

   ```bash
   npm run db:backup
   ```

   This is equivalent to:

   ```bash
   pg_dump --format=custom --no-owner --no-privileges \
     --file ".backups/meino-<timestamp>.dump" "$DIRECT_URL"
   ```

   The script writes to a `.partial` file first and renames it to the final
   `.dump` name only after `pg_dump` succeeds. A failed export removes the
   partial file, so any `.dump` left in `.backups/` is a completed backup.

2. Inventory object storage: list bucket objects and note the count and total
   size. Download a small sample set for an archive if storage restore evidence
   is required.

3. Restore into the disposable project using the target's direct connection
   string:

   ```bash
   pg_restore --no-owner --no-privileges \
     --dbname "$RESTORE_DIRECT_URL" ".backups/meino-<timestamp>.dump"
   ```

4. Validate integrity: compare row counts for the core tables
   (`profiles`, `listings`, `reviews`, `favorites`, `viewing_requests`) between
   source and target, and spot-check a few records.

5. Record evidence (redacted): date, operator, source host, target host, dump
   size, and a SHA-256 checksum of the dump file.

6. Clean up: drop the disposable restore database/schema, remove sample objects,
   and delete the local dump when it is no longer needed.

## Evidence to attach

- The checksum and size of the produced dump (no connection strings).
- Row-count comparison between source and target.
- The Storage inventory summary.
- The objective table above once RPO/RTO are approved.
