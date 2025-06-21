/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'api.flux.ai', 'cdn.flux.ai'],
  },
  env: {
    FLUX_API_URL: process.env.FLUX_API_URL || 'https://api.flux.ai/v1',
  },
  // Enable standalone output for Docker
  output: 'standalone',
  // Experimental features for better performance
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
}

module.exports = nextConfig 