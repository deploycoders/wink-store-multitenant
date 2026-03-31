import { createClient } from "@/lib/supabase/client";

export async function getTenants() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tenants")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching tenants:", error.message);
    return [];
  }
  return data;
}

export async function createTenant(tenantData) {
  const supabase = createClient();

  // 1. Mapeamos los datos para que coincidan con las columnas de tu SQL
  const payload = {
    nombre: tenantData.name,
    slug: tenantData.slug,
    plan_type: tenantData.plan || "Bronze",
    whatsapp_number: tenantData.whatsapp_number || null,
    status: "Active",
  };

  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .insert([payload])
    .select()
    .single();

  if (tenantError) {
    console.error("Error en Supabase al crear tenant:", tenantError.message);
    throw tenantError;
  }

  // 2. Opcional: crear settings base para el tenant nuevo
  await supabase
    .from("site_settings")
    .insert([{ tenant_id: tenant.tenant_id }]);

  // 3. Usamos 'tenant_id' porque así se llama tu llave primaria en la tabla
  const { data: invitation, error: invitationError } = await supabase
    .from("invitations")
    .insert([{ tenant_id: tenant.tenant_id }])
    .select()
    .single();

  if (invitationError) {
    console.error("Error al crear invitación:", invitationError.message);
    throw invitationError;
  }

  return { tenant, invitation };
}

export async function updateTenant(tenantId, payload) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tenants")
    .update(payload)
    .eq("tenant_id", tenantId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getInvitation(tokenId) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("invitations")
    .select("*, tenants(*)")
    .eq("id", tokenId)
    .eq("used", false)
    .maybeSingle(); // Usar maybeSingle es más seguro para evitar errores 406

  if (error) {
    console.error("Error buscando invitación:", error.message);
    return null;
  }
  return data;
}
