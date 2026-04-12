export async function resolveTenantContext(
  supabase,
  { fallbackTenantId = null } = {},
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      tenantId: fallbackTenantId || null,
      role: null,
    };
  }

  const { data: profile } = await supabase
    .from("staff_profiles")
    .select("tenant_id, role")
    .eq("id", user.id)
    .maybeSingle();

  const tenantId =
    profile?.tenant_id || user?.user_metadata?.tenant_id || fallbackTenantId;

  return {
    user,
    tenantId: tenantId || null,
    role: profile?.role || null,
  };
}

