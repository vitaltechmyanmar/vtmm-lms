/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  skipTrailingSlashRedirect: true,
  transpilePackages: ['@mui/material', '@mui/icons-material', '@mui/system', '@emotion/react', '@emotion/styled'],
}

export default nextConfig
