import { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/seo/metadata'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/templates',
    '/pricing',
    '/about',
    '/contact',
    '/demo',
    '/auth/login',
    '/auth/signup'
  ]

  return routes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : route === '/templates' ? 0.9 : 0.8,
  }))
}