'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  email: string
  name: string
  avatar?: string
  subscription: 'free' | 'pro' | 'enterprise'
  createdAt: Date
  lastLoginAt: Date
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signInDemo: () => Promise<{ error?: string }>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    checkAuthStatus()
  }, [])

  // Helper function to parse cookies
  const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null
    
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null
    }
    return null
  }

  const checkAuthStatus = async () => {
    try {
      setLoading(true)
      
      // Only check cookies on client side
      if (typeof window === 'undefined') {
        setLoading(false)
        return
      }
      
      // Check for demo user first
      const demoUser = getCookie('demo-user')
      if (demoUser === 'true') {
        const userInfo = getCookie('user-info')
        
        if (userInfo) {
          try {
            const userData = JSON.parse(decodeURIComponent(userInfo))
            setUser({
              id: userData.id,
              email: userData.email,
              name: userData.name,
              subscription: userData.subscription,
              createdAt: new Date(),
              lastLoginAt: new Date()
            })
            setLoading(false)
            return
          } catch (error) {
            console.error('Error parsing user info:', error)
          }
        }
      }

      // Check for regular auth token
      const authToken = getCookie('auth-token')

      if (authToken) {
        try {
          const response = await fetch('/api/auth/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: authToken })
          })

          if (response.ok) {
            const data = await response.json()
            if (data.user) {
              setUser(data.user)
            }
          }
        } catch (error) {
          console.error('Error verifying token:', error)
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const signOut = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
    } catch (error) {
      console.error('Error during logout:', error)
    } finally {
      setUser(null)
      router.push('/auth/login')
    }
  }

  const refreshUser = async () => {
    await checkAuthStatus()
  }

  const value = {
    user,
    loading,
    signIn,
    signInDemo,
    signOut,
    refreshUser
  }

  if (!mounted) {
    return <div>Loading...</div>
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}