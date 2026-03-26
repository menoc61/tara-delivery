/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",          // needed for Docker multi-stage
  transpilePackages: ["@tara/types", "@tara/zod-schemas"],
  images: {
    remotePatterns: [
      { hostname: "lh3.googleusercontent.com" },
      { hostname: "firebasestorage.googleapis.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
};

module.exports = nextConfig;
