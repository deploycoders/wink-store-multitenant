import { createClient } from "@/lib/supabase/server";

export async function getProducts(tenantId = null) {
  const supabase = await createClient();

  let query = supabase.from("products").select(`
      *,
      categories!subcategory_id(*),
      product_categories(category_id)
    `)
    .eq("status", "published");
  
  if (tenantId) {
    query = query.eq("tenant_id", tenantId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching products:", error.message);
    return [];
  }
  return data;
}

export async function getHomeProducts(tenantId = null) {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(`
      *,
      product_categories(category_id)
    `)
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

  return products;
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

  return product;
}
