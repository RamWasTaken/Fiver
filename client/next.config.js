/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["images.unsplash.com", "nvzstnsvqpnjlbutomny.supabase.co"], // ✅ Add your Supabase domain here
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8747",
      },
      {
        protocol: "https",
        hostname: "nvzstnsvqpnjlbutomny.supabase.co", // ✅ Add your Supabase bucket URL
      },
    ],
  },
};

module.exports = nextConfig;
