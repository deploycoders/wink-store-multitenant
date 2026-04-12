import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

const PLATFORM_STORAGE_KEY = "sb-platform-auth";

const PLATFORM_ADMIN_EMAILS = (process.env.PLATFORM_ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const isPlatformAdminEmail = (email) => {
  if (!email || PLATFORM_ADMIN_EMAILS.length === 0) return false;
  return PLATFORM_ADMIN_EMAILS.includes(String(email).toLowerCase());
};

const hasPlatformScopeInMetadata = (user) => {
  const scopeFromUserMetadata = user?.user_metadata?.access_scope;
  const scopeFromAppMetadata = user?.app_metadata?.access_scope;
  return scopeFromUserMetadata === "platform" || scopeFromAppMetadata === "platform";
};

export async function POST(req) {
  const { tenantIds } = await req.json().catch(() => ({}));
  const ids = Array.isArray(tenantIds)
    ? tenantIds.map((v) => Number(v)).filter((v) => Number.isFinite(v))
    : [];

  if (ids.length === 0) {
    return NextResponse.json({ counts: {} });
  }

  // Validate platform session (separate cookie scope).
  let res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next();
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options),
          );
        },
      },
      auth: { storageKey: PLATFORM_STORAGE_KEY },
    },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!hasPlatformScopeInMetadata(user) && !isPlatformAdminEmail(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Use service role to count staff by tenant (bypasses RLS safely).
  const admin = getAdminSupabaseClient();
  const { data, error } = await admin
    .from("staff_profiles")
    .select("tenant_id")
    .in("tenant_id", ids);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const counts = {};
  for (const row of data || []) {
    const tenantId = Number(row.tenant_id);
    if (!Number.isFinite(tenantId)) continue;
    counts[tenantId] = (counts[tenantId] || 0) + 1;
  }

  return NextResponse.json({ counts });
}

