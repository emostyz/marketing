'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/enhanced-client'
import OAuthManager from './oauth-config'

interface User {
  id: number
  email: string
  name: string
  avatar?: string
  subscription: 'free' | 'pro' | 'enterprise'
  createdAt: Date
  lastLoginAt: Date
  profile?: any
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signInDemo: () => Promise<{ error?: string }>
  signInWithOAuth: (provider: 'google' | 'github' | 'microsoft') => Promise<{ error?: string }>
  signUp: (name: string, email: string, password: string, company?: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  updateProfile: (profileData: any) => Promise<{ error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true)
        
        // Get current session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          setLoading(false)
          return
        }

        if (session?.user) {
          // Get enhanced user profile
          const enhancedUser = await OAuthManager.getCurrentUser()
          if (enhancedUser) {
            setUser(enhancedUser)
          }
        }

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event, session?.user?.email)
            
            if (event === 'SIGNED_IN' && session?.user) {
              const enhancedUser = await OAuthManager.getCurrentUser()
              if (enhancedUser) {
                setUser(enhancedUser)
              }
            } else if (event === 'SIGNED_OUT') {
              setUser(null)
              router.push('/auth/login')
            } else if (event === 'TOKEN_REFRESHED' && session?.user) {
              const enhancedUser = await OAuthManager.getCurrentUser()
              if (enhancedUser) {
                setUser(enhancedUser)
              }
            }
          }
        )

        setLoading(false)
        
        return () => subscription.unsubscribe()
      } catch (error) {
        console.error('Error initializing auth:', error)
        setLoading(false)
      }
    }

    initializeAuth()
  }, [router])

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.user)
        return {}
      } else {
        return { error: data.error || 'Login failed' }
      }
    } catch (error) {
      console.error('Sign in error:', error)
      return { error: 'Network error occurred' }
    }
  }

  const signInDemo = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ demo: true })
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.user)
        return {}
      } else {
        return { error: data.error || 'Demo login failed' }
      }
    } catch (error) {
      console.error('Demo sign in error:', error)
      return { error: 'Network error occurred' }
    }
  }

  const signInWithOAuth = async (provider: 'google' | 'github' | 'microsoft') => {
    try {
      await OAuthManager.signInWithProvider(provider)
      return {}
    } catch (error: any) {
      console.error('OAuth sign in error:', error)
      return { error: error.message || 'OAuth login failed' }
    }
  }

  const signUp = async (name: string, email: string, password: string, company?: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, company })
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.user)
        return {}
      } else {
        return { error: data.error || 'Registration failed' }
      }
    } catch (error) {
      console.error('Sign up error:', error)
      return { error: 'Network error occurred' }
    }
  }

  const signOut = async () => {
    try {
      await OAuthManager.signOut()
      setUser(null)
      router.push('/auth/login')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const updateProfile = async (profileData: any) => {
    try {
      const updatedUser = await OAuthManager.updateUserProfile(profileData)
      if (updatedUser) {
        setUser(updatedUser)
        return {}
      } else {
        return { error: 'Failed to update profile' }
      }
    } catch (error: any) {
      console.error('Update profile error:', error)
      return { error: error.message || 'Failed to update profile' }
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signInDemo,
    signInWithOAuth,
    signUp,
    signOut,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}