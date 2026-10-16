-- The server-side Prisma role is the only application path to public tables.
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM anon, authenticated;

-- This project-owned event-trigger routine is not part of the application's
-- PostgREST RPC API. The provider-owned PGAudit event-trigger routines are
-- managed by Supabase's supabase_admin role and are reviewed separately.
DO $$
BEGIN
  IF to_regprocedure('public.rls_auto_enable()') IS NOT NULL THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated, service_role';
  END IF;
END
$$;
