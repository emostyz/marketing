import { Metadata } from 'next'

// Base site configuration
export const siteConfig = {
  name: 'EasyDecks.ai',
  title: 'EasyDecks.ai - AI-Powered Marketing Deck Platform',
  description: 'Transform your data into compelling presentations with AI. Upload business data and generate professional, insight-driven marketing decks automatically.',
  url: 'https://easydecks.ai',
  ogImage: '/og-image.png',
  twitterCard: 'summary_large_image',
  twitterCreator: '@easydecksai',
  keywords: [
    'AI presentations',
    'marketing decks',
    'data visualization',
    'business intelligence',
    'automated slideshows',
    'presentation maker',
    'AI-powered insights',
    'business presentations',
    'data storytelling',
    'executive dashboards',
    'PowerPoint alternative',
    'slide generator',
    'business analytics',
    'marketing automation',
    'presentation templates'
  ]
}

// Default metadata for the site
export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [
    {
      name: 'EasyDecks.ai Team',
      url: siteConfig.url
    }
  ],
  creator: 'EasyDecks.ai',
  publisher: 'EasyDecks.ai',
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - AI-Powered Marketing Deck Platform`
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: siteConfig.twitterCreator
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code'
  }
}

// Page-specific metadata generators
export const createPageMetadata = (options: {
  title: string
  description: string
  path: string
  keywords?: string[]
  ogImage?: string
  noIndex?: boolean
}): Metadata => ({
  title: options.title,
  description: options.description,
  keywords: [...siteConfig.keywords, ...(options.keywords || [])],
  alternates: {
    canonical: `${siteConfig.url}${options.path}`
  },
  openGraph: {
    title: options.title,
    description: options.description,
    url: `${siteConfig.url}${options.path}`,
    images: [
      {
        url: options.ogImage || siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: options.title
      }
    ]
  },
  twitter: {
    title: options.title,
    description: options.description,
    images: [options.ogImage || siteConfig.ogImage]
  },
  robots: {
    index: !options.noIndex,
    follow: !options.noIndex
  }
})

// Structured data generators
export const createOrganizationStructuredData = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteConfig.name,
  url: siteConfig.url,
  logo: `${siteConfig.url}/logo.png`,
  description: siteConfig.description,
  sameAs: [
    'https://twitter.com/easydecksai',
    'https://linkedin.com/company/easydecksai'
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: ['English']
  }
})

export const createSoftwareApplicationStructuredData = () => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: siteConfig.name,
  operatingSystem: 'Web Browser',
  applicationCategory: 'BusinessApplication',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD'
  },
  description: siteConfig.description,
  url: siteConfig.url,
  screenshot: `${siteConfig.url}/screenshot.png`,
  featureList: [
    'AI-powered data analysis',
    'Automated slide generation',
    'Professional templates',
    'Real-time collaboration',
    'Export to multiple formats'
  ]
})

export const createBreadcrumbStructuredData = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url
  }))
})