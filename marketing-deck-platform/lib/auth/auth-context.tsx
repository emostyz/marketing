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
  profile?: {
    company?: string
    industry?: string
    jobTitle?: string
    businessContext?: string
    targetAudience?: string
  } | null
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
  startSessionKeeper: () => void
  stopSessionKeeper: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Cache key for auth state
const USER_CACHE_KEY = 'easydecks-auth-state'
const DEMO_CACHE_KEY = 'easydecks-demo-session'

// Session refresh manager to prevent logout during long operations
class SessionKeeper {
  private refreshInterval: NodeJS.Timeout | null = null
  private isActive = false

  start() {
    if (this.isActive) return
    
    this.isActive = true
    console.log('🔄 Starting session keeper for long operations')
    
    // Refresh session every 15 seconds during active operations
    this.refreshInterval = setInterval(async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (session && !error) {
          // Refresh the session silently
          await supabase.auth.refreshSession()
          
          // Sync with server cookie
          await fetch('/api/auth/set-cookie', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ access_token: session.access_token })
          })
          
          console.log('🔄 Session refreshed during long operation')
        }
      } catch (error) {
        console.warn('⚠️ Session refresh failed during long operation:', error)
      }
    }, 15000) // Every 15 seconds
  }

  stop() {
    if (!this.isActive) return
    
    this.isActive = false
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
      this.refreshInterval = null
    }
    console.log('⏹️ Stopped session keeper')
  }
}

const sessionKeeper = new SessionKeeper()

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const router = useRouter()

  // Cache user state to localStorage
  const cacheUserState = (userData: User | null) => {
    try {
      if (userData) {
        const cacheData = {
          user: userData,
          timestamp: Date.now()
        }
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(cacheData))
        console.log('💾 Cached user state for:', userData.email)
      } else {
        localStorage.removeItem(USER_CACHE_KEY)
        console.log('🗑️ Cleared cached user state')
      }
    } catch (error) {
      console.error('❌ Error caching user state:', error)
    }
  }

  // Restore user state from cache
  const restoreUserState = (): User | null => {
    try {
      const cached = localStorage.getItem(USER_CACHE_KEY)
      if (cached) {
        const data = JSON.parse(cached)
        // Cache is valid for 2 minutes to prevent stale auth state
        if (data.user && data.timestamp && (Date.now() - data.timestamp) < 120000) {
          console.log('💾 Restored cached user state for:', data.user.email)
          return data.user
        } else {
          console.log('⏰ Cached user state expired, clearing...')
          localStorage.removeItem(USER_CACHE_KEY)
        }
      }
    } catch (error) {
      console.error('❌ Error restoring cached user state:', error)
      localStorage.removeItem(USER_CACHE_KEY)
    }
    return null
  }

  // Initialize auth state
  useEffect(() => {
    console.log('🔧 AuthProvider initializing...')
    
    // Safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      console.log('⏰ Auth initialization timeout - setting loading to false')
      setLoading(false)
      setInitialized(true)
    }, 5000) // 5 second timeout
    
    const initializeAuth = async () => {
      try {
        // Try to restore from cache but validate it first
        const cachedUser = restoreUserState()
        if (cachedUser) {
          console.log('💾 Found cached user state, will validate server-side session')
          // Don't set loading to false yet - wait for session validation
        }

        // Check for demo session
        const demoSession = localStorage.getItem(DEMO_CACHE_KEY)
        if (demoSession) {
          try {
            const demoData = JSON.parse(demoSession)
            if (demoData.expiresAt && new Date(demoData.expiresAt) > new Date()) {
              console.log('🎭 Demo session found and valid')
              const demoUser = {
                id: '00000000-0000-0000-0000-000000000001',
                email: 'demo@easydecks.ai',
                name: 'Demo User',
                subscription: 'pro' as const,
                demo: true
              }
              setUser(demoUser)
              cacheUserState(demoUser)
              setLoading(false)
              setInitialized(true)
              return
            } else {
              console.log('⏰ Demo session expired, clearing...')
              localStorage.removeItem(DEMO_CACHE_KEY)
            }
          } catch (error) {
            console.log('❌ Invalid demo session, clearing...')
            localStorage.removeItem(DEMO_CACHE_KEY)
          }
        }

        // Get current session from Supabase
        console.log('🔍 Getting current session from Supabase...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Error getting session:', error)
          // Still try to check for cached auth via API
        } else if (session?.user) {
          console.log('✅ Active session found for user:', session.user.email)
          
          // Sync session with server-side cookie IMMEDIATELY
          try {
            const cookieResponse = await fetch('/api/auth/set-cookie', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ access_token: session.access_token })
            })
            
            if (cookieResponse.ok) {
              console.log('🍪 Session synced with server cookie for persistence')
            } else {
              console.warn('⚠️ Failed to sync session cookie:', cookieResponse.status)
            }
          } catch (syncError) {
            console.warn('⚠️ Failed to sync session with server:', syncError)
          }
          
          await fetchAndSetUserProfile(session.user)
          setLoading(false)
          setInitialized(true)
          return
        }

        // Fallback: check /api/auth/check for SSR cookie session
        try {
          const resp = await fetch('/api/auth/check', {
            credentials: 'include'
          })
          if (resp.ok) {
            const { user: apiUser } = await resp.json()
            if (apiUser) {
              console.log('✅ Valid server session found via API check')
              setUser(apiUser)
              cacheUserState(apiUser)
              setLoading(false)
              setInitialized(true)
              return
            }
          }
          console.log('❌ No valid server session found')
        } catch (fetchError) {
          console.log('⚠️ Could not check auth API:', fetchError)
        }
        
        // No valid session found - but don't clear existing user state aggressively
        console.log('⚠️ No server session found - keeping current state')
        setLoading(false)
        setInitialized(true)
      } catch (error) {
        console.error('❌ Error in initializeAuth:', error)
        setLoading(false)
        setInitialized(true)
      } finally {
        clearTimeout(safetyTimeout)
      }
    }

    initializeAuth()

    // Set up auth state change listener
    console.log('👂 Setting up auth state change listener...')
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email)
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ User signed in via auth state change')
          
          // Set the auth cookie for SSR/middleware FIRST
          try {
            const cookieResponse = await fetch('/api/auth/set-cookie', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ access_token: session.access_token })
            })
            
            if (cookieResponse.ok) {
              console.log('🍪 Auth cookie set for SSR/middleware')
            }
          } catch (cookieError) {
            console.error('❌ Failed to set auth cookie:', cookieError)
          }
          
          // Then set user profile
          await fetchAndSetUserProfile(session.user)
          
          // Clear loading state
          setLoading(false)
          
          // Navigate to intended destination or dashboard
          console.log('🚀 Redirecting after successful login...')
          const urlParams = new URLSearchParams(window.location.search)
          const redirectTo = urlParams.get('redirect')
          
          if (redirectTo && redirectTo.startsWith('/')) {
            console.log('🔗 Redirecting to intended destination:', redirectTo)
            router.push(decodeURIComponent(redirectTo))
          } else {
            console.log('🏠 Redirecting to dashboard')
            router.push('/dashboard')
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('🚪 User signed out, clearing state...')
          setUser(null)
          cacheUserState(null)
          setLoading(false)
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('🔄 Token refreshed, updating state...')
          await fetchAndSetUserProfile(session.user)
        } else if (event === 'USER_UPDATED' && session?.user) {
          console.log('👤 User updated, refreshing state...')
          await fetchAndSetUserProfile(session.user)
        }
      }
    )

    return () => {
      console.log('🧹 Cleaning up auth state change listener...')
      subscription.unsubscribe()
    }
  }, [router])

  // Separate useEffect for cookie refresh to avoid dependency issues
  useEffect(() => {
    if (!user || user.demo) return

    const cookieRefreshInterval = setInterval(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.access_token) {
          await fetch('/api/auth/set-cookie', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ access_token: session.access_token })
          })
          console.log('🍪 Periodic cookie refresh completed')
        }
      } catch (error) {
        console.warn('⚠️ Failed to refresh cookie:', error)
      }
    }, 5 * 60 * 1000) // Refresh every 5 minutes

    return () => {
      clearInterval(cookieRefreshInterval)
    }
  }, [user?.id]) // Only re-run if user ID changes, not on every user update

  const fetchAndSetUserProfile = async (authUser: any) => {
    try {
      console.log('🔍 Fetching profile for user:', authUser.id)
      
      // Set basic user state but don't cache immediately - wait for profile validation
      const basicUser: User = {
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.user_metadata?.full_name || authUser.email || 'User',
        subscription: 'free' as const,
        profile: null
      }
      
      setUser(basicUser)
      setLoading(false)
      setInitialized(true)
      
      console.log('✅ Basic user state set, validating profile:', basicUser.name)
      
      // Fetch full profile in background
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', authUser.id)
          .single()

        if (!error && profile) {
          console.log('✅ Full profile loaded:', profile.full_name || profile.email)
          
          // Update user with full profile data
          const fullUser: User = {
            ...basicUser,
            name: profile.full_name || basicUser.name,
            subscription: (profile.subscription_tier as 'free' | 'pro' | 'enterprise') || 'free',
            profile: {
              company: profile.company_name || undefined,
              industry: profile.industry || undefined,
              jobTitle: profile.job_title || undefined,
              businessContext: profile.business_context || undefined,
              targetAudience: profile.target_audience || undefined
            }
          }
          
          setUser(fullUser)
          cacheUserState(fullUser)
          console.log('✅ User state updated with full profile')
        } else if (error && error.code === 'PGRST116') {
          // Profile doesn't exist, create it
          console.log('📝 Creating new profile for user')
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              user_id: authUser.id,
              email: authUser.email,
              full_name: authUser.user_metadata?.full_name || null,
              company_name: authUser.user_metadata?.company_name || null,
              subscription_tier: 'free',
              is_active: true,
              email_verified: true
            })
            .select()
            .single()
          
          if (!createError && newProfile) {
            console.log('✅ Profile created successfully')
            const fullUser: User = {
              ...basicUser,
              name: newProfile.full_name || basicUser.name,
              subscription: (newProfile.subscription_tier as 'free' | 'pro' | 'enterprise') || 'free',
              profile: {
                company: newProfile.company_name || undefined
              }
            }
            setUser(fullUser)
            cacheUserState(fullUser)
          } else {
            console.error('❌ Failed to create profile:', createError)
          }
        } else {
          console.error('❌ Profile fetch error:', error)
        }
      } catch (profileError) {
        console.error('❌ Profile fetch error:', profileError)
      }
    } catch (error) {
      console.error('❌ Error in fetchAndSetUserProfile:', error)
      setLoading(false)
      setInitialized(true)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      console.log('🔐 Attempting sign in for:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        setLoading(false)
        console.error('❌ Sign in error:', error)
        return { error: `Sign in failed: ${error.message}` }
      }

      if (data.user && data.session) {
        console.log('✅ Sign in successful for user:', data.user.email)
        // Auth successful - loading will be set to false by the auth state change listener
        return {}
      }

      setLoading(false)
      return { error: 'Authentication failed. Please try again.' }
    } catch (error) {
      console.error('❌ Sign in error:', error)
      setLoading(false)
      return { error: 'Network error. Please check your connection and try again.' }
    }
  }

  const signInDemo = async () => {
    try {
      setLoading(true)
      
      console.log('🚀 Starting demo sign-in...')
      
      const response = await fetch('/api/auth/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ demo: true }),
      })

      if (!response.ok) {
        setLoading(false)
        console.error('Demo setup error:', response.status)
        return { error: `Demo setup failed. Please try again later. (Error: ${response.status})` }
      }

      const data = await response.json()

      if (!data.success) {
        setLoading(false)
        return { error: data.error || 'Failed to start demo session. Please try again.' }
      }

      console.log('✅ Demo API response:', data)

      // Store demo session in localStorage as backup
      const demoSession = {
        active: true,
        expiresAt: data.demo.expiresAt,
        features: data.demo.features,
        startedAt: new Date().toISOString()
      }
      localStorage.setItem(DEMO_CACHE_KEY, JSON.stringify(demoSession))

      // Set demo user
      const demoUser: User = {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'demo@easydecks.ai',
        name: 'Demo User',
        subscription: 'pro',
        demo: true
      }
      
      setUser(demoUser)
      cacheUserState(demoUser)
      setLoading(false)

      console.log('🎭 Demo user set, redirecting to dashboard...')

      // Use Next.js router for proper navigation
      router.push('/dashboard')
      return {}
    } catch (error) {
      console.error('Demo sign in error:', error)
      setLoading(false)
      return { error: 'Network error while starting demo. Please check your connection and try again.' }
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
            email: data.user.email || email,
            full_name: name,
            company_name: company
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
        }

        // Set user state immediately after signup
        const newUser: User = {
          id: data.user.id,
          email: data.user.email || email,
          name: name,
          subscription: 'free'
        }
        
        setUser(newUser)
        cacheUserState(newUser)
      }

      return {}
    } catch (error) {
      console.error('Sign up error:', error)
      return { error: 'An unexpected error occurred' }
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      
      // Clear demo session if it exists
      const demoSession = localStorage.getItem(DEMO_CACHE_KEY)
      if (demoSession) {
        console.log('🧹 Clearing demo session...')
        localStorage.removeItem(DEMO_CACHE_KEY)
        
        // Clear demo cookies by calling the API
        try {
          await fetch('/api/auth/test', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ clear: true }),
          })
        } catch (error) {
          console.warn('Failed to clear demo cookies:', error)
        }
      }

      // Clear server-side auth cookie
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include'
        })
        console.log('🧹 Server-side auth cookie cleared')
      } catch (error) {
        console.warn('Failed to clear server-side cookie:', error)
      }

      // Clear Supabase session
      if (supabase) {
        await supabase.auth.signOut()
      }

      // Clear local state
      setUser(null)
      localStorage.removeItem(USER_CACHE_KEY)
      setLoading(false)

      // Redirect to home page
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
      setLoading(false)
      
      // Force clear state even if there's an error
      setUser(null)
      localStorage.removeItem(USER_CACHE_KEY)
      localStorage.removeItem(DEMO_CACHE_KEY)
      router.push('/')
    }
  }

  const updateProfile = async (profileData: any) => {
    try {
      const response = await fetch('/api/user/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(profileData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        return { error: errorData.error || 'Failed to update profile' }
      }

      const data = await response.json()
      
      // Update local user state
      if (user && data.profile) {
        const updatedUser = {
          ...user,
          name: data.profile.full_name || user.name,
          profile: {
            ...user.profile,
            company: data.profile.company_name,
            industry: data.profile.industry,
            jobTitle: data.profile.job_title,
            businessContext: data.profile.business_context,
            targetAudience: data.profile.target_audience
          }
        }
        setUser(updatedUser)
        cacheUserState(updatedUser)
      }

      return {}
    } catch (error) {
      console.error('Update profile error:', error)
      return { error: 'An unexpected error occurred' }
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signInDemo,
      signInWithOAuth,
      signUp,
      signOut,
      updateProfile,
      startSessionKeeper: () => sessionKeeper.start(),
      stopSessionKeeper: () => sessionKeeper.stop()
    }}>
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
