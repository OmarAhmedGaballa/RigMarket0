/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    // Photos are uploaded through server actions (client compresses them first).
    serverActions: { bodySizeLimit: '5mb' },
  },
}

export default nextConfig
