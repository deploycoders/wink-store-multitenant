import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolveTenantContext } from "@/lib/tenantContext";
import { normalizeParentIds } from "@/lib/categoryRelations";

const isMissingCategoryParentsTable = (error) =>
  typeof error?.message === "string" &&
  error.message.includes("category_parents");

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

  let linksQuery = supabase
    .from("category_parents")
    .select("parent_id")
    .eq("subcategory_id", id);
  if (tenantId) {
    linksQuery = linksQuery.eq("tenant_id", tenantId);
  }

  const { data: parentLinks, error: linksError } = await linksQuery;
  const parentIds =
    !linksError || isMissingCategoryParentsTable(linksError)
      ? (parentLinks || []).map((row) => row.parent_id)
      : [];

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

    const deleteLinks = supabase
      .from("category_parents")
      .delete()
      .eq("subcategory_id", id);
    const deleteScoped = tenantId ? deleteLinks.eq("tenant_id", tenantId) : deleteLinks;
    const { error: deleteLinksError } = await deleteScoped;

    if (deleteLinksError && !isMissingCategoryParentsTable(deleteLinksError)) {
      return NextResponse.json(
        { success: false, error: deleteLinksError.message },
        { status: 500 },
      );
    }

    if (normalizedParentIds.length > 0) {
      const linksToInsert = normalizedParentIds.map((parentId) => ({
        parent_id: parentId,
        subcategory_id: id,
        tenant_id: tenantId || null,
      }));

      const { error: insertLinksError } = await supabase
        .from("category_parents")
        .insert(linksToInsert);

      if (insertLinksError && isMissingCategoryParentsTable(insertLinksError)) {
        if (normalizedParentIds.length > 1) {
          return NextResponse.json(
            {
              success: false,
              error:
                "Para asignar múltiples categorías padre debes crear la tabla category_parents.",
            },
            { status: 400 },
          );
        }
      } else if (insertLinksError) {
        return NextResponse.json(
          { success: false, error: insertLinksError.message },
          { status: 500 },
        );
      }
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
