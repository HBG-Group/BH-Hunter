-- Prisma uses a dedicated database role instead of the project owner.
-- The login stays disabled until a secret is set through the approved secret
-- handling flow. This role is for trusted server-side code only.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'meino_runtime') THEN
    CREATE ROLE meino_runtime
      NOLOGIN
      NOSUPERUSER
      NOCREATEDB
      NOCREATEROLE
      NOINHERIT
      NOREPLICATION
      NOBYPASSRLS
      CONNECTION LIMIT 10;
  END IF;
END
$$;

-- Reassert restricted attributes without changing the login/password set by
-- the secret-handling step.
ALTER ROLE meino_runtime NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS CONNECTION LIMIT 10;

GRANT USAGE ON SCHEMA public TO meino_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO meino_runtime;

-- Keep the direct Supabase API roles denied while permitting the server-side
-- Prisma role. New tables still need an explicit grant and policy migration.
DO $$
DECLARE
  table_record record;
BEGIN
  FOR table_record IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = table_record.tablename
        AND policyname = 'meino_runtime_access'
    ) THEN
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR ALL TO meino_runtime USING (true) WITH CHECK (true)',
        'meino_runtime_access',
        table_record.tablename
      );
    END IF;
  END LOOP;
END
$$;

ALTER ROLE meino_runtime SET row_security = on;
