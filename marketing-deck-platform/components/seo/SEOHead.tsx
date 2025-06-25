'use client'

import { useEffect } from 'react'
import { siteConfig } from '@/lib/seo/metadata'

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string[]
  ogImage?: string
  canonical?: string
  noIndex?: boolean
}

export default function SEOHead({
  title,
  description = siteConfig.description,
  keywords = [],
  ogImage = siteConfig.ogImage,
  canonical,
  noIndex = false
}: SEOHeadProps) {
  const fullTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.title
  const allKeywords = [...siteConfig.keywords, ...keywords].join(', ')
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${siteConfig.url}${ogImage}`

  useEffect(() => {
    // Update document title
    document.title = fullTitle
    
    // Update meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`
      let meta = document.querySelector(selector) as HTMLMetaElement
      if (!meta) {
        meta = document.createElement('meta')
        if (property) {
          meta.setAttribute('property', name)
        } else {
          meta.setAttribute('name', name)
        }
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', content)
    }

    // Update basic meta tags
    updateMetaTag('description', description)
    updateMetaTag('keywords', allKeywords)
    updateMetaTag('author', siteConfig.name)
    
    // Update Open Graph tags
    updateMetaTag('og:title', fullTitle, true)
    updateMetaTag('og:description', description, true)
    updateMetaTag('og:image', fullOgImage, true)
    updateMetaTag('og:type', 'website', true)
    updateMetaTag('og:site_name', siteConfig.name, true)
    
    // Update Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image')
    updateMetaTag('twitter:title', fullTitle)
    updateMetaTag('twitter:description', description)
    updateMetaTag('twitter:image', fullOgImage)
    updateMetaTag('twitter:creator', siteConfig.twitterCreator)
    
    // Update canonical link
    if (canonical) {
      let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement
      if (!canonicalLink) {
        canonicalLink = document.createElement('link')
        canonicalLink.setAttribute('rel', 'canonical')
        document.head.appendChild(canonicalLink)
      }
      canonicalLink.setAttribute('href', canonical)
    }
    
    // Update robots meta tag
    if (noIndex) {
      updateMetaTag('robots', 'noindex,nofollow')
    }
  }, [fullTitle, description, allKeywords, fullOgImage, canonical, noIndex])

  return null // This component doesn't render anything
}