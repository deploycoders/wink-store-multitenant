import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const globalForSupabase = globalThis;

export function getPublicSupabaseClient() {
  if (globalForSupabase.__supabasePublicClient) {
    return globalForSupabase.__supabasePublicClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  globalForSupabase.__supabasePublicClient = createSupabaseClient(
    supabaseUrl,
    anonKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );

  return globalForSupabase.__supabasePublicClient;
}
