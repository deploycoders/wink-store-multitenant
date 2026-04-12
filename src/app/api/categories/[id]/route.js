import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolveTenantContext } from "@/lib/tenantContext";
import { normalizeParentIds } from "@/lib/categoryRelations";

// Función auxiliar para obtener el cliente correcto según la sesión
async function getAuthenticatedClient() {
  let supabase = await createClient("sb-admin-auth");
  let {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    supabase = await createClient("sb-platform-auth");
    const {
      data: { user: pUser },
    } = await supabase.auth.getUser();
    user = pUser;
  }
  return supabase;
}

// GET /api/categories/[id]
export async function GET(request, { params }) {
  const { id } = await params;
  const supabase = await getAuthenticatedClient();

  const tenantFromQuery = request.nextUrl.searchParams.get("tenant_id");
  const { tenantId } = await resolveTenantContext(supabase, {
    fallbackTenantId: tenantFromQuery,
  });

  let query = supabase.from("categories").select("*").eq("id", id);

  // CAMBIO: Permitir ver la categoría si es del tenant O si es del sistema (null)
  if (tenantId) {
    query = query.or(`tenant_id.eq.${tenantId},tenant_id.is.null`);
  } else {
    query = query.is("tenant_id", null);
  }

  const { data, error } = await query.maybeSingle();

  if (error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  if (!data)
    return NextResponse.json(
      { success: false, error: "Categoría no encontrada" },
      { status: 404 },
    );

  return NextResponse.json({
    success: true,
    data: {
      ...data,
      parent_ids: normalizeParentIds(data.parent_id),
    },
  });
}

// PUT /api/categories/[id]
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      slug,
      parent_id,
      parent_ids,
      image_url,
      tenant_id: payloadTenantId,
    } = body;

    const supabase = await getAuthenticatedClient();
    const { tenantId } = await resolveTenantContext(supabase, {
      fallbackTenantId: payloadTenantId,
    });

    // SEGURIDAD: Antes de actualizar, verificamos que NO sea una categoría del sistema
    // a menos que seas un superadmin (esto evita que un tenant edite el catálogo maestro)
    const { data: checkCat } = await supabase
      .from("categories")
      .select("is_system, tenant_id")
      .eq("id", id)
      .maybeSingle();

    if (checkCat?.is_system && tenantId) {
      return NextResponse.json(
        {
          success: false,
          error: "No puedes editar categorías del catálogo maestro",
        },
        { status: 403 },
      );
    }

    const normalizedParentIds = normalizeParentIds(parent_ids ?? parent_id);
    const legacyParentId = normalizedParentIds[0] || null;

    let query = supabase
      .from("categories")
      .update({
        name,
        slug,
        parent_id: legacyParentId,
        image_url: image_url || null,
      })
      .eq("id", id);

    if (tenantId) {
      query = query.eq("tenant_id", tenantId);
    }

    const { data, error } = await query.select().maybeSingle();

    if (error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    if (!data)
      return NextResponse.json(
        {
          success: false,
          error: "No tienes permiso para editar esta categoría",
        },
        { status: 404 },
      );

    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}

// DELETE /api/categories/[id]
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const supabase = await getAuthenticatedClient();

    const tenantFromQuery = request.nextUrl.searchParams.get("tenant_id");
    const { tenantId } = await resolveTenantContext(supabase, {
      fallbackTenantId: tenantFromQuery,
    });

    // SEGURIDAD: Verificar si es del sistema antes de borrar
    const { data: checkCat } = await supabase
      .from("categories")
      .select("is_system")
      .eq("id", id)
      .maybeSingle();

    if (checkCat?.is_system && tenantId) {
      return NextResponse.json(
        { success: false, error: "No se pueden eliminar categorías maestras" },
        { status: 403 },
      );
    }

    let query = supabase.from("categories").delete().eq("id", id);

    if (tenantId) {
      query = query.eq("tenant_id", tenantId);
    }

    const { error } = await query;

    if (error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
