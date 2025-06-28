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
  // Add a delay to prevent immediate redirects during navigation
  if (requireAuth && !loading && !user) {
    if (typeof window !== 'undefined') {
      // Only redirect after a short delay to allow auth to complete
      setTimeout(() => {
        const currentPath = window.location.pathname
        const loginUrl = `/auth/login?redirect=${encodeURIComponent(currentPath)}`
        console.log('🚪 Redirecting to login from UnifiedLayout:', currentPath)
        window.location.href = loginUrl
      }, 1000) // 1 second delay
    }
    
    // Show loading state instead of redirecting immediately
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="animate-pulse w-8 h-8 bg-blue-500 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex flex-col bg-gray-950 text-white ${className}`}>
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