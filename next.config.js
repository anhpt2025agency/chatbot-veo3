/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'api.bfl.ml', 'cdn.bfl.ai'],
  },
  // Enable standalone output for production deployment
  output: 'standalone',
  // Experimental features for better performance
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
  // Build configuration
  typescript: {
    // Allow production builds to complete even if there are type errors
    ignoreBuildErrors: false,
  },
  eslint: {
    // Allow production builds to complete even if there are lint errors
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig 