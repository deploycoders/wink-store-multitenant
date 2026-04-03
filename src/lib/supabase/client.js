import { createBrowserClient } from "@supabase/ssr";

const globalForSupabase = globalThis;

export function createClient() {
  if (globalForSupabase.__supabaseBrowserClient) {
    return globalForSupabase.__supabaseBrowserClient;
  }

  globalForSupabase.__supabaseBrowserClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  return globalForSupabase.__supabaseBrowserClient;
}
