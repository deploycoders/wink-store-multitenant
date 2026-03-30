import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteConfigProvider } from "@/context/SiteConfigContext";

/**
 * Server Component para layout multitenant.
 * Ajustado a la estructura real: tenant_id, nombre, status.
 */
export default async function TenantBrandingLayout({ tenant, children }) {
  const supabase = await createClient();

  // Cambiamos 'id' por 'tenant_id', 'name' por 'nombre' y verificamos el status
  const { data: tenantRow, error: tenantError } = await supabase
    .from("tenants")
    .select(
      "tenant_id, slug, nombre, logo_url, primary_color, secondary_color, status",
    )
    .eq("slug", tenant)
    .eq("status", "Active") // En tu DB usas 'Active' en lugar de booleano is_active
    .maybeSingle();

  if (tenantError) {
    // Imprimimos el .message para que no salga el objeto vacío {}
    console.error("Tenant lookup error:", tenantError.message);
  }

  if (!tenantRow) {
    notFound();
  }

  return (
    <SiteConfigProvider tenantId={tenantRow.tenant_id} tenantSlug={tenant}>
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
