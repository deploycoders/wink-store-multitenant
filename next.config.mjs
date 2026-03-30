/** @type {import('next').NextConfig} */
const nextConfig = {
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
