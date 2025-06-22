import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    ppr: true,
    clientSegmentCache: true,
    nodeMiddleware: true
  },
  turbopack: {
    resolveAlias: {
      // Fix for pptxgenjs and other Node.js modules in client-side builds
      // Note: Turbopack handles Node.js polyfills differently than webpack
      // For now, we'll let it handle these modules automatically
    }
  }
};

export default nextConfig;
