/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    ppr: true,
    nodeMiddleware: true,
    clientSegmentCache: true
  },
  webpack: (config, { isServer }) => {
    // Fix for pptxgenjs in client-side builds
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        stream: false,
        crypto: false,
        'node:fs': false,
        'node:fs/promises': false,
        'node:https': false,
        'node:http': false,
        'node:path': false,
        'node:crypto': false,
        'node:stream': false,
        'node:util': false,
        'node:zlib': false
      }
    }
    
    return config
  }
}

module.exports = nextConfig