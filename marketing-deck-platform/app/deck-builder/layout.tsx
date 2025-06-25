import { Metadata } from 'next'
import { createPageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = createPageMetadata({
  title: 'AI Deck Builder - Create Presentations Automatically',
  description: 'Build professional presentations powered by AI. Upload your data and let our intelligent system create compelling slides with insights and visualizations.',
  path: '/deck-builder',
  keywords: [
    'AI deck builder',
    'automated presentations',
    'AI slide generator',
    'smart presentations',
    'business intelligence',
    'data-driven slides',
    'presentation automation'
  ],
  noIndex: false
})

export default function DeckBuilderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}