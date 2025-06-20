'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/Button'
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  Crown,
  Shield,
  Brain,
  Presentation
} from 'lucide-react'

export function UserHeader() {
  const { user, profile, signOut } = useAuth()
  const router = useRouter()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    setShowDropdown(false)
  }

  const getSubscriptionIcon = (status: string) => {
    const icons = {
      free: User,
      pro: Crown,
      enterprise: Shield
    }
    return icons[status as keyof typeof icons] || User
  }

  const getSubscriptionColor = (status: string) => {
    const colors = {
      free: 'text-gray-400',
      pro: 'text-blue-400',
      enterprise: 'text-purple-400'
    }
    return colors[status as keyof typeof colors] || 'text-gray-400'
  }

  if (!user || !profile) {
    return (
      <div className="flex items-center gap-3">
        <Button 
          onClick={() => router.push('/auth/login')}
          variant="outline"
          size="sm"
        >
          Sign In
        </Button>
        <Button 
          onClick={() => router.push('/auth/signup')}
          className="bg-blue-600 hover:bg-blue-700"
          size="sm"
        >
          Sign Up
        </Button>
      </div>
    )
  }

  const SubscriptionIcon = getSubscriptionIcon(profile.subscription_status)

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
      >
        {/* Profile Picture */}
        <img
          src={profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.full_name || 'User')}`}
          alt={profile.full_name || 'Profile'}
          className="w-10 h-10 rounded-full border-2 border-gray-600"
        />
        
        {/* User Info */}
        <div className="text-left hidden md:block">
          <div className="flex items-center gap-2">
            <span className="text-white font-medium text-sm">
              {profile.full_name || 'User'}
            </span>
            <SubscriptionIcon className={`w-3 h-3 ${getSubscriptionColor(profile.subscription_status)}`} />
          </div>
          <div className="text-gray-400 text-xs">
            {profile.company || profile.email}
          </div>
        </div>
        
        <ChevronDown 
          className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
          {/* User Info Header */}
          <div className="p-4 border-b border-gray-700 bg-gray-900/50">
            <div className="flex items-center gap-3">
              <img
                src={profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.full_name || 'User')}`}
                alt={profile.full_name || 'Profile'}
                className="w-12 h-12 rounded-full border-2 border-gray-600"
              />
              <div className="flex-1">
                <h4 className="text-white font-medium">{profile.full_name || 'User'}</h4>
                <p className="text-gray-400 text-sm">{profile.email}</p>
                <div className="flex items-center gap-1 mt-1">
                  <SubscriptionIcon className={`w-3 h-3 ${getSubscriptionColor(profile.subscription_status)}`} />
                  <span className="text-xs text-gray-400 capitalize">
                    {profile.subscription_status} Plan
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => {
                router.push('/profile')
                setShowDropdown(false)
              }}
              className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 transition-colors flex items-center gap-3"
            >
              <User className="w-4 h-4" />
              <div>
                <div className="text-sm">View Profile</div>
                <div className="text-xs text-gray-400">See your activity and stats</div>
              </div>
            </button>

            <button
              onClick={() => {
                router.push('/settings')
                setShowDropdown(false)
              }}
              className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 transition-colors flex items-center gap-3"
            >
              <Settings className="w-4 h-4" />
              <div>
                <div className="text-sm">Account Settings</div>
                <div className="text-xs text-gray-400">Manage your preferences</div>
              </div>
            </button>

            <button
              onClick={() => {
                router.push('/dashboard')
                setShowDropdown(false)
              }}
              className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 transition-colors flex items-center gap-3"
            >
              <Presentation className="w-4 h-4" />
              <div>
                <div className="text-sm">Dashboard</div>
                <div className="text-xs text-gray-400">Your presentations</div>
              </div>
            </button>

            <button
              onClick={() => {
                router.push('/editor/new')
                setShowDropdown(false)
              }}
              className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 transition-colors flex items-center gap-3"
            >
              <Brain className="w-4 h-4" />
              <div>
                <div className="text-sm">New Analysis</div>
                <div className="text-xs text-gray-400">Create presentation</div>
              </div>
            </button>
          </div>

          {/* Sign Out */}
          <div className="border-t border-gray-700 py-2">
            <button
              onClick={handleSignOut}
              className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-700 transition-colors flex items-center gap-3"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}