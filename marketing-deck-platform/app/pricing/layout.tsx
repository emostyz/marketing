import { Metadata } from 'next'
import { createPageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = createPageMetadata({
  title: 'Pricing Plans - AI Presentation Platform',
  description: 'Choose the perfect plan for your presentation needs. Free trial available. Create unlimited AI-powered presentations with professional templates.',
  path: '/pricing',
  keywords: [
    'pricing plans',
    'presentation software pricing',
    'AI presentation cost',
    'subscription plans',
    'free trial',
    'enterprise pricing'
  ]
})

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}