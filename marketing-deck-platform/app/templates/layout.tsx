import { Metadata } from 'next'
import { createPageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = createPageMetadata({
  title: 'Professional Presentation Templates - AEDRIN',
  description: 'Choose from our collection of professionally designed presentation templates. Beautiful templates for every business story, from executive dashboards to startup pitches.',
  path: '/templates',
  keywords: [
    'presentation templates',
    'business templates',
    'PowerPoint templates',
    'executive templates',
    'marketing templates',
    'professional slides',
    'template library',
    'slide designs'
  ]
})

export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}