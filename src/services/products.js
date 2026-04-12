// NOTE: This file works in BOTH server and client contexts.
// Always pass a `supabaseClient` when calling from a Client Component.
// Server Components / API Routes can omit it and it will be imported lazily.

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

const normalizeProduct = (product) => {
  const stockObj = Array.isArray(product.product_stock)
    ? product.product_stock[0]
    : product.product_stock;

  // Mantenemos product_variants para ProductView (tienda pública)
  const normalizedVariants = normalizeProductVariants(product.product_variants);

  return {
    ...product,
    stock: stockObj ? stockObj.quantity : 0,
    variants: normalizedVariants || [],
    // IMPORTANTE: product_variants se mantiene (no se borra) para que
    // ProductView pueda leerlo con el nuevo formato de attributes jsonb.
    product_variants: normalizedVariants || [],
    category_ids: product.product_categories?.map((pc) => pc.category_id) || [],
    product_categories: undefined,
    product_stock: undefined,
  };
};

export async function getProducts(tenantId = null, supabaseClient = null) {
  const supabase =
    supabaseClient ||
    (await import("@/lib/supabase/server").then((m) => m.createClient()));

  let query = supabase
    .from("products")
    .select(
      `
    *,
    product_variants(*),
    product_stock(quantity),
    product_categories(category_id)
`,
    );

  if (tenantId) {
    query = query.eq("tenant_id", tenantId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching products:", error.message);
    return [];
  }
  return (data || []).map(normalizeProduct);
}

export async function getHomeProducts(tenantId = null, supabaseClient = null) {
  const supabase =
    supabaseClient ||
    (await import("@/lib/supabase/server").then((m) => m.createClient()));

  let query = supabase
    .from("products")
    .select(
      `
      *,
      product_variants(*),
      product_stock(quantity)
    `,
    )
    .eq("status", "published")
    .eq("featured", true)
    .order("created_at", { ascending: false });

  if (tenantId) {
    query = query.eq("tenant_id", tenantId);
  }

  const { data: products, error } = await query;

  if (error) {
    console.error("Error fetching home products:", error.message);
    return [];
  }

  return (products || []).map(normalizeProduct);
}

export async function getProductBySlug(slug, tenantId = null, supabaseClient = null) {
  if (!slug) return null;

  const supabase =
    supabaseClient ||
    (await import("@/lib/supabase/server").then((m) => m.createClient()));

  let query = supabase
    .from("products")
    .select(
      `
      *,
      product_variants(*),
      product_stock(quantity)
    `,
    )
    .eq("slug", slug)
    .eq("status", "published");

  if (tenantId) {
    query = query.eq("tenant_id", tenantId);
  }

  const { data: product, error } = await query.single();

  if (error) {
    console.error("Supabase Error:", error.message);
    return null;
  }

  return normalizeProduct(product);
}
