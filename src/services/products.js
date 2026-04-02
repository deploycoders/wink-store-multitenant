import { createClient } from "@/lib/supabase/server";

const normalizeProductVariants = (variants = []) =>
  (variants || []).map((variant) => ({
    ...variant,
    name: variant.name || variant.attribute_name || "",
    value: variant.value || variant.attribute_value || "",
    price_adjustment:
      Number(
        variant.price_adjustment ??
          variant.price_override ??
          0,
      ) || 0,
    stock_adjustment:
      Number(
        variant.stock_adjustment ??
          variant.stock_quantity ??
          0,
      ) || 0,
  }));

const normalizeProduct = (product) => ({
  ...product,
  product_variants: normalizeProductVariants(product.product_variants),
});

export async function getProducts(tenantId = null) {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(
      `
    *,
    product_variants(*),
    product_categories (
      category_id,
      categories (*)
    )
`,
    )
    .eq("status", "published");

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

export async function getHomeProducts(tenantId = null) {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(
      `
      *,
      product_variants(*),
      product_categories(category_id)
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

export async function getProductBySlug(slug, tenantId = null) {
  if (!slug) return null;

  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(
      `
      *,
      categories!subcategory_id(*),
      product_variants(*)
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
