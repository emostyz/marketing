import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase/enhanced-client'
import bcrypt from 'bcryptjs'

export interface User {
  id: number
  email: string
  name: string
  avatar?: string
  subscription: 'free' | 'pro' | 'enterprise'
  createdAt: Date
  lastLoginAt: Date
  profile?: UserProfile
}

export interface UserProfile {
  id?: string
  companyName?: string
  logoUrl?: string
  brandColors?: { [key: string]: any }
  industry?: string
  targetAudience?: string
  businessContext?: string
  keyMetrics?: string[]
  dataPreferences?: { [key: string]: any }
  presentationHistory?: Array<{ [key: string]: any }>
  [key: string]: any
}

export interface AuthSession {
  user: User
  token: string
  expiresAt: Date
}

// Mock user database - in production, this would be a real database
const mockUsers: User[] = [
  {
    id: 1,
    email: 'demo@easydecks.ai',
    name: 'Demo User',
    avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=3b82f6&color=ffffff',
    subscription: 'pro',
    createdAt: new Date('2024-01-01'),
    lastLoginAt: new Date()
  },
  {
    id: 2,
    email: 'admin@easydecks.ai',
    name: 'Admin User',
    avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=10b981&color=ffffff',
    subscription: 'enterprise',
    createdAt: new Date('2024-01-01'),
    lastLoginAt: new Date()
  }
]

// Mock sessions storage
const activeSessions = new Map<string, AuthSession>()

export class AuthSystem {
  static async authenticate(email: string, password: string): Promise<{ success: boolean; session?: AuthSession; error?: string }> {
    try {
      // First try Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        // If it's an invalid login credentials error, check demo users
        if (error.message.includes('Invalid login credentials') || error.message.includes('Email not confirmed')) {
          const user = mockUsers.find(u => u.email === email)
          
          if (user) {
            // Demo user found, create session
            const session: AuthSession = {
              user: { ...user, lastLoginAt: new Date() },
              token: this.generateToken(),
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
            }

            // Store session
            activeSessions.set(session.token, session)

            return { success: true, session }
          }
        }
        
        // Return appropriate error message
        if (error.message.includes('Invalid login credentials')) {
          return { success: false, error: 'Invalid email or password' }
        } else if (error.message.includes('Email not confirmed')) {
          return { success: false, error: 'Please check your email and confirm your account before signing in' }
        } else {
          return { success: false, error: error.message }
        }
      }

      // Supabase authentication successful
      if (data.user) {
        // Get or create user profile
        const profile = await this.getOrCreateUserProfile(data.user)
        
        const user: User = {
          id: parseInt(data.user.id) || 0,
          email: data.user.email || '',
          name: profile?.companyName || data.user.user_metadata?.full_name || 'User',
          avatar: profile?.logoUrl || data.user.user_metadata?.avatar_url,
          subscription: 'pro', // Default to pro for real users
          createdAt: new Date(data.user.created_at || Date.now()),
          lastLoginAt: new Date(),
          profile: profile || undefined
        }

        const session: AuthSession = {
          user,
          token: data.session?.access_token || this.generateToken(),
          expiresAt: new Date(data.session?.expires_at || Date.now() + 24 * 60 * 60 * 1000)
        }

        return { success: true, session }
      }

      return { success: false, error: 'Authentication failed' }
    } catch (error) {
      console.error('Authentication error:', error)
      return { success: false, error: 'Authentication failed' }
    }
  }

  static async register(email: string, password: string, name: string, company?: string): Promise<{ success: boolean; session?: AuthSession; error?: string }> {
    try {
      // Validate input
      if (!email || !password || !name) {
        return { success: false, error: 'All fields are required' }
      }

      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' }
      }

      // Create user in Supabase
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
        return { success: false, error: error.message }
      }

      if (data.user) {
        // Create user profile
        const profile = await this.createUserProfile(data.user, { companyName: company, name })
        
        const user: User = {
          id: parseInt(data.user.id) || 0,
          email: data.user.email || '',
          name: name,
          avatar: profile?.logoUrl,
          subscription: 'free', // Start with free plan
          createdAt: new Date(data.user.created_at || Date.now()),
          lastLoginAt: new Date(),
          profile: profile || undefined
        }

        const session: AuthSession = {
          user,
          token: data.session?.access_token || this.generateToken(),
          expiresAt: new Date(data.session?.expires_at || Date.now() + 24 * 60 * 60 * 1000)
        }

        return { success: true, session }
      }

      return { success: false, error: 'Registration failed' }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'Registration failed' }
    }
  }

  static async getOrCreateUserProfile(supabaseUser: any): Promise<UserProfile | null> {
    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single()

      if (existingProfile) {
        return existingProfile
      }

      // Create new profile
      return await this.createUserProfile(supabaseUser)
    } catch (error) {
      console.error('Error getting/creating user profile:', error)
      return null
    }
  }

  static async createUserProfile(supabaseUser: any, additionalData: any = {}): Promise<UserProfile | null> {
    try {
      const profileData = {
        id: supabaseUser.id,
        email: supabaseUser.email,
        name: additionalData.name || supabaseUser.user_metadata?.full_name,
        companyName: additionalData.companyName || supabaseUser.user_metadata?.company_name,
        logoUrl: supabaseUser.user_metadata?.avatar_url,
        brandColors: {
          primary: '#3b82f6',
          secondary: '#10b981'
        },
        industry: '',
        targetAudience: '',
        businessContext: '',
        businessGoals: [],
        keyQuestions: [],
        keyMetrics: [],
        datasetTypes: [],
        usagePlan: '',
        presentationStyle: '',
        dataPreferences: {
          chartStyles: ['modern', 'clean'],
          colorSchemes: ['blue', 'green'],
          narrativeStyle: 'professional'
        },
        customRequirements: '',
        onboardingCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single()

      if (error) {
        console.error('Error creating user profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error creating user profile:', error)
      return null
    }
  }

  static async getSession(token: string): Promise<AuthSession | null> {
    try {
      // First check Supabase session
      const { data: { session: supabaseSession } } = await supabase.auth.getSession()
      
      if (supabaseSession && supabaseSession.access_token === token) {
        const profile = await this.getOrCreateUserProfile(supabaseSession.user)
        
        const user: User = {
          id: parseInt(supabaseSession.user.id) || 0,
          email: supabaseSession.user.email || '',
          name: profile?.companyName || supabaseSession.user.user_metadata?.full_name || 'User',
          avatar: profile?.logoUrl || supabaseSession.user.user_metadata?.avatar_url,
          subscription: 'pro',
          createdAt: new Date(supabaseSession.user.created_at || Date.now()),
          lastLoginAt: new Date(),
          profile: profile || undefined
        }

        return {
          user,
          token: supabaseSession.access_token,
          expiresAt: new Date(supabaseSession.expires_at || Date.now() + 24 * 60 * 60 * 1000)
        }
      }

      // Fallback to mock sessions
      const mockSession = activeSessions.get(token)
      
      if (!mockSession || mockSession.expiresAt < new Date()) {
        if (mockSession) {
          activeSessions.delete(token)
        }
        return null
      }

      return mockSession
    } catch (error) {
      console.error('Error getting session:', error)
      return null
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const cookieStore = await cookies()
      const token = cookieStore.get('auth-token')?.value
      
      if (!token) {
        // Check for demo user
        const demoUser = cookieStore.get('demo-user')?.value
        if (demoUser === 'true') {
          // Return demo user with proper UUID
          return {
            ...mockUsers[0],
            id: 1 // Keep numeric ID for mock system compatibility
          }
        }
        return null
      }

      const session = await this.getSession(token)
      return session?.user || null
    } catch {
      return null
    }
  }

  static async logout(token: string): Promise<boolean> {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut()
      
      // Clear mock sessions
      const deleted = activeSessions.delete(token)
      return deleted
    } catch (error) {
      console.error('Logout error:', error)
      return false
    }
  }

  static async setAuthCookie(session: AuthSession): Promise<void> {
    const cookieStore = await cookies()
    
    // Set auth token cookie
    cookieStore.set('auth-token', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 24 hours
    })

    // Set user info cookie for client-side access
    cookieStore.set('user-info', JSON.stringify({
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      subscription: session.user.subscription
    }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60
    })
  }

  static async clearAuthCookies(): Promise<void> {
    const cookieStore = await cookies()
    
    cookieStore.delete('auth-token')
    cookieStore.delete('user-info')
    cookieStore.delete('demo-user')
  }

  static async setDemoMode(): Promise<void> {
    const cookieStore = await cookies()
    
    cookieStore.set('demo-user', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 1 week
    })

    cookieStore.set('user-info', JSON.stringify({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Demo User',
      email: 'demo@easydecks.ai',
      subscription: 'pro'
    }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60
    })
  }

  private static generateToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  static async requireAuth(): Promise<User> {
    const user = await this.getCurrentUser()
    if (!user) {
      throw new Error('Authentication required')
    }
    return user
  }

  static async requireSubscription(minLevel: 'free' | 'pro' | 'enterprise' = 'free'): Promise<User> {
    const user = await this.requireAuth()
    
    const levels = { free: 0, pro: 1, enterprise: 2 }
    const userLevel = levels[user.subscription] || 0
    const requiredLevel = levels[minLevel] || 0
    
    if (userLevel < requiredLevel) {
      throw new Error(`Subscription level ${minLevel} required`)
    }
    
    return user
  }

  static async updateUserProfile(profileData: Partial<UserProfile>): Promise<User | null> {
    try {
      const user = await this.getCurrentUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...profileData,
          updatedAt: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating user profile:', error)
        return null
      }

      // Update user object with new profile data
      const updatedUser: User = {
        ...user,
        name: data.companyName || user.name,
        avatar: data.logoUrl || user.avatar,
        profile: data
      }

      return updatedUser
    } catch (error) {
      console.error('Error updating user profile:', error)
      return null
    }
  }

  static async getUserProfile(): Promise<UserProfile | null> {
    try {
      const user = await this.getCurrentUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error getting user profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    }
  }
}