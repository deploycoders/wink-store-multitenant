import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { email, password, full_name, token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Token de invitación requerido" },
        { status: 400 },
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );

    const { data: invitation, error: invError } = await supabaseAdmin
      .from("invitations")
      .select(
        `
    *,
    tenants (
      nombre
    )
  `,
      )
      .eq("id", token) // Si envías el UUID de la columna 'id'
      .eq("used", false)
      .single();

    if (invError || !invitation) {
      return NextResponse.json(
        { error: "Invitación inválida o ya utilizada" },
        { status: 400 },
      );
    }

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name,
          tenant_id: invitation.tenant_id,
          access_scope: "admin",
        },
        app_metadata: { access_scope: "admin" },
      });

    if (authError) throw authError;

    const { error: profileError } = await supabaseAdmin
      .from("staff_profiles")
      .insert([
        {
          id: authData.user.id,
          full_name,
          email,
          role: "super_admin",
          tenant_id: invitation.tenant_id,
          permissions: [
            "Panel",
            "Productos",
            "Categorías",
            "Ventas",
            "Clientes",
            "Bitácora",
            "Ajustes",
          ],
        },
      ]);

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }

    await supabaseAdmin
      .from("invitations")
      .update({ used: true })
      .eq("id", token);

    return NextResponse.json({
      message: "Registro completado con éxito",
      tenant_name: invitation.tenants.name,
    });
  } catch (error) {
    console.error("Error en registro por invitación:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
