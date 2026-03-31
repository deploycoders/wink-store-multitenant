export const normalizeParentIds = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return [...new Set(value.filter(Boolean))];
  return [value].filter(Boolean);
};

export const extractCategoryLinks = (categories = [], linkRows = []) => {
  const fromJoinTable = (linkRows || [])
    .map((row) => ({
      parent_id: row.parent_id,
      subcategory_id: row.subcategory_id,
    }))
    .filter((row) => row.parent_id && row.subcategory_id);

  const fromLegacyParent = (categories || [])
    .filter((cat) => cat.parent_id)
    .map((cat) => ({
      parent_id: cat.parent_id,
      subcategory_id: cat.id,
    }));

  const seen = new Set();
  return [...fromJoinTable, ...fromLegacyParent].filter((row) => {
    const key = `${row.parent_id}::${row.subcategory_id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const buildCategoryTree = (categories = [], linkRows = []) => {
  const links = extractCategoryLinks(categories, linkRows);
  const byId = new Map(
    (categories || []).map((cat) => [
      cat.id,
      { ...cat, subcategories: [], parent_ids: [] },
    ]),
  );

  links.forEach(({ parent_id, subcategory_id }) => {
    const parent = byId.get(parent_id);
    const child = byId.get(subcategory_id);
    if (!parent || !child || parent.id === child.id) return;

    if (!parent.subcategories.some((sub) => sub.id === child.id)) {
      parent.subcategories.push(child);
    }
    if (!child.parent_ids.includes(parent.id)) {
      child.parent_ids.push(parent.id);
    }
  });

  const roots = [];
  byId.forEach((cat) => {
    if (cat.parent_ids.length === 0) {
      roots.push(cat);
    }
    cat.subcategories.sort((a, b) => a.name.localeCompare(b.name));
  });

  roots.sort((a, b) => a.name.localeCompare(b.name));
  return roots;
};

