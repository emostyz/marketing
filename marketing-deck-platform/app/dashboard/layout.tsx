import { Metadata } from 'next'
import { createPageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = createPageMetadata({
  title: 'Dashboard - Manage Your Presentations',
  description: 'Access your presentation dashboard. View, edit, and manage all your AI-generated presentations in one place.',
  path: '/dashboard',
  keywords: [
    'presentation dashboard',
    'manage presentations',
    'presentation library',
    'slide management'
  ],
  noIndex: true // Private page
})

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}