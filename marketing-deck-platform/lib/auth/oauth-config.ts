import { supabase, isSupabaseConfigured } from '@/lib/supabase/enhanced-client'

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
  },
  microsoft: {
    name: 'azure',
    displayName: 'Microsoft',
    icon: '🏢',
    color: '#0078d4',
    scopes: 'openid email profile',
    enabled: true
  }
}

export class OAuthManager {
  static async signInWithProvider(provider: keyof typeof oauthProviders, redirectTo?: string) {
    if (!isSupabaseConfigured()) {
      throw new Error('OAuth is not configured. Please set up Supabase environment variables.')
    }

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
        .eq('id', user.id)
        .single()

      const userData = {
        id: user.id,
        email: user.email,
        companyName: user.user_metadata?.company_name || user.user_metadata?.organization || user.user_metadata?.full_name || 'My Company',
        logoUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
        industry: user.user_metadata?.industry || 'Technology',
        targetAudience: user.user_metadata?.target_audience || 'Business Professionals',
        businessContext: user.user_metadata?.business_context || 'Marketing and Sales Presentations',
        keyMetrics: user.user_metadata?.key_metrics || ['Revenue Growth', 'Customer Acquisition', 'Market Share'],
        dataPreferences: user.user_metadata?.data_preferences || {
          chartStyles: ['modern', 'clean'],
          colorSchemes: ['blue', 'green'],
          narrativeStyle: 'professional'
        },
        updatedAt: new Date().toISOString()
      }

      if (existingUser) {
        // Update existing user
        const { error } = await supabase
          .from('profiles')
          .update(userData)
          .eq('id', user.id)

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
            createdAt: new Date().toISOString()
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
        .eq('id', user.id)
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
      .eq('id', user.id)
      .single()

    // Format user to match the User interface
    const formattedUser = {
      id: parseInt(user.id) || 0,
      email: user.email || '',
      name: profile?.companyName || user.user_metadata?.full_name || user.user_metadata?.name || 'User',
      avatar: profile?.logoUrl || user.user_metadata?.avatar_url,
      subscription: 'pro' as const, // Default to pro for OAuth users
      createdAt: new Date(user.created_at || Date.now()),
      lastLoginAt: new Date(),
      profile: profile || undefined
    }

    return formattedUser
  }

  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }

  static async updateUserProfile(profileData: any) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('No authenticated user')

    const { error } = await supabase
      .from('profiles')
      .update({
        ...profileData,
        updatedAt: new Date().toISOString()
      })
      .eq('id', user.id)

    if (error) throw error

    return this.getCurrentUser()
  }
}

export default OAuthManager