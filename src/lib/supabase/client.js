import { createBrowserClient } from "@supabase/ssr";

const globalForSupabase = globalThis;

const isInvalidRefreshTokenError = (error) => {
  const message = error?.message || "";
  return /Invalid Refresh Token|Refresh Token Not Found/i.test(message);
};

export function createClient() {
  if (globalForSupabase.__supabaseBrowserClient) {
    return globalForSupabase.__supabaseBrowserClient;
  }

  globalForSupabase.__supabaseBrowserClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  if (typeof window !== "undefined") {
    globalForSupabase.__supabaseBrowserClient.auth
      .getSession()
      .then(async ({ error }) => {
        if (isInvalidRefreshTokenError(error)) {
          await globalForSupabase.__supabaseBrowserClient.auth.signOut({
            scope: "local",
          });
        }
      })
      .catch(async (error) => {
        if (isInvalidRefreshTokenError(error)) {
          await globalForSupabase.__supabaseBrowserClient.auth.signOut({
            scope: "local",
          });
        }
      });
  }

  return globalForSupabase.__supabaseBrowserClient;
}
