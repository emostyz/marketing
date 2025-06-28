import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase/server-client'

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
    // Check for auth cookie directly first
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    const authCookie = allCookies.find(c => c.name === 'sb-waddrfstpqkvdfwbxvfw-auth-token')
    
    console.log('🔍 Auth cookie check - Found:', !!authCookie, 'Length:', authCookie?.value?.length)
    console.log('🍪 All available cookies:', allCookies.map(c => ({ name: c.name, length: c.value?.length })))
    
    if (!authCookie || !authCookie.value) {
      console.log('❌ No auth cookie found')
      return {
        user: null,
        isDemo: false,
        error: 'No auth cookie found'
      }
    }
    
    // Try to parse the JWT token to get user ID
    try {
      const tokenParts = authCookie.value.split('.')
      if (tokenParts.length === 3) {
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString())
        const userId = payload.sub
        const email = payload.email
        
        if (userId && email) {
          console.log('✅ Valid JWT token found for user:', email)
          
          const authenticatedUser: AuthenticatedUser = {
            id: userId,
            email: email,
            name: email.split('@')[0],
            subscription: 'free' as 'free' | 'pro' | 'enterprise',
            demo: false,
            profile: null
          }

          return {
            user: authenticatedUser,
            isDemo: false
          }
        }
      }
    } catch (jwtError) {
      console.log('⚠️ JWT parsing failed:', jwtError.message)
    }
    
    // Fallback to Supabase client
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    console.log('🔍 Supabase fallback - User found:', !!user, 'Error:', userError?.message)
    
    if (!userError && user) {
      console.log('✅ Valid user found via Supabase:', user.id)
      
      // Get user profile from Supabase
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profileError) {
        console.log('⚠️ Profile not found, using basic user info:', profileError.message)
      }

      const authenticatedUser: AuthenticatedUser = {
        id: user.id,
        email: user.email || '',
        name: profile?.full_name || profile?.name || user.user_metadata?.full_name || user.email || 'User',
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