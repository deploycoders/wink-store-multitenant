import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolveTenantContext } from "@/lib/tenantContext";

const normalizeProductVariants = (variants = []) =>
  (variants || []).map((variant) => ({
    ...variant,
    name: variant.name || variant.attribute_name || "",
    value: variant.value || variant.attribute_value || "",
    price_adjustment:
      Number(variant.price_adjustment ?? variant.price_override ?? 0) || 0,
    stock_adjustment:
      Number(variant.stock_adjustment ?? variant.stock_quantity ?? 0) || 0,
  }));

const mapProductForClient = (product) => {
  const stockObj = Array.isArray(product.product_stock) ? product.product_stock[0] : product.product_stock;
  return {
    ...product,
    stock: stockObj ? stockObj.quantity : 0,
    product_variants: normalizeProductVariants(product.product_variants),
  };
};

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

// GET /api/products
export async function GET(request) {
  try {
    const supabase = await createClient();
    const tenantFromQuery = request.nextUrl.searchParams.get("tenant_id");
    const { tenantId } = await resolveTenantContext(supabase, {
      fallbackTenantId: tenantFromQuery,
    });

    let query = supabase.from("products").select(`
  *,
  category:categories!category_id(id, name),
  subcategory:categories!subcategory_id(id, name),
  product_stock(quantity),
  product_variants(*)
`);

    if (tenantId) {
      query = query.eq("tenant_id", tenantId);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) throw error;
    return NextResponse.json({
      success: true,
      data: (data || []).map(mapProductForClient),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// POST /api/products
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      short_description,
      description,
      price,
      discount_price,
      stock,
      images,
      category_ids = [], // Array de categorías para la tabla pivot
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

    if (!name || !price || normalizedCategoryIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Nombre, precio y al menos una categoría son obligatorios",
        },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const { tenantId } = await resolveTenantContext(supabase, {
      fallbackTenantId: payloadTenantId,
    });

    if (!tenantId) {
      return NextResponse.json(
        {
          success: false,
          error: "No se pudo resolver el tenant para crear el producto.",
        },
        { status: 400 },
      );
    }

    // 1. Insertar el producto
    const { data: product, error: pError } = await supabase
      .from("products")
      .insert([
        {
          name,
          short_description,
          description,
          price: parseFloat(price),
          discount_price: discount_price ? parseFloat(discount_price) : null,
          images: images || [],
          subcategory_id: subcategory_id || null,
          status: status || "draft",
          featured: featured || false,
          slug:
            slug ||
            name
              .toLowerCase()
              .replace(/ /g, "-")
              .replace(/[^\w-]+/g, ""),
          category_id:
            normalizedCategoryIds.length > 0 ? normalizedCategoryIds[0] : null,
          tenant_id: tenantId,
        },
      ])
      .select()
      .single();

    if (pError) throw pError;
    const productId = product.id;
    const parsedStock = parseInt(stock) || 0;

    if (parsedStock > 0) {
      const { error: stockEx } = await supabase.from("stock_movements").insert({
        tenant_id: tenantId,
        product_id: productId,
        movement_type: "adjustment",
        quantity: parsedStock,
        reason: "Initial stock creation",
        reference_type: "products_api"
      });
      if (stockEx) console.warn("Failed creating initial stock:", stockEx);
    }


    // 3. Insertar variantes si existen
    if (variants.length > 0) {
      const variantsToInsert = variants
        .map((v) => mapVariantToDb(v, { tenantId, productId }))
        .filter((v) => v.attribute_value);

      if (variantsToInsert.length > 0) {
        const { error: vError } = await supabase
          .from("product_variants")
          .insert(variantsToInsert);

        if (vError) {
          throw new Error(`Error guardando variantes: ${vError.message}`);
        }
      }
    }

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
