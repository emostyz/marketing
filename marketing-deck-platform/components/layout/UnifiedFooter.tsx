'use client'

import Link from 'next/link'
import { Brain } from 'lucide-react'

interface UnifiedFooterProps {
  isAuthenticated?: boolean
  className?: string
}

export default function UnifiedFooter({ 
  isAuthenticated = false,
  className = '' 
}: UnifiedFooterProps) {
  const currentYear = new Date().getFullYear()

  const getFooterLinks = () => {
    const baseLinks = {
      product: [
        { name: 'Features', href: '/#features' },
        { name: 'Pricing', href: '/pricing' },
        { name: 'Demo', href: '/demo' },
        { name: 'Enterprise', href: '/enterprise' }
      ],
      company: [
        { name: 'About', href: '/about' },
        { name: 'Contact', href: '/contact' },
        { name: 'Careers', href: '/careers' },
        { name: 'Press', href: '/press' }
      ],
      support: [
        { name: 'Help Center', href: '/help' },
        { name: 'Documentation', href: '/docs' },
        { name: 'API', href: '/api' },
        { name: 'Status', href: '/status' }
      ],
      legal: [
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Security', href: '/security' }
      ]
    }

    if (isAuthenticated) {
      // Add authenticated user specific links
      baseLinks.product.push({ name: 'Dashboard', href: '/dashboard' })
      baseLinks.support.push({ name: 'Account Settings', href: '/settings' })
    }

    return baseLinks
  }

  const footerLinks = getFooterLinks()

  return (
    <footer className={`px-6 py-12 bg-gray-900 border-t border-gray-800 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Brain className="w-6 h-6 text-blue-500" />
              <span className="text-xl font-bold text-white">AEDRIN</span>
            </div>
            <p className="text-gray-400">
              AI-powered presentation platform for modern businesses. Transform your data into stunning presentations in minutes.
            </p>
            {isAuthenticated && (
              <div className="mt-4 pt-4 border-t border-gray-800">
                <p className="text-sm text-gray-500">
                  Welcome back! Create amazing presentations with your data.
                </p>
              </div>
            )}
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-gray-400">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-gray-400">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} AEDRIN. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              {isAuthenticated && (
                <Link
                  href="/admin/login"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Admin
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}