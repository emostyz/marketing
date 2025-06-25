import { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/seo/metadata'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/templates',
          '/pricing',
          '/about',
          '/contact',
          '/demo'
        ],
        disallow: [
          '/dashboard/',
          '/admin/',
          '/api/',
          '/auth/',
          '/deck-builder/',
          '/editor/',
          '/internal-test/',
          '/test-*'
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  }
}