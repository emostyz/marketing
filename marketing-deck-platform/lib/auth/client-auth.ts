"use client"

import { supabase } from '@/lib/supabase/enhanced-client'

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

/**
 * Client-side authentication utilities
 * These functions can be used in client components without server-only imports
 */
export class ClientAuth {
  /**
   * Get current user from client-side context
   * This function reads from cookies or localStorage but doesn't use server-only APIs
   */
  static getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null
    
    try {
      // Check for demo user first
      const demoUser = document.cookie.includes('demo-user=true')
      if (demoUser) {
        const userInfo = document.cookie
          .split('; ')
          .find(row => row.startsWith('user-info='))
          ?.split('=')[1]
        
        if (userInfo) {
          const userData = JSON.parse(decodeURIComponent(userInfo))
          return {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            subscription: userData.subscription,
            createdAt: new Date(),
            lastLoginAt: new Date()
          }
        }
      }
      
      // For Supabase users, we need to make an API call
      // This will be handled by the auth context
      return null
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  /**
   * Get current user ID for client-side operations
   */
  static getCurrentUserId(): string | null {
    const user = this.getCurrentUser()
    return user ? user.id.toString() : null
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null
  }

  /**
   * Get user subscription level
   */
  static getSubscriptionLevel(): 'free' | 'pro' | 'enterprise' | null {
    const user = this.getCurrentUser()
    return user?.subscription || null
  }

  /**
   * Check if user has required subscription level
   */
  static hasSubscription(minLevel: 'free' | 'pro' | 'enterprise' = 'free'): boolean {
    const user = this.getCurrentUser()
    if (!user) return false
    
    const levels = { free: 0, pro: 1, enterprise: 2 }
    const userLevel = levels[user.subscription] || 0
    const requiredLevel = levels[minLevel] || 0
    
    return userLevel >= requiredLevel
  }

  /**
   * Get auth token from cookies
   */
  static getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth-token='))
      ?.split('=')[1]
    
    return token || null
  }

  /**
   * Make authenticated API request
   */
  static async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getAuthToken()
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    return fetch(url, {
      ...options,
      headers,
    })
  }

  /**
   * Get user profile from Supabase (client-side)
   */
  static async getUserProfile(): Promise<UserProfile | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) return null
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
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

  /**
   * Update user profile (client-side)
   */
  static async updateUserProfile(profileData: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) return null
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...profileData,
          updatedAt: new Date().toISOString()
        })
        .eq('id', session.user.id)
        .select()
        .single()
      
      if (error) {
        console.error('Error updating user profile:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error updating user profile:', error)
      return null
    }
  }

  /**
   * Get current Supabase session
   */
  static async getSupabaseSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      return session
    } catch (error) {
      console.error('Error getting Supabase session:', error)
      return null
    }
  }

  /**
   * Create user from Supabase session
   */
  static async createUserFromSession(): Promise<User | null> {
    try {
      const session = await this.getSupabaseSession()
      if (!session) return null
      
      const profile = await this.getUserProfile()
      
      return {
        id: parseInt(session.user.id) || 0,
        email: session.user.email || '',
        name: profile?.companyName || session.user.user_metadata?.full_name || 'User',
        avatar: profile?.logoUrl || session.user.user_metadata?.avatar_url,
        subscription: 'pro', // Default to pro for real users
        createdAt: new Date(session.user.created_at || Date.now()),
        lastLoginAt: new Date(),
        profile: profile || undefined
      }
    } catch (error) {
      console.error('Error creating user from session:', error)
      return null
    }
  }
}

/**
 * React hook for getting current user in client components
 * This should be used instead of directly calling AuthSystem.getCurrentUser()
 * 
 * Note: This is a simple implementation. In practice, you should use the useAuth hook
 * from the AuthContext which provides more complete state management.
 */
export function useCurrentUser(): User | null {
  // This function should be used within the AuthContext
  // It's a placeholder for now - use useAuth() from auth-context instead
  return ClientAuth.getCurrentUser()
}