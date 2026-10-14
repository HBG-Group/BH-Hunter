-- The RLS auto-enable function is invoked by a PostgreSQL event trigger.
-- API roles do not need permission to execute it directly.
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
