"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Brain, Menu, X, BarChart3, Upload, Settings } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'

interface PublicNavigationProps {
  showComingSoonBar?: boolean
  onComingSoonBarClose?: () => void
}

export default function PublicNavigation({ 
  showComingSoonBar = false, 
  onComingSoonBarClose 
}: PublicNavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, signInDemo } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  // Navigation items for signed-in users (not demo)
  const userNavigationItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'My Files', href: '/files' },
    { name: 'Create Deck', href: '/deck-builder/new' },
    { name: 'Datasets', href: '/datasets' },
    { name: 'Templates', href: '/templates' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Contact', href: '/contact' }
  ]

  // Navigation items for demo users
  const demoNavigationItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Templates', href: '/templates' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Contact', href: '/contact' }
  ]

  // Navigation items for logged out users
  const publicNavigationItems = [
    { name: 'Home', href: '/' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Create Deck', href: '/deck-builder/new' },
    { name: 'Datasets', href: '/datasets' },
    { name: 'Templates', href: '/templates' },
    { name: 'AI Insights', href: '/ai-insights' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Contact', href: '/contact' },
  ]

  // Determine which navigation items to use
  let navigationItems = publicNavigationItems
  let showProfile = false
  let showDemoButton = false
  if (user) {
    if (user.demo) {
      navigationItems = demoNavigationItems
      showProfile = false
      showDemoButton = false
    } else {
      navigationItems = userNavigationItems
      showProfile = true
      showDemoButton = false
    }
  } else {
    navigationItems = publicNavigationItems
    showProfile = false
    showDemoButton = true
  }

  const isActivePage = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    if (href.includes('#')) {
      const basePath = href.split('#')[0]
      // For anchor links, only show as active if we're on the homepage and the anchor is visible
      // For now, let's not show anchor links as active by default
      return false
    }
    return pathname === href
  }

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false)
    
    // Handle anchor links
    if (href.includes('#')) {
      const [basePath, anchor] = href.split('#')
      if (basePath === '/' && pathname !== '/') {
        // Navigate to homepage first, then scroll to anchor
        router.push('/')
        setTimeout(() => {
          const element = document.getElementById(anchor)
          element?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      } else if (pathname === '/') {
        // Already on homepage, just scroll
        const element = document.getElementById(anchor)
        element?.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      router.push(href)
    }
  }

  return (
    <>
      {/* Coming Soon Bar */}
      {showComingSoonBar && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 relative">
          <div className="max-w-7xl mx-auto flex items-center justify-center h-10">
            <span className="font-medium text-center w-full flex items-center justify-center">
              🚀 AEDRIN is launching soon! Join our early access program and be among the first to experience AI-powered presentations.
            </span>
            {onComingSoonBarClose && (
              <button
                onClick={onComingSoonBarClose}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded transition-colors"
                aria-label="Close announcement"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4 bg-gray-950/80 backdrop-blur-sm border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Brain className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold text-white">AEDRIN</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {/* Always show Home button if not on homepage */}
            {pathname !== '/' && (
              <Link
                key="Home"
                href="/"
                className="transition-colors hover:text-white text-gray-300"
              >
                Home
              </Link>
            )}
            
            {/* Render nav items */}
            {user ? (
              navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`transition-colors hover:text-white ${
                    isActivePage(item.href)
                      ? 'text-blue-400 font-medium'
                      : 'text-gray-300'
                  }`}
                >
                  {item.name}
                </Link>
              ))
            ) : (
              <>
                {publicNavigationItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`transition-colors hover:text-white ${
                      isActivePage(item.href)
                        ? 'text-blue-400 font-medium'
                        : 'text-gray-300'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                <Link
                  href="/auth/login"
                  className="transition-colors hover:text-white text-gray-300"
                >
                  Login
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-6 py-2 transition-colors">
                    🚀 Get Started
                  </Button>
                </Link>
              </>
            )}
            
            {/* Auth Links */}
            {showProfile && (
              <div className="flex items-center space-x-4">
                <Link href="/settings">
                  <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                    Profile
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-300 hover:text-white transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 shadow-xl">
            <div className="px-6 py-4 space-y-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block w-full text-left py-2 transition-colors hover:text-white ${
                    isActivePage(item.href)
                      ? 'text-blue-400 font-medium'
                      : 'text-gray-300'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="border-t border-gray-800 pt-4 space-y-3">
                {showProfile ? (
                  <>
                    <Link href="/settings" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-800">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Button>
                    </Link>
                    <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        Profile
                      </Button>
                    </Link>
                  </>
                ) : !user && (
                  <>
                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-800">
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-6 py-2 transition-colors">
                        🚀 Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}