import { createClient } from "@/lib/supabase/server";
import { buildCategoryTree, normalizeParentIds } from "@/lib/categoryRelations";


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

  const links = (categories || []).filter(c => c.parent_id).map(c => ({
    parent_id: c.parent_id,
    subcategory_id: c.id
  }));
  return buildCategoryTree(categories || [], links);
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

  return (categories || []).map((cat) => ({
    ...cat,
    parent_ids: normalizeParentIds(cat.parent_id),
  }));
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

  return {
    ...data,
    parent_ids: normalizeParentIds(data.parent_id),
  };
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
