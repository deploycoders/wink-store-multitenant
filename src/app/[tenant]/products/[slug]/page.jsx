import { getProductBySlug, getHomeProducts } from "@/services/products";
import ProductView from "@/components/public/products/ProductView";
import RelatedProducts from "@/components/public/products/RelatedProducts";
import { DEFAULT_SITE_NAME, getSiteConfig } from "@/lib/siteConfig";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }) {
  const { tenant, slug } = await params;
  const supabase = await createClient();

  // Obtener el ID del tenant a partir del slug
  const { data: tenantRow } = await supabase
    .from("tenants")
    .select("tenant_id")
    .eq("slug", tenant)
    .single();

  const product = await getProductBySlug(slug, tenantRow?.tenant_id);

  if (!product) {
    return { title: "Producto no encontrado" };
  }

  const { site_name } = await getSiteConfig({ tenantId: tenantRow?.tenant_id });
  const brand = site_name || DEFAULT_SITE_NAME;

  return {
    title: product.name,
    description:
      product.description || `Descubre ${product.name} en ${brand}.`,
    openGraph: {
      images: [
        {
          url: product.images?.[0] || "/og-image.jpg",
          alt: product.name,
        },
      ],
    },
  };
}

export default async function ProductPage({ params }) {
  const { tenant, slug } = await params;
  const supabase = await createClient();

  // Obtener el ID del tenant a partir del slug
  const { data: tenantRow } = await supabase
    .from("tenants")
    .select("tenant_id")
    .eq("slug", tenant)
    .single();

  const tenantId = tenantRow?.tenant_id;

  const [product, allProducts] = await Promise.all([
    getProductBySlug(slug, tenantId),
    getHomeProducts(tenantId),
  ]);

  if (!product) {
    return (
      <div className="p-20 text-center">
        <p>Producto no encontrado (Slug: {slug})</p>
      </div>
    );
  }

  // 2. Lógica de filtrado para "Productos Relacionados"
  const currentSubcategoryId = product.subcategory_id;

  const relatedProducts = allProducts.filter((p) => {
    const isDifferentProduct = p.id !== product.id;
    const sharesCategory = p.subcategory_id === currentSubcategoryId;
    return isDifferentProduct && sharesCategory;
  });

  const finalRelated =
    relatedProducts.length > 0
      ? relatedProducts
      : allProducts.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <>
      <ProductView product={product} />
      <RelatedProducts products={finalRelated} />
    </>
  );
}
