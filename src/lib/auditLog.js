/**
 * auditLog.js
 * -----------
 * Shared helper to register events in the `bitacora` table.
 * Accepts a pre-initialized Supabase client so it can be used
 * from Server Actions, API routes, and client components alike.
 *
 * SQL to create the table (run once in Supabase SQL editor):
 *
 * CREATE TABLE bitacora (
 *   id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
 *   created_at  timestamptz DEFAULT now() NOT NULL,
 *   tipo        text NOT NULL,          -- 'venta' | 'cliente' | 'producto' | 'usuario' | 'ajuste' | 'orden'
 *   accion      text NOT NULL,          -- 'crear' | 'editar' | 'eliminar' | 'aceptar' | 'rechazar' | 'login'
 *   descripcion text,
 *   usuario_id  uuid REFERENCES auth.users,
 *   usuario_nombre text,
 *   meta        jsonb
 * );
 *
 * ALTER TABLE bitacora ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Admins can view bitacora"
 *   ON bitacora FOR SELECT
 *   USING (auth.role() = 'authenticated');
 * CREATE POLICY "Service role can insert bitacora"
 *   ON bitacora FOR INSERT
 *   USING (true);          -- server-side always bypasses RLS
 */

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {{
 *   tipo: string,
 *   accion: string,
 *   descripcion?: string,
 *   usuario_id?: string,
 *   usuario_nombre?: string,
 *   meta?: object,
 * }} payload
 */
export async function logAudit(supabase, payload) {
  try {
    const { error } = await supabase.from("bitacora").insert([
      {
        tipo: payload.tipo,
        accion: payload.accion,
        descripcion: payload.descripcion ?? null,
        usuario_id: payload.usuario_id ?? null,
        usuario_nombre: payload.usuario_nombre ?? "Sistema",
        meta: payload.meta ?? null,
      },
    ]);
    if (error) {
      console.warn("[auditLog] Error saving audit entry:", error.message);
    }
  } catch (err) {
    console.warn("[auditLog] Unexpected error:", err);
  }
}
