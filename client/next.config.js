/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "images.unsplash.com",
      "nvzstnsvqpnjlbutomny.supabase.co", // ✅ Supabase storage
      "fiver-21iw.onrender.com", // ✅ Add your Render backend
    ],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8747",
      },
      {
        protocol: "https",
        hostname: "nvzstnsvqpnjlbutomny.supabase.co", // ✅ Supabase bucket
      },
      {
        protocol: "https",
        hostname: "fiver-21iw.onrender.com", // ✅ Allow images from your Render backend
        pathname: "/uploads/profiles/**", // ✅ Make sure this matches your image path
      },
    ],
  },
};

module.exports = nextConfig;
