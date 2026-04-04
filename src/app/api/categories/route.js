import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolveTenantContext } from "@/lib/tenantContext";
import {
  buildCategoryTree,
  normalizeParentIds,
} from "@/lib/categoryRelations";


// GET /api/categories
export async function GET(request) {
  const supabase = await createClient();
  const tenantFromQuery = request.nextUrl.searchParams.get("tenant_id");
  const { tenantId } = await resolveTenantContext(supabase, {
    fallbackTenantId: tenantFromQuery,
  });

  let query = supabase.from("categories").select("*");

  if (tenantId) {
    query = query.eq("tenant_id", tenantId);
  }

  const { data: categories, error } = await query.order("name", {
    ascending: true,
  });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  const links = (categories || []).filter(c => c.parent_id).map(c => ({
    parent_id: c.parent_id,
    subcategory_id: c.id
  }));

  return NextResponse.json({
    success: true,
    data: buildCategoryTree(categories || [], links),
  });
}

// POST /api/categories
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, slug, parent_id, parent_ids, image_url, tenant_id: payloadTenantId } = body;

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

    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: "No se pudo resolver el tenant de la categoría" },
        { status: 400 },
      );
    }

    const normalizedParentIds = normalizeParentIds(parent_ids ?? parent_id);
    const legacyParentId = normalizedParentIds[0] || null;

    const { data, error } = await supabase
      .from("categories")
      .insert([
        {
          name,
          slug,
          parent_id: legacyParentId,
          image_url: image_url || null,
          tenant_id: tenantId,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }



    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err) {
    console.error("API Error in POST /api/categories:", err);
    return NextResponse.json({ success: false, error: err.message || "Error interno" }, { status: 500 });
  }
}
