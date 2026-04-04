import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolveTenantContext } from "@/lib/tenantContext";
import { normalizeParentIds } from "@/lib/categoryRelations";


// GET /api/categories/[id]
export async function GET(request, { params }) {
  const { id } = await params;
  const supabase = await createClient();
  const tenantFromQuery = request.nextUrl.searchParams.get("tenant_id");
  const { tenantId } = await resolveTenantContext(supabase, {
    fallbackTenantId: tenantFromQuery,
  });

  let query = supabase.from("categories").select("*").eq("id", id);

  if (tenantId) {
    query = query.eq("tenant_id", tenantId);
  }

  const { data, error } = await query.single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 404 });
  }

  const parentIds = data.parent_id ? [data.parent_id] : [];

  return NextResponse.json({
    success: true,
    data: {
      ...data,
      parent_ids: parentIds.length > 0 ? parentIds : data.parent_id ? [data.parent_id] : [],
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

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: "Nombre y slug son obligatorios" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { tenantId } = await resolveTenantContext(supabase, {
      fallbackTenantId: payloadTenantId,
    });
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

    const { data, error } = await query.select().single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }



    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}

// DELETE /api/categories/[id]
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const tenantFromQuery = request.nextUrl.searchParams.get("tenant_id");
    const { tenantId } = await resolveTenantContext(supabase, {
      fallbackTenantId: tenantFromQuery,
    });

    let query = supabase.from("categories").delete().eq("id", id);
    if (tenantId) {
      query = query.eq("tenant_id", tenantId);
    }
    const { error } = await query;

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}
