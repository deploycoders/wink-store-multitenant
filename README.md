# E-commerce Web Multitenant

Proyecto full-stack en Next.js con multitenancy de tenant dinámico y backend en Supabase.

## 📦 Estructura de carpetas

- `web/`
  - Frontend Next.js (app router)
  - `src/app/[tenant]/...` (tenant dinámico)
  - `src/app/(admin)/...` (admin dashboard)
  - `src/app/(platform-admin)/...` (gestión de tenants global)
  - `src/lib/` (configuración Supabase + utilidades)
- `database_fix.sql` (ajustes de esquema y datos iniciales)
- `README.md` (este archivo)

## ⚙️ Requisitos

- Node.js 18+
- npm
- Git
- Base de datos PostgreSQL/Supabase
- `.env` para credenciales (no subir al repositorio)

## 🚀 Instalación rápida

```bash
git clone <repo-url>
cd ecommerce-web-multitenant

# frontend
cd web
npm install
npm run dev
```

- App: `http://localhost:3000`

## 🔗 Supabase

- La conexión está en `web/src/lib/supabase/client.js` (o similar según tu estructura)
- Variables esperadas:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_SUPABASE_PUBLIC_ANON_KEY`
  - (opcional) `SUPABASE_SERVICE_ROLE_KEY` para server-side

## 🧩 Multitenancy

- Ruta cliente principal: `/[tenant]` (tenant se define en la URL)
- Las páginas admin deben agregarse bajo `/admin` y `/platform-admin` según permisos.
- La lógica de filtrado de `tenant` está en la capa de servicios (`src/services/` + `src/lib`).

## 🛠 Comandos disponibles

En `web`:

- `npm run dev` (desarrollo)
- `npm run build` (build producción)
- `npm run start` (servidor producción)

## 🚨 Buenas prácticas

- No commitear `.env`
- No commitear `node_modules`
- Mantener datos de tenant aislados en Supabase y usar políticas de RLS si es necesario.

## 📨 Información rápida

En este repo, el frontend consume Supabase directamente (sin Strapi). El backend es la propia capa de Supabase con funciones y tablas. Si necesitas configuración de deploy en Vercel/Netlify, se añade con las mismas variables de entorno.
