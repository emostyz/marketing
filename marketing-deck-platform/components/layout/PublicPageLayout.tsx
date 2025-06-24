"use client"

import { ReactNode, useState } from 'react'
import PublicNavigation from '@/components/navigation/PublicNavigation'
import PublicFooter from '@/components/navigation/PublicFooter'

interface PublicPageLayoutProps {
  children: ReactNode
  showComingSoonBar?: boolean
  className?: string
}

export default function PublicPageLayout({ 
  children, 
  showComingSoonBar = false,
  className = "min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"
}: PublicPageLayoutProps) {
  const [showBanner, setShowBanner] = useState(showComingSoonBar)

  return (
    <div className={className}>
      <PublicNavigation 
        showComingSoonBar={showBanner}
        onComingSoonBarClose={() => setShowBanner(false)}
      />
      <main>
        {children}
      </main>
      <PublicFooter />
    </div>
  )
}