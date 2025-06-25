'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Brain, Menu, X, Settings, User, LogOut, Bell, 
  BarChart3, Upload, FileText, Users, Crown
} from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'

interface UnifiedNavigationProps {
  showComingSoonBar?: boolean
  isAuthenticated?: boolean
  user?: any
}

export default function UnifiedNavigation({ 
  showComingSoonBar = false,
  isAuthenticated = false,
  user
}: UnifiedNavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showComingSoon, setShowComingSoon] = useState(showComingSoonBar)
  const { signOut, signInDemo } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  // Navigation items based on authentication status
  const getNavigationItems = () => {
    if (!isAuthenticated) {
      // Public navigation for logged out users
      return [
        { name: 'Dashboard', href: '/dashboard', current: pathname.startsWith('/dashboard') },
        { name: 'Create Deck', href: '/deck-builder/new', current: pathname.startsWith('/deck-builder') },
        { name: 'Templates', href: '/templates', current: pathname.startsWith('/templates') },
        { name: 'Pricing', href: '/pricing', current: pathname === '/pricing' },
        { name: 'Contact', href: '/contact', current: pathname === '/contact' }
      ]
    }

    if (user?.demo) {
      // Demo user navigation
      return [
        { name: 'Dashboard', href: '/dashboard', current: pathname.startsWith('/dashboard') },
        { name: 'Create Deck', href: '/deck-builder/new', current: pathname.startsWith('/deck-builder') },
        { name: 'Templates', href: '/templates', current: pathname.startsWith('/templates') },
        { name: 'Pricing', href: '/pricing', current: pathname === '/pricing' },
        { name: 'Contact', href: '/contact', current: pathname === '/contact' }
      ]
    }

    // Authenticated user navigation
    return [
      { name: 'Dashboard', href: '/dashboard', current: pathname.startsWith('/dashboard') },
      { name: 'Create Deck', href: '/deck-builder/new', current: pathname.startsWith('/deck-builder') },
      { name: 'My Files', href: '/files', current: pathname.startsWith('/files') },
      { name: 'Templates', href: '/templates', current: pathname.startsWith('/templates') },
      { name: 'Pricing', href: '/pricing', current: pathname === '/pricing' },
      { name: 'Contact', href: '/contact', current: pathname === '/contact' }
    ]
  }

  const navigationItems = getNavigationItems()

  const handleDemoClick = async () => {
    try {
      await signInDemo()
    } catch (error) {
      console.error('Demo sign in failed:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  return (
    <>
      {/* Coming Soon Bar */}
      {showComingSoon && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 relative">
          <div className="max-w-7xl mx-auto flex items-center justify-center h-10">
            <span className="font-medium text-center w-full flex items-center justify-center">
              🚀 AEDRIN is launching soon! Join our early access program and be among the first to experience AI-powered presentations.
            </span>
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded transition-colors"
              onClick={() => setShowComingSoon(false)}
              aria-label="Close announcement"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="relative z-50 px-6 py-4 bg-gray-950 border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Brain className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold text-white">AEDRIN</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`transition-colors hover:text-white cursor-pointer ${
                  item.current ? 'text-blue-400 font-medium' : 'text-gray-300'
                }`}
              >
                {item.name}
              </Link>
            ))}

            {/* Authentication Section */}
            {!isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link href="/auth/login" className="transition-colors hover:text-white text-gray-300 cursor-pointer">
                  Login
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-6 py-2 transition-colors">
                    🚀 Get Started
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                {/* User Menu */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors cursor-pointer">
                    <User className="w-5 h-5" />
                    <span>{user?.name || user?.email}</span>
                    {user?.demo && <Crown className="w-4 h-4 text-yellow-500" />}
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60]">
                    <div className="py-1">
                      <Link
                        href="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Account Settings
                      </Link>
                      <Link
                        href="/settings/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                      <Link
                        href="/settings/notifications"
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                      >
                        <Bell className="w-4 h-4 mr-2" />
                        Notifications
                      </Link>
                      <div className="border-t border-gray-700 my-1"></div>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              className="text-gray-300 hover:text-white transition-colors cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-gray-950 border-b border-gray-800 z-[55]">
            <div className="px-6 py-4 space-y-3">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block py-2 transition-colors hover:text-white ${
                    item.current ? 'text-blue-400 font-medium' : 'text-gray-300'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {!isAuthenticated ? (
                <div className="pt-4 space-y-3">
                  <Link
                    href="/auth/login"
                    className="block py-2 text-gray-300 hover:text-white transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white">
                      🚀 Get Started
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="pt-4 space-y-3 border-t border-gray-700">
                  <div className="text-gray-400 text-sm">
                    {user?.name || user?.email}
                    {user?.demo && <span className="ml-2 text-yellow-500">Demo</span>}
                  </div>
                  <Link
                    href="/settings"
                    className="block py-2 text-gray-300 hover:text-white transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Account Settings
                  </Link>
                  <Link
                    href="/settings/profile"
                    className="block py-2 text-gray-300 hover:text-white transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut()
                      setMobileMenuOpen(false)
                    }}
                    className="block w-full text-left py-2 text-gray-300 hover:text-white transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  )
}