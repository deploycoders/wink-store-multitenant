// Centralized Cloudinary folder conventions for this project.
// Goal: keep assets organized per tenant and per feature area.
//
// Example:
//   ecommerce-multitenant/tenants/shop-style/products/chaqueta-puma/...
//   ecommerce-multitenant/tenants/shop-style/site/hero/...
//   ecommerce-multitenant/tenants/shop-style/catalog/categories/...

export const CLOUDINARY_ROOT_FOLDER =
  process.env.NEXT_PUBLIC_CLOUDINARY_ROOT_FOLDER || "ecommerce-multitenant";

export function slugifyCloudinarySegment(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/[áàäâã]/g, "a")
    .replace(/[éèëê]/g, "e")
    .replace(/[íìïî]/g, "i")
    .replace(/[óòöôõ]/g, "o")
    .replace(/[úùüû]/g, "u")
    .replace(/[ñ]/g, "n")
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getTenantFolderSlug({ tenantSlug, tenantId } = {}) {
  const base = tenantSlug || (tenantId ? `tenant-${tenantId}` : "tenant-general");
  const safe = slugifyCloudinarySegment(base);
  return safe || "tenant-general";
}

export function buildTenantCloudinaryFolder({
  tenantSlug,
  tenantId,
  area,
  subpath,
} = {}) {
  const tenantFolder = getTenantFolderSlug({ tenantSlug, tenantId });
  const cleanArea = slugifyCloudinarySegment(area);
  const parts = [
    CLOUDINARY_ROOT_FOLDER,
    "tenants",
    tenantFolder,
    cleanArea || null,
    subpath ? String(subpath).replace(/^\/+|\/+$/g, "") : null,
  ].filter(Boolean);
  return parts.join("/");
}

