import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteConfigProvider } from "@/context/SiteConfigContext";
import { getSiteConfigServerCached } from "@/lib/siteConfig.server";

/**
 * Server Component para layout multitenant.
 * Ajustado a la estructura real: tenant_id, nombre, status.
 */
export default async function TenantBrandingLayout({ tenant, children }) {
  const supabase = await createClient();

  // 1. Obtener datos básicos del tenant
  const { data: tenantRow, error: tenantError } = await supabase
    .from("tenants")
    .select(
      "tenant_id, slug, name, logo_url, primary_color, secondary_color, status",
    )
    .eq("slug", tenant)
    .eq("status", "Active")
    .maybeSingle();

  if (tenantError) {
    console.error("Tenant lookup error:", tenantError.message);
  }

  if (!tenantRow) {
    notFound();
  }

  // 2. Obtener configuración del sitio en el servidor para hidratar el cliente
  const siteConfig = await getSiteConfigServerCached({
    tenantId: tenantRow.tenant_id,
  });

  return (
    <SiteConfigProvider
      tenantId={tenantRow.tenant_id}
      tenantSlug={tenant}
      initialData={siteConfig}
    >
      <div
        style={{
          "--tenant-primary": tenantRow.primary_color || "#111111",
          "--tenant-secondary": tenantRow.secondary_color || "#f6f6f6",
        }}
      >
        {children}
      </div>
    </SiteConfigProvider>
  );
}
