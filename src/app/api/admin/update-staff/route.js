import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { logAudit } from "@/lib/auditLog";

export async function POST(request) {
  try {
    const { userId, email, role, permissions, actor_name, target_name, tenant_id } = await request.json();

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 1. Actualizar el email en Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      email: email,
    });
    if (authError) throw authError;

    // 2. Actualizar el rol y permisos en staff_profiles
    const { error: profileError } = await supabaseAdmin
      .from("staff_profiles")
      .update({ 
        permissions: permissions || [],
        role: role || "viewer"
      })
      .eq("id", userId);

    if (profileError) throw profileError;

    // 3. Registrar en bitácora
    await logAudit(supabaseAdmin, {
      tipo: "usuario",
      accion: "editar",
      descripcion: `Usuario actualizado: ${target_name ?? email} → rol "${role}"`,
      usuario_nombre: actor_name ?? "Admin",
      meta: { userId, email, role, permissions: permissions || [] },
    });

    return NextResponse.json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
