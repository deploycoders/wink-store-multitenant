import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { logAudit } from "@/lib/auditLog";

export async function POST(request) {
  try {
    const { email, password, full_name, role, permissions, actor_name, tenant_id } = await request.json();

    // 1. Creamos un cliente de Supabase con la Service Role Key (Permisos de Admin)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 2. Crear el usuario en Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        access_scope: "admin",
      },
      app_metadata: { access_scope: "admin" },
    });

    if (authError) throw authError;

    // 3. Crear el perfil en staff_profiles usando el ID generado
    const { error: profileError } = await supabaseAdmin
      .from("staff_profiles")
      .insert([
        {
          id: authData.user.id,
          full_name,
          email,
          tenant_id,
          permissions: permissions || [],
        },
      ]);

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }

    if (tenant_id) {
      await supabaseAdmin.from("tenant_members").insert({
        tenant_id,
        user_id: authData.user.id,
        role: role || "viewer"
      });
    }

    // 4. Registrar en bitácora
    await logAudit(supabaseAdmin, {
      tipo: "usuario",
      accion: "crear",
      descripcion: `Nuevo usuario creado: ${full_name} (${email}) con rol "${role}"`,
      usuario_nombre: actor_name ?? "Admin",
      meta: { email, role, permissions: permissions || [] },
    });

    return NextResponse.json({ message: "Usuario creado con éxito" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
