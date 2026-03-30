// lib/cloudinary.js
export const getOptimizedImage = (url) => {
  if (!url) return "";

  // Buscamos el punto donde Cloudinary permite insertar los parámetros
  // Normalmente después de "/upload/"
  const parts = url.split("/upload/");

  if (parts.length !== 2) return url; // Si no es URL de Cloudinary, devolver original

  const [baseUrl, imagePath] = parts;

  // f_auto: Formato automático (WebP/AVIF)
  // q_auto: Calidad automática
  // w_800: Limita el ancho a 800px (suficiente para la mayoría de pantallas)
  const params = "f_auto,q_auto,w_800";

  return `${baseUrl}/upload/${params}/${imagePath}`;
};
