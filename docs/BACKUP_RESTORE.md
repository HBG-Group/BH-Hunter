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
- The direct (non-pooled) `DIRECT_URL` in the environment only. The backup
  script rejects `DATABASE_URL` because it may point to the transaction pooler.
- `BACKUP_ENCRYPTION_KEY`: canonical base64 for 32 cryptographically random
  bytes. Generate it with a trusted local tool (for example,
  `openssl rand -base64 32`) and store it in a secret manager. Keep the same key
  securely available to restore operators; never commit it or paste it into logs.
- A second free Supabase project available as the restore target.
- `RESTORE_DIRECT_URL`: direct connection string for the disposable restore
  project. Restore credentials are separate from production and stored in the
  platform secret manager, not in the repository.

Never commit dump files, encryption keys, or connection strings. `.backups/` and
encrypted dump files are git-ignored.

## Procedure

1. Export the database (writes a timestamped authenticated encrypted dump):

   ```bash
   npm run db:backup
   ```

   The script streams `pg_dump` output through AES-256-GCM directly to an
   encrypted file, without writing a plaintext dump. It removes the password
   from the connection URL before starting `pg_dump` and supplies it through the
   child process environment. It creates the partial encrypted file with
   owner-only permissions on POSIX systems. Store backups on a restricted
   encrypted volume; Windows uses the destination folder's inherited access
   control list.

   The script writes to a `.partial` file first and renames it to the final
   `.dump.enc` name only after `pg_dump` succeeds. A failed export removes the
   partial file, so any completed `.dump.enc` in `.backups/` is authenticated.

2. Inventory object storage: list bucket objects and note the count and total
   size. Download a small sample set for an archive if storage restore evidence
   is required.

3. Restore into the disposable project. Set `RESTORE_DIRECT_URL` and the same
   `BACKUP_ENCRYPTION_KEY` used for the backup, then run:

   ```bash
   npm run db:restore -- .backups/meino-<timestamp>.dump.enc
   ```

   The restore command authenticates and decrypts into a restricted temporary
   file before starting `pg_restore`, then removes that plaintext file on exit.
   Ensure the temporary directory is on a protected disk and that the target is
   disposable; the command cannot determine whether a database contains valuable
   data.

4. Validate integrity: compare row counts for the core tables
   (`profiles`, `listings`, `reviews`, `favorites`, `viewing_requests`) between
   source and target, and spot-check a few records.

5. Record evidence (redacted): date, operator, source host, target host, encrypted
   dump size, and a SHA-256 checksum of the encrypted dump file.

6. Clean up: drop the disposable restore database/schema, remove sample objects,
   and delete the local encrypted dump when it is no longer needed.

## Evidence to attach

- The checksum and size of the produced encrypted dump (no connection strings
  or encryption key).
- Row-count comparison between source and target.
- The Storage inventory summary.
- The objective table above once RPO/RTO are approved.
