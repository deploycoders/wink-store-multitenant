import AnimatedHeaderProducts from "@/components/public/products/AnimatedHeaderProduct";
import AnimatedProducts from "@/components/public/products/AnimatedProducts";
import { getCategories } from "@/services/categories";
import { getProducts } from "@/services/products";
import { DEFAULT_SITE_NAME, getSiteConfig } from "@/lib/siteConfig";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }) {
  const { tenant } = await params;
  const { site_name } = await getSiteConfig({ tenantSlug: tenant });
  const brand = site_name || DEFAULT_SITE_NAME;

  return {
    title: `Catálogo | ${brand}`,
    description: "Explora nuestro set de piezas esenciales.",
  };
}

export default async function ProductsPage({ params }) {
  const { tenant } = await params;
  const supabase = await createClient();

  // Obtener el ID del tenant a partir del slug
  const { data: tenantRow } = await supabase
    .from("tenants")
    .select("tenant_id")
    .eq("slug", tenant)
    .single();

  const tenantId = tenantRow?.tenant_id;

  // 2. Ejecutamos ambas peticiones en paralelo para mayor velocidad
  const [products, categories] = await Promise.all([
    getProducts(tenantId),
    getCategories(tenantId),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12">
      <section className="py-24">
        <AnimatedHeaderProducts />

        {/* 3. Pasamos las categorías al componente cliente */}
        <AnimatedProducts products={products} categories={categories} />
      </section>
    </div>
  );
}
