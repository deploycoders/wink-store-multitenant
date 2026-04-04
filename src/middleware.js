import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 120;
const RATE_LIMIT_BLOCK_SECONDS = Math.ceil(RATE_LIMIT_WINDOW_MS / 1000);
const ADMIN_LOGIN_PATH = "/access";
const PLATFORM_LOGIN_PATH = "/platform-access";

const globalForRateLimit = globalThis;
if (!globalForRateLimit.__tenantRateLimitStore) {
  globalForRateLimit.__tenantRateLimitStore = new Map();
}
const rateLimitStore = globalForRateLimit.__tenantRateLimitStore;

const RESERVED_PREFIXES = new Set([
  "admin",
  "api",
  "access",
  "platform-access",
  "_next",
  "register",
  "tenants",
]);

const PLATFORM_ADMIN_EMAILS = (process.env.PLATFORM_ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const getClientIp = (req) => {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
};

const resolveTenantScope = (pathname) => {
  if (!pathname || pathname === "/") return "root";
  const firstSegment = pathname.split("/").filter(Boolean)[0];
  if (!firstSegment) return "root";
  if (RESERVED_PREFIXES.has(firstSegment)) return firstSegment;
  return `tenant:${firstSegment}`;
};

const shouldRateLimitPath = (pathname) =>
  pathname.startsWith("/api") ||
  pathname.startsWith("/admin") ||
  pathname.startsWith("/tenants") ||
  pathname.includes("/checkout");

const hasPlatformScopeInMetadata = (user) => {
  const scopeFromUserMetadata = user?.user_metadata?.access_scope;
  const scopeFromAppMetadata = user?.app_metadata?.access_scope;
  return scopeFromUserMetadata === "platform" || scopeFromAppMetadata === "platform";
};

const isPlatformAdminEmail = (email) => {
  if (!email || PLATFORM_ADMIN_EMAILS.length === 0) return false;
  return PLATFORM_ADMIN_EMAILS.includes(String(email).toLowerCase());
};

const isAuthPath = (pathname) =>
  pathname === ADMIN_LOGIN_PATH || pathname === PLATFORM_LOGIN_PATH;

const isAdminAreaPath = (pathname) =>
  pathname.startsWith("/admin") && pathname !== ADMIN_LOGIN_PATH;

const isPlatformAreaPath = (pathname) =>
  pathname.startsWith("/tenants") && pathname !== PLATFORM_LOGIN_PATH;

const getPortalContext = async (supabase, session) => {
  if (!session?.user?.id) {
    return { type: "anonymous", hasStaffProfile: false };
  }

  const { data: staffProfile, error: profileError } = await supabase
    .from("staff_profiles")
    .select("id")
    .eq("id", session.user.id)
    .maybeSingle();

  if (profileError) {
    return { type: "unknown", hasStaffProfile: false };
  }

  if (staffProfile?.id) {
    return { type: "admin", hasStaffProfile: true };
  }

  const email = session.user.email;
  if (hasPlatformScopeInMetadata(session.user) || isPlatformAdminEmail(email)) {
    return { type: "platform", hasStaffProfile: false };
  }

  return { type: "unknown", hasStaffProfile: false };
};

const cleanupExpiredRateLimitEntries = (now) => {
  if (rateLimitStore.size < 5000) return;
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
};

const applyRateLimit = (req) => {
  const pathname = req.nextUrl.pathname;
  if (!shouldRateLimitPath(pathname)) return null;

  const now = Date.now();
  cleanupExpiredRateLimitEntries(now);

  const ip = getClientIp(req);
  const tenantScope = resolveTenantScope(pathname);
  const key = `${tenantScope}:${ip}`;

  const current = rateLimitStore.get(key);
  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return null;
  }

  current.count += 1;

  if (current.count > RATE_LIMIT_MAX_REQUESTS) {
    const response = NextResponse.json(
      {
        error:
          "Demasiadas solicitudes. Intenta nuevamente en unos segundos.",
      },
      { status: 429 },
    );
    response.headers.set("Retry-After", String(RATE_LIMIT_BLOCK_SECONDS));
    return response;
  }

  return null;
};

export async function middleware(req) {
  const rateLimitedResponse = applyRateLimit(req);
  if (rateLimitedResponse) return rateLimitedResponse;

  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  if (isAdminAreaPath(pathname) || isPlatformAreaPath(pathname) || isAuthPath(pathname)) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              req.cookies.set(name, value),
            );
            res = NextResponse.next({
              request: {
                headers: req.headers,
              },
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              res.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      if (isAuthPath(pathname)) {
        return res;
      }

      const loginTarget = isPlatformAreaPath(pathname)
        ? PLATFORM_LOGIN_PATH
        : ADMIN_LOGIN_PATH;
      return NextResponse.redirect(new URL(loginTarget, req.url));
    }

    const portalContext = await getPortalContext(supabase, session);

    if (pathname === ADMIN_LOGIN_PATH) {
      if (portalContext.type === "admin") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      if (portalContext.type === "platform") {
        return NextResponse.redirect(new URL("/tenants", req.url));
      }
      return res;
    }

    if (pathname === PLATFORM_LOGIN_PATH) {
      if (portalContext.type === "platform") {
        return NextResponse.redirect(new URL("/tenants", req.url));
      }
      if (portalContext.type === "admin") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      return res;
    }

    if (isAdminAreaPath(pathname) && portalContext.type !== "admin") {
      return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, req.url));
    }

    if (isPlatformAreaPath(pathname) && portalContext.type !== "platform") {
      if (portalContext.type === "admin") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      return NextResponse.redirect(new URL(PLATFORM_LOGIN_PATH, req.url));
    }
  }

  return res;
}

// Configurar en qué rutas se ejecuta el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
