import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const globalForSupabase = globalThis;

export function getAdminSupabaseClient() {
  if (globalForSupabase.__supabaseAdminClient) {
    return globalForSupabase.__supabaseAdminClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  globalForSupabase.__supabaseAdminClient = createSupabaseClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );

  return globalForSupabase.__supabaseAdminClient;
}
