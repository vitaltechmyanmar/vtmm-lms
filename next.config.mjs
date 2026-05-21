/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Disable static generation for these paths
  experimental: {
    isrMemoryCacheSize: 0,
  },
  // Skip static generation for auth and dynamic routes
  skipTrailingSlashRedirect: true,
}

export default nextConfig
