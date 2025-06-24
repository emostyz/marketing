import { supabase } from '@/lib/supabase/client'

export interface OAuthProvider {
  name: string
  displayName: string
  icon: string
  color: string
  scopes?: string
  enabled: boolean
}

export const oauthProviders: Record<string, OAuthProvider> = {
  google: {
    name: 'google',
    displayName: 'Google',
    icon: '🔍',
    color: '#4285f4',
    scopes: 'openid email profile',
    enabled: true
  },
  github: {
    name: 'github',
    displayName: 'GitHub',
    icon: '🐙',
    color: '#24292e',
    enabled: true
  }
}

export class OAuthManager {
  static async signInWithProvider(provider: keyof typeof oauthProviders, redirectTo?: string) {
    const providerConfig = oauthProviders[provider]
    if (!providerConfig.enabled) {
      throw new Error(`${providerConfig.displayName} OAuth is not enabled.`)
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as any,
      options: {
        redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
        scopes: providerConfig.scopes,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    })

    if (error) {
      console.error(`OAuth ${provider} error:`, error)
      throw error
    }

    return data
  }

  static async handleAuthCallback() {
    try {
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Auth callback error:', error)
        throw error
      }

      if (data.session) {
        // Create or update user profile
        const profile = await this.createOrUpdateUserProfile(data.session.user)
        
        if (profile) {
          console.log('User profile created/updated successfully:', profile)
        }
        
        return data.session
      }

      return null
    } catch (error) {
      console.error('Error in handleAuthCallback:', error)
      throw error
    }
  }

  static async createOrUpdateUserProfile(user: any) {
    try {
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      const userData = {
        user_id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email,
        company_name: user.user_metadata?.company_name || user.user_metadata?.organization || 'My Company',
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
        subscription_tier: 'free',
        is_active: true,
        email_verified: true,
        updated_at: new Date().toISOString()
      }

      if (existingUser) {
        // Update existing user
        const { error } = await supabase
          .from('profiles')
          .update(userData)
          .eq('user_id', user.id)

        if (error) {
          console.error('Error updating user profile:', error)
          throw error
        }
      } else {
        // Create new user
        const { error } = await supabase
          .from('profiles')
          .insert({
            ...userData,
            created_at: new Date().toISOString()
          })

        if (error) {
          console.error('Error creating user profile:', error)
          throw error
        }
      }

      // Return the created/updated profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      return profile
    } catch (error) {
      console.error('Error in createOrUpdateUserProfile:', error)
      // Don't throw here as we don't want to break the auth flow
      return null
    }
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  static async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null

    // Get enhanced user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Format user to match the User interface
    const formattedUser = {
      id: user.id,
      email: user.email || '',
      name: profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || 'User',
      avatar: profile?.avatar_url || user.user_metadata?.avatar_url,
      subscription: (profile?.subscription_tier || 'free') as 'free' | 'pro' | 'enterprise',
      profile: profile ? {
        company: profile.company_name,
        industry: profile.industry,
        jobTitle: profile.job_title,
        businessContext: profile.business_context,
        targetAudience: profile.target_audience
      } : null
    }

    return formattedUser
  }

  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

export default OAuthManager