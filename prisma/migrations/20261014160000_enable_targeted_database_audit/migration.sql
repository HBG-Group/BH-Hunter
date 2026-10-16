-- PGAudit is preloaded by Supabase on both managed projects. Install its
-- database extension and log runtime writes plus privileged schema/role work.
CREATE EXTENSION IF NOT EXISTS pgaudit;

ALTER ROLE meino_runtime SET pgaudit.log TO 'write, ddl, role';
ALTER ROLE postgres SET pgaudit.log TO 'ddl, role';
