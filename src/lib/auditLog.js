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
    const { error } = await supabase.from("audit_logs").insert([
      {
        tenant_id: payload.meta?.tenant_id || payload.tenantId || null,
        user_id: payload.usuario_id ?? null,
        action: payload.accion,
        module: payload.tipo ?? "system",
        details: {
          description: payload.descripcion ?? null,
          user_name: payload.usuario_nombre ?? "Sistema",
          ...(payload.meta || {})
        },
      },
    ]);
    if (error) {
      const message = error?.message || "";
      const missingTable =
        error?.code === "PGRST205" ||
        /Could not find the table 'public\.audit_logs'/i.test(message);

      if (missingTable) {
        return;
      }

      console.warn("[auditLog] Error saving audit entry:", error.message);
    }
  } catch (err) {
    console.warn("[auditLog] Unexpected error:", err);
  }
}
