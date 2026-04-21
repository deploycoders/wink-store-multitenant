/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permitir acceso desde móviles/IPs locales en desarrollo para HMR
  allowedDevOrigins: ["192.168.0.203", "10.2.0.2", "localhost:3000"],

  // Solucionar conflicto de Turbopack (Next.js 15/16)
  turbopack: {},

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rrlmzbtlmrbuzlmphty.supabase.co", // Tu host de Supabase
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com", // Si usas Cloudinary
      },
    ],
  },
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
