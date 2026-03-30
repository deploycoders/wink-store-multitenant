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

export async function middleware(req) {
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
