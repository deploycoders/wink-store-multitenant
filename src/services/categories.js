import { createClient } from "@/lib/supabase/server";
import { buildCategoryTree, normalizeParentIds } from "@/lib/categoryRelations";

const isMissingCategoryParentsTable = (error) =>
  typeof error?.message === "string" &&
  error.message.includes("category_parents");

const fetchCategoryLinks = async (supabase, tenantId = null) => {
  let query = supabase
    .from("category_parents")
    .select("parent_id, subcategory_id");

  if (tenantId) {
    query = query.eq("tenant_id", tenantId);
  }

  const { data, error } = await query;
  if (error) {
    if (isMissingCategoryParentsTable(error)) return [];
    throw error;
  }
  return data || [];
};

/**
 * Obtiene todas las categorías con sus subcategorías anidadas.
 * Las subcategorías son categorías que tienen un parent_id.
 */
export async function getCategories(tenantId = null) {
  const supabase = await createClient();
  let query = supabase.from("categories").select("*").order("name", {
    ascending: true,
  });

  if (tenantId) {
    query = query.eq("tenant_id", tenantId);
  }

  const { data: categories, error } = await query;

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  try {
    const links = await fetchCategoryLinks(supabase, tenantId);
    return buildCategoryTree(categories || [], links);
  } catch (linkError) {
    console.error("Error fetching category relations:", linkError);
    return buildCategoryTree(categories || [], []);
  }
}

/**
 * Obtiene todas las categorías (incluyendo subcategorías) en estructura plana.
 * Útil para selects y dropdowns.
 */
export async function getAllCategoriesFlat(tenantId = null) {
  const supabase = await createClient();
  let query = supabase.from("categories").select("*").order("name", {
    ascending: true,
  });

  if (tenantId) {
    query = query.eq("tenant_id", tenantId);
  }

  const { data: categories, error } = await query;

  if (error) {
    console.error("Error fetching all categories:", error);
    return [];
  }

  try {
    const links = await fetchCategoryLinks(supabase, tenantId);
    const parentMap = new Map();
    links.forEach((link) => {
      if (!parentMap.has(link.subcategory_id)) parentMap.set(link.subcategory_id, []);
      parentMap.get(link.subcategory_id).push(link.parent_id);
    });

    return (categories || []).map((cat) => ({
      ...cat,
      parent_ids: normalizeParentIds(
        parentMap.get(cat.id)?.length ? parentMap.get(cat.id) : cat.parent_id,
      ),
    }));
  } catch (linkError) {
    console.error("Error fetching category relation map:", linkError);
    return (categories || []).map((cat) => ({
      ...cat,
      parent_ids: normalizeParentIds(cat.parent_id),
    }));
  }
}

/**
 * Obtiene una categoría por su ID con sus subcategorías.
 */
export async function getCategoryById(id, tenantId = null) {
  if (!id) return null;
  const supabase = await createClient();
  let query = supabase.from("categories").select("*").eq("id", id);
  
  if (tenantId) {
    query = query.eq("tenant_id", tenantId);
  }

  const { data, error } = await query.single();

  if (error) {
    console.error("Error fetching category:", error);
    return null;
  }

  try {
    const links = await fetchCategoryLinks(supabase, tenantId);
    const parentIds = links
      .filter((link) => link.subcategory_id === id)
      .map((link) => link.parent_id);

    return {
      ...data,
      parent_ids: normalizeParentIds(parentIds.length > 0 ? parentIds : data.parent_id),
    };
  } catch (linkError) {
    console.error("Error fetching parent IDs:", linkError);
    return {
      ...data,
      parent_ids: normalizeParentIds(data.parent_id),
    };
  }
}

/**
 * Crea una nueva categoría.
 */
export async function createCategory(data) {
  const supabase = await createClient();
  const { data: category, error } = await supabase
    .from("categories")
    .insert([data])
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
 */
export async function updateCategory(id, data) {
  const supabase = await createClient();
  const { data: category, error } = await supabase
    .from("categories")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating category:", error);
    return { success: false, error: error.message };
  }
  return { success: true, data: category };
}

/**
 * Elimina una categoría por su ID.
 */
export async function deleteCategory(id) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting category:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
}
