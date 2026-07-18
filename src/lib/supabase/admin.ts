import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "@/config/env";

// A privileged Supabase client for server-side work (file uploads to Storage).
// It uses the service-role key, which bypasses row-level security — so this module
// must never be imported by client code. The `server-only` import enforces that.
function getServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY. See .env.example.");
  }
  return key;
}

export function createSupabaseAdminClient() {
  return createClient(supabaseUrl, getServiceRoleKey(), {
    auth: { persistSession: false },
  });
}
