/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'api.flux.ai', 'cdn.flux.ai'],
  },
  env: {
    FLUX_API_URL: process.env.FLUX_API_URL || 'https://api.flux.ai/v1',
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