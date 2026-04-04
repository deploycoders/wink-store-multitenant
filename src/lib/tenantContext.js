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
    .select("tenant_id")
    .eq("id", user.id)
    .maybeSingle();

  const tenantId =
    profile?.tenant_id || user?.user_metadata?.tenant_id || fallbackTenantId;

  let memberRole = null;
  if (tenantId && user) {
    const { data: member } = await supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", user.id)
      .maybeSingle();
    memberRole = member?.role || null;
  }

  return {
    user,
    tenantId: tenantId || null,
    role: memberRole,
  };
}

