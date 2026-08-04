-- Application database access uses Prisma with the service/database role.
-- Keep the public Supabase API deny-by-default instead of relying on empty policy sets.
DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'profiles', 'subscriptions', 'advertisements', 'recently_viewed',
    'notification_preferences', 'boarding_houses', 'rooms', 'amenities',
    'boarding_house_amenities', 'images', 'nearby_places', 'reviews',
    'favorites', 'viewing_requests', 'analytics_events', 'notifications'
  ] LOOP
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO anon, authenticated USING (false) WITH CHECK (false)',
      'deny_public_api_' || table_name,
      table_name
    );
  END LOOP;
END $$;

-- The listing photo bucket is intentionally public for rendered listing images.
-- Public buckets do not need a SELECT policy for object URL reads. Upload, update,
-- and delete remain unavailable to public API roles; the app uses server-issued
-- signed upload URLs and the server-only service role for cleanup.
CREATE POLICY listing_photos_public_insert_denied
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (false);

CREATE POLICY listing_photos_public_update_denied
  ON storage.objects FOR UPDATE TO anon, authenticated
  USING (false) WITH CHECK (false);

CREATE POLICY listing_photos_public_delete_denied
  ON storage.objects FOR DELETE TO anon, authenticated
  USING (false);
