/**
 * Custom Cloudinary Loader para Next.js
 *
 * Delega la optimización de imágenes a Cloudinary CDN.
 * Cloudinary aplica automáticamente:
 *  - f_auto: Mejor formato para el navegador (WebP, AVIF, etc.)
 *  - q_auto: Calidad óptima sin pérdida visual perceptible
 *  - c_limit: Redimensiona sin ampliar (nunca hace upscale)
 *  - w_{width}: Ancho exacto que Next.js indica según el viewport
 *
 * IMPORTANTE: Usamos NEXT_PUBLIC_ para que la variable esté disponible
 * tanto en el servidor como en el cliente (browser). Las variables sin
 * ese prefijo son undefined en el cliente → causa hydration mismatch.
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_NAME;

export default function cloudinaryLoader({ src, width, quality }) {
  const q = quality || "auto";

  // ── Caso 1: imágenes locales (/, /images/, blob:, data:) ─────────────────
  // El loader no puede transformar imágenes estáticas locales con Cloudinary.
  // Las devolvemos tal cual para que Next.js las sirva normalmente.
  if (
    !src ||
    src.startsWith("/") ||
    src.startsWith("blob:") ||
    src.startsWith("data:")
  ) {
    return src;
  }

  // ── Caso 2: URL completa de Cloudinary ────────────────────────────────────
  // Extraemos el public_id limpio y re-aplicamos las transformaciones correctas.
  if (src.startsWith("https://res.cloudinary.com/")) {
    const uploadIndex = src.indexOf("/upload/");
    if (uploadIndex !== -1) {
      const rawPath = src.slice(uploadIndex + "/upload/".length);
      // Quita versiones (v1234567/) y transformaciones previas embebidas
      const cleanPath = rawPath.replace(/^(v\d+\/|[a-z_,]+\/)*/, "");
      const params = `f_auto,c_limit,w_${width},q_${q}`;
      return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${params}/${cleanPath}`;
    }
  }

  // ── Caso 3: public_id directo (sin dominio) ───────────────────────────────
  const params = `f_auto,c_limit,w_${width},q_${q}`;
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${params}/${src}`;
}
