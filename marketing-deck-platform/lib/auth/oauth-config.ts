import { supabase, isSupabaseConfigured } from '@/lib/supabase/enhanced-client'

export interface OAuthProvider {
  name: string
  displayName: string
  icon: string
  color: string
  scopes?: string
}

export const oauthProviders: Record<string, OAuthProvider> = {
  google: {
    name: 'google',
    displayName: 'Google',
    icon: '🔍',
    color: '#4285f4',
    scopes: 'openid email profile'
  },
  github: {
    name: 'github',
    displayName: 'GitHub',
    icon: '🐙',
    color: '#24292e'
  },
  microsoft: {
    name: 'azure',
    displayName: 'Microsoft',
    icon: '🏢',
    color: '#0078d4',
    scopes: 'openid email profile'
  }
}

export class OAuthManager {
  static async signInWithProvider(provider: keyof typeof oauthProviders, redirectTo?: string) {
    if (!isSupabaseConfigured()) {
      throw new Error('OAuth is not configured. Please set up Supabase environment variables or use demo login.')
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as any,
      options: {
        redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
        scopes: oauthProviders[provider].scopes
      }
    })

    if (error) {
      console.error(`OAuth ${provider} error:`, error)
      throw error
    }

    return data
  }

  static async handleAuthCallback() {
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Auth callback error:', error)
      throw error
    }

    if (data.session) {
      // Create or update user profile
      await this.createOrUpdateUserProfile(data.session.user)
    }

    return data.session
  }

  static async createOrUpdateUserProfile(user: any) {
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    const userData = {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name,
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
      oauth_provider: user.app_metadata?.provider,
      oauth_provider_id: user.user_metadata?.provider_id,
      email_verified: user.email_confirmed_at ? true : false
    }

    if (existingUser) {
      // Update existing user
      const { error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', user.id)

      if (error) throw error
    } else {
      // Create new user
      const { error } = await supabase
        .from('users')
        .insert(userData)

      if (error) throw error
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
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    return { ...user, profile }
  }

  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

export default OAuthManager