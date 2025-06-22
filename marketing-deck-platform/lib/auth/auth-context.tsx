'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

interface User {
  id: string
  email: string
  name: string
  avatar?: string
  subscription: 'free' | 'pro' | 'enterprise'
  demo?: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signInDemo: () => Promise<{ error?: string }>
  signInWithOAuth: (provider: 'google' | 'github') => Promise<{ error?: string }>
  signUp: (name: string, email: string, password: string, company?: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  updateProfile: (profileData: any) => Promise<{ error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for demo session
    const demoSession = localStorage.getItem('demo-session')
    if (demoSession) {
      try {
        const demoData = JSON.parse(demoSession)
        if (demoData.expiresAt && new Date(demoData.expiresAt) > new Date()) {
          setUser({
            id: 'demo-user',
            email: 'demo@aedrin.com',
            name: 'Demo User',
            subscription: 'pro',
            demo: true
          })
          setLoading(false)
          return
        } else {
          // Demo expired, clear it
          localStorage.removeItem('demo-session')
        }
      } catch (error) {
        localStorage.removeItem('demo-session')
      }
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          setLoading(false)
          return
        }

        if (session?.user) {
          await fetchUserProfile(session.user)
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        if (event === 'SIGNED_IN' && session?.user) {
          await fetchUserProfile(session.user)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (authUser: any) => {
    try {
      // Set user with basic info first to ensure login works
      const basicUser = {
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.full_name || authUser.email,
        subscription: 'free' as const
      }
      
      setUser(basicUser)
      setLoading(false)
      
      // Try to fetch profile details (but don't block login if it fails)
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (!error && profile) {
          setUser({
            ...basicUser,
            name: profile.name || profile.full_name || basicUser.name,
            subscription: profile.subscription_tier || 'free'
          })
        }
      } catch (profileError) {
        console.error('Profile fetch failed (non-blocking):', profileError)
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error)
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { error: error.message }
      }

      if (data.user) {
        // Fetch user profile and update state
        await fetchUserProfile(data.user)
        
        // Force a router refresh and redirect
        router.refresh()
        router.push('/dashboard')
      }

      return {}
    } catch (error) {
      console.error('Sign in error:', error)
      return { error: 'An unexpected error occurred' }
    }
  }

  const signInDemo = async () => {
    try {
      const response = await fetch('/api/auth/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ demo: true })
      })

      const data = await response.json()

      if (!data.success) {
        return { error: data.error || 'Failed to start demo' }
      }

      // Store demo session
      const demoSession = {
        active: true,
        expiresAt: data.demo.expiresAt,
        features: data.demo.features
      }
      localStorage.setItem('demo-session', JSON.stringify(demoSession))

      // Set demo user
      setUser({
        id: 'demo-user',
        email: 'demo@aedrin.com',
        name: 'Demo User',
        subscription: 'pro',
        demo: true
      })

      // Force router refresh and redirect
      router.refresh()
      router.push('/dashboard')
      return {}
    } catch (error) {
      console.error('Demo sign in error:', error)
      return { error: 'Failed to start demo mode' }
    }
  }

  const signInWithOAuth = async (provider: 'google' | 'github') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (error) {
      console.error('OAuth sign in error:', error)
      return { error: 'An unexpected error occurred' }
    }
  }

  const signUp = async (name: string, email: string, password: string, company?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            company_name: company
          }
        }
      })

      if (error) {
        return { error: error.message }
      }

      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            email: data.user.email,
            full_name: name,
            company_name: company
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
        }
      }

      return {}
    } catch (error) {
      console.error('Sign up error:', error)
      return { error: 'An unexpected error occurred' }
    }
  }

  const signOut = async () => {
    try {
      // Clear demo session if exists
      localStorage.removeItem('demo-session')
      
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
      }
      
      setUser(null)
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const updateProfile = async (profileData: any) => {
    try {
      const response = await fetch('/api/user/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData)
      })

      const data = await response.json()

      if (!data.success) {
        return { error: data.error || 'Failed to update profile' }
      }

      // Update local user state
      if (data.user && user) {
        setUser({
          ...user,
          name: data.user.name,
          avatar: data.user.avatar
        })
      }

      return {}
    } catch (error) {
      console.error('Update profile error:', error)
      return { error: 'Failed to update profile' }
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