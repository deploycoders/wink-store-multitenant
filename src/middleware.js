import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

// Mapeo de rutas permitidas por rol
const ROLE_PERMISSIONS = {
  super_admin: [
    "/admin",
    "/admin/products",
    "/admin/categories",
    "/admin/orders",
    "/admin/customers",
    "/admin/history",
    "/admin/settings",
    "/admin/profile",
  ],
  editor: [
    "/admin",
    "/admin/products",
    "/admin/categories",
    "/admin/orders",
    "/admin/profile",
  ],
  viewer: ["/admin", "/admin/orders", "/admin/profile"],
  custom: ["/admin", "/admin/profile"], // Rol personalizado inicia con acceso básico
};

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 120;
const RATE_LIMIT_BLOCK_SECONDS = Math.ceil(RATE_LIMIT_WINDOW_MS / 1000);

const globalForRateLimit = globalThis;
if (!globalForRateLimit.__tenantRateLimitStore) {
  globalForRateLimit.__tenantRateLimitStore = new Map();
}
const rateLimitStore = globalForRateLimit.__tenantRateLimitStore;

const RESERVED_PREFIXES = new Set([
  "admin",
  "api",
  "access",
  "_next",
  "register",
  "tenants",
]);

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
  pathname.includes("/checkout");

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

  // Solo protegemos rutas que empiecen con /admin y NO sean el login
  if (pathname.startsWith("/admin") && pathname !== "/access") {
    // Crear cliente de Supabase para Middleware (Next.js 15+)
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

    // Obtener sesión del usuario
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // 1. Si NO hay sesión, redirigir al login inmediatamente (EVITA EL FLICKER)
    if (!session) {
      const loginUrl = new URL("/access", req.url);
      // Opcional: guardar la url actual para volver después del login
      // loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 2. Control de Acceso por Rol (Opcional: podrías consultar DB aquí para 'custom')
    // Por ahora usamos la lógica de ROLE_PERMISSIONS estática para los roles básicos
    // En una implementación avanzada, podrías obtener el perfil desde 'staff_profiles'

    /*
    const { data: profile } = await supabase.from('staff_profiles').select('role').eq('id', session.user.id).single();
    const userRole = profile?.role || "viewer";
    */

    // SIMULACIÓN: Para que el sistema no se bloquee mientras configuras DB,
    // podrías dejar pasar a todos los logueados a /admin,
    // y dejar que el layout haga el check fino.
    // Pero si quieres protección rígida aquí:

    /*
    const userRole = session.user.app_metadata?.role || "viewer"; // Depende de tu esquema
    const allowedRoutes = ROLE_PERMISSIONS[userRole] || [];
    const isAllowed = allowedRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));

    if (!isAllowed && pathname !== '/admin') {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    */
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
