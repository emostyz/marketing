'use client'

import React, { ReactNode } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import UnifiedNavigation from './UnifiedNavigation'
import UnifiedFooter from './UnifiedFooter'

interface UnifiedLayoutProps {
  children: ReactNode
  showComingSoonBar?: boolean
  className?: string
  requireAuth?: boolean
  hideNav?: boolean
  hideFooter?: boolean
}

export default function UnifiedLayout({
  children,
  showComingSoonBar = false,
  className = '',
  requireAuth = false,
  hideNav = false,
  hideFooter = false
}: UnifiedLayoutProps) {
  const { user, loading } = useAuth()

  // Show loading state for pages that require auth
  if (requireAuth && loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if auth is required but user is not authenticated
  if (requireAuth && !loading && !user) {
    if (typeof window !== 'undefined') {
      // Use a more gentle redirect to avoid interfering with navigation
      const currentPath = window.location.pathname
      const loginUrl = `/auth/login?redirect=${encodeURIComponent(currentPath)}`
      window.location.href = loginUrl
    }
    return null
  }

  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      {!hideNav && (
        <UnifiedNavigation 
          showComingSoonBar={showComingSoonBar}
          isAuthenticated={!!user}
          user={user}
        />
      )}
      
      <main className="flex-1">
        {children}
      </main>
      
      {!hideFooter && (
        <UnifiedFooter isAuthenticated={!!user} />
      )}
    </div>
  )
}