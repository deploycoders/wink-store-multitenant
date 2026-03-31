import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolveTenantContext } from "@/lib/tenantContext";

const mapVariantToDb = (variant, { tenantId, productId }) => ({
  product_id: productId,
  tenant_id: tenantId,
  attribute_name: String(
    variant.name || variant.attribute_name || "Variante",
  ).trim(),
  attribute_value: String(
    variant.value || variant.attribute_value || "",
  ).trim(),
  price_override:
    Number(variant.price_adjustment ?? variant.price_override ?? 0) || 0,
  stock_quantity:
    Number(variant.stock_adjustment ?? variant.stock_quantity ?? 0) || 0,
  sku: variant.sku || null,
});

// PUT /api/products/[id]
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      short_description,
      description,
      price,
      discount_price,
      stock,
      images,
      category_ids = [],
      subcategory_id,
      status,
      featured,
      slug,
      variants = [],
      tenant_id: payloadTenantId,
    } = body;
    const normalizedCategoryIds = [
      ...new Set((category_ids || []).filter(Boolean)),
    ];

    const supabase = await createClient();
    const { tenantId } = await resolveTenantContext(supabase, {
      fallbackTenantId: payloadTenantId,
    });

    // 1. Actualizar el producto
    let productUpdate = supabase
      .from("products")
      .update({
        name,
        short_description,
        description,
        price: parseFloat(price),
        discount_price: discount_price ? parseFloat(discount_price) : null,
        stock: parseInt(stock),
        images: images || [],
        subcategory_id: subcategory_id || null,
        status,
        featured,
        slug,
        category_id:
          normalizedCategoryIds.length > 0 ? normalizedCategoryIds[0] : null,
      })
      .eq("id", id);

    if (tenantId) {
      productUpdate = productUpdate.eq("tenant_id", tenantId);
    }

    const { data: product, error: pError } = await productUpdate
      .select()
      .single();

    if (pError) throw pError;

    // 2. Sincronizar categorías (product_categories)
    if (category_ids) {
      const uniqueCategoryIds = normalizedCategoryIds;

      // A. Limpiar todas las relaciones previas del producto (sin filtrar tenant
      // para cubrir filas legacy con tenant_id NULL)
      const { error: delError } = await supabase
        .from("product_categories")
        .delete()
        .eq("product_id", id);
      if (delError) throw delError;

      // B. Insertar nuevas relaciones de forma idempotente
      if (uniqueCategoryIds.length > 0) {
        const pcToInsert = uniqueCategoryIds.map((catId) => ({
          product_id: id,
          category_id: catId,
          tenant_id: tenantId || null,
        }));

        const { error: pcError } = await supabase
          .from("product_categories")
          .upsert(pcToInsert, { onConflict: "product_id,category_id" });

        if (pcError) {
          throw new Error(`Error actualizando categorías: ${pcError.message}`);
        }
      }
    }

    // 3. Refrescar variantes (borrar y re-insertar para simplicidad)
    if (variants) {
      // Borrar anteriores
      let deleteVariants = supabase
        .from("product_variants")
        .delete()
        .eq("product_id", id);
      if (tenantId) {
        deleteVariants = deleteVariants.eq("tenant_id", tenantId);
      }
      const { error: deleteVariantsError } = await deleteVariants;
      if (deleteVariantsError) {
        throw new Error(
          `Error limpiando variantes anteriores: ${deleteVariantsError.message}`,
        );
      }

      // Insertar nuevas si las hay
      if (variants.length > 0) {
        const variantsToInsert = variants
          .map((v) => mapVariantToDb(v, { tenantId, productId: id }))
          .filter((v) => v.attribute_value);

        if (variantsToInsert.length > 0) {
          const { error: variantsError } = await supabase
            .from("product_variants")
            .insert(variantsToInsert);
          if (variantsError) {
            throw new Error(
              `Error guardando variantes: ${variantsError.message}`,
            );
          }
        }
      }
    }

    if (pError) throw pError;
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// DELETE /api/products/[id]
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const tenantFromQuery = request.nextUrl.searchParams.get("tenant_id");
    const { tenantId } = await resolveTenantContext(supabase, {
      fallbackTenantId: tenantFromQuery,
    });

    let deleteQuery = supabase.from("products").delete().eq("id", id);
    if (tenantId) {
      deleteQuery = deleteQuery.eq("tenant_id", tenantId);
    }
    const { error } = await deleteQuery;

    if (error) throw error;
    return NextResponse.json({ success: true, message: "Producto eliminado" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
