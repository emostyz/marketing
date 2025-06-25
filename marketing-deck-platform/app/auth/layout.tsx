import { Metadata } from 'next'
import { createPageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = createPageMetadata({
  title: 'Login & Sign Up - AEDRIN',
  description: 'Sign in to your AEDRIN account or create a new account to start building AI-powered presentations.',
  path: '/auth',
  keywords: [
    'login',
    'sign up',
    'account',
    'authentication'
  ],
  noIndex: true // Auth pages don't need indexing
})

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}