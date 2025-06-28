import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export interface AuthenticatedUser {
  id: string
  email: string
  name: string
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

export interface AuthResult {
  user: AuthenticatedUser | null
  isDemo: boolean
  error?: string
}

/**
 * Unified authentication for API endpoints
 * Handles both Supabase authentication and demo mode
 */
export async function getAuthenticatedUser(): Promise<AuthResult> {
  try {
    // First, try to get Supabase session
    const supabase = createClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    console.log('🔍 Auth check - Session found:', !!session?.user, 'Error:', sessionError?.message)
    
    if (!sessionError && session?.user) {
      console.log('✅ Valid session found for user:', session.user.id)
      
      // Get user profile from Supabase
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

      if (profileError) {
        console.log('⚠️ Profile not found, using basic user info:', profileError.message)
      }

      const authenticatedUser: AuthenticatedUser = {
        id: session.user.id,
        email: session.user.email || '',
        name: profile?.full_name || profile?.name || session.user.user_metadata?.full_name || session.user.email || 'User',
        subscription: (profile?.subscription_tier || 'free') as 'free' | 'pro' | 'enterprise',
        demo: false,
        profile: profile ? {
          company: profile.company_name,
          industry: profile.industry,
          jobTitle: profile.job_title,
          businessContext: profile.business_context,
          targetAudience: profile.target_audience
        } : null
      }

      console.log('✅ Authenticated user created:', authenticatedUser.id, authenticatedUser.email)
      return {
        user: authenticatedUser,
        isDemo: false
      }
    }

    // No authentication found - return null (no automatic demo fallback)
    console.log('❌ No valid session found')
    return {
      user: null,
      isDemo: false,
      error: 'No valid session found'
    }

  } catch (error) {
    console.error('❌ Authentication error:', error)
    return {
      user: null,
      isDemo: false,
      error: 'Authentication failed'
    }
  }
}

/**
 * Require authentication for an API endpoint
 * Throws error if not authenticated
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const { user, error } = await getAuthenticatedUser()
  
  if (!user) {
    throw new Error(error || 'Authentication required')
  }
  
  return user
}

/**
 * Require specific subscription level
 */
export async function requireSubscription(minLevel: 'free' | 'pro' | 'enterprise' = 'free'): Promise<AuthenticatedUser> {
  const user = await requireAuth()
  
  const levels = { free: 0, pro: 1, enterprise: 2 }
  const userLevel = levels[user.subscription] || 0
  const requiredLevel = levels[minLevel] || 0
  
  if (userLevel < requiredLevel) {
    throw new Error(`Subscription level ${minLevel} required`)
  }
  
  return user
}

/**
 * Get authenticated user with demo fallback for upload/analysis endpoints
 * This is specifically for endpoints that should work in demo mode
 */
export async function getAuthenticatedUserWithDemo(): Promise<{ user: AuthenticatedUser; isDemo: boolean }> {
  const authResult = await getAuthenticatedUser()
  
  // If we have a real authenticated user, return them
  if (authResult.user) {
    console.log('✅ Real authenticated user found:', authResult.user.id)
    return { 
      user: authResult.user, 
      isDemo: false  // Real users are never demo
    }
  }
  
  // Only return demo user as fallback for unauthenticated requests
  console.log('⚠️ No authenticated user, returning demo fallback')
  return {
    user: {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'demo@easydecks.ai',
      name: 'Demo User',
      subscription: 'pro',
      demo: true,
      profile: null
    },
    isDemo: true
  }
}