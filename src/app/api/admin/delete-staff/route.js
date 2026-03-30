import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { logAudit } from "@/lib/auditLog";

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");
    const targetName = searchParams.get("name") ?? "desconocido";
    const actorName = searchParams.get("actor") ?? "Admin";

    if (!userId) throw new Error("ID de usuario requerido");

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Obtener nombre antes de eliminar
    const { data: profile } = await supabaseAdmin
      .from("staff_profiles")
      .select("full_name, email, role")
      .eq("id", userId)
      .single();

    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) throw authError;

    await supabaseAdmin.from("staff_profiles").delete().eq("id", userId);

    // Registrar en bitácora
    await logAudit(supabaseAdmin, {
      tipo: "usuario",
      accion: "eliminar",
      descripcion: `Usuario eliminado: ${profile?.full_name ?? targetName} (${profile?.email ?? ""})`,
      usuario_nombre: actorName,
      meta: { deleted_user: profile ?? { id: userId } },
    });

    return NextResponse.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
