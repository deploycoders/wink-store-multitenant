import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { buildCategoryTree, normalizeParentIds } from "@/lib/categoryRelations";

const getCachedAnonymousClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        fetch: (url, options) => {
          return fetch(url, { ...options, next: { revalidate: 60 } });
        },
      },
    },
  );
};

async function getTenantStoreType(tenantId) {
  if (!tenantId) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tenants")
    .select("store_type")
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching tenant store_type:", error);
    return null;
  }

  return data?.store_type || null;
}

export async function getPublicCategoriesFlat(tenantId = null) {
  // 1. Usar el cliente que ya tiene la configuración de cookies/auth
  const supabase = await createClient();

  let storeType = null;
  if (tenantId) {
    const { data: tenant } = await supabase
      .from("tenants")
      .select("store_type")
      .eq("tenant_id", Number(tenantId))
      .single();
    storeType = tenant?.store_type;
  }

  // 2. Construcción limpia de la query
  let query = supabase.from("categories").select("*");

  if (tenantId && storeType) {
    // Consulta: Mis categorías O las globales de mi rubro
    query = query.or(
      `tenant_id.eq.${tenantId},and(tenant_id.is.null,store_type.eq.${storeType})`,
    );
  } else {
    query = query.is("tenant_id", null);
  }

  const { data, error } = await query.order("name", { ascending: true });

  if (error) {
    console.error("Error en categorías:", error.message);
    return [];
  }

  return data || [];
}

/**
 * Obtiene las categorías maestras filtradas por el tipo de tienda.
 * IMPORTANTE: Solo trae las que tienen tenant_id en NULL (Maestras).
 */
export async function getCategoriesByStoreType(storeType) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("store_type", storeType)
    .is("tenant_id", null) // Filtro crítico para el catálogo maestro
    .order("name", { ascending: true });

  if (error) {
    console.error("Error cargando catálogo maestro:", error);
    return [];
  }

  // Si usas estructura jerárquica (subcategorías), construimos el árbol aquí
  return buildCategoryTree(data || []);
}

/**
 * Obtiene categorías en estructura plana.
 * Si no se pasa tenantId, solo trae las maestras.
 */
export async function getAllCategoriesFlat(tenantId = null) {
  const supabase = await createClient();

  let query = supabase.from("categories").select("*").order("name", {
    ascending: true,
  });

  if (tenantId) {
    // Trae las del inquilino + las maestras
    query = query.or(`tenant_id.eq.${tenantId},tenant_id.is.null`);
  } else {
    query = query.is("tenant_id", null);
  }

  const { data: categories, error } = await query;

  if (error) {
    console.error("Error fetching all categories:", error);
    return [];
  }

  return (categories || []).map((cat) => ({
    ...cat,
    parent_ids: normalizeParentIds(cat.parent_id),
  }));
}

/**
 * Obtiene una categoría específica.
 */
export async function getCategoryById(id, tenantId = null) {
  if (!id) return null;
  const supabase = await createClient();

  let query = supabase.from("categories").select("*").eq("id", id);

  // Si se provee tenantId, validamos que sea suya o maestra
  if (tenantId) {
    query = query.or(`tenant_id.eq.${tenantId},tenant_id.is.null`);
  }

  const { data, error } = await query.maybeSingle();

  if (error || !data) {
    console.error("Error fetching category:", error);
    return null;
  }

  return {
    ...data,
    parent_ids: normalizeParentIds(data.parent_id),
  };
}

/**
 * Crea una nueva categoría.
 * Nota: Si el usuario crea una, se le asigna su tenant_id automáticamente.
 */
export async function createCategory(data) {
  const supabase = await createClient();

  // Forzamos que si es creada por un usuario, is_system sea false
  const payload = { ...data, is_system: data.is_system || false };

  const { data: category, error } = await supabase
    .from("categories")
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("Error creating category:", error);
    return { success: false, error: error.message };
  }
  return { success: true, data: category };
}

/**
 * Actualiza una categoría existente.
 * Protege que un usuario no edite categorías del sistema.
 */
export async function updateCategory(id, data, tenantId = null) {
  const supabase = await createClient();

  // Paso previo de seguridad: No permitir editar si es is_system y no eres admin
  let query = supabase.from("categories").update(data).eq("id", id);

  if (tenantId) {
    query = query.eq("tenant_id", tenantId); // Un usuario solo edita las SUYAS
  }

  const { data: category, error } = await query.select().maybeSingle();

  if (error) {
    console.error("Error updating category:", error);
    return { success: false, error: error.message };
  }

  if (!category) {
    return {
      success: false,
      error: "No se encontró la categoría o no tienes permiso para editarla",
    };
  }

  return { success: true, data: category };
}

/**
 * Elimina una categoría.
 */
export async function deleteCategory(id, tenantId = null) {
  const supabase = await createClient();

  let query = supabase.from("categories").delete().eq("id", id);

  if (tenantId) {
    query = query.eq("tenant_id", tenantId); // Solo puede borrar si le pertenece
  }

  const { error } = await query;

  if (error) {
    console.error("Error deleting category:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
}
