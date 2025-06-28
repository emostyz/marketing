import { supabase } from '@/lib/supabase/enhanced-client'
import { cookies } from 'next/headers'

export interface AuthRefreshConfig {
  refreshThresholdMs: number // Refresh token when it expires in X ms
  checkIntervalMs: number // How often to check token expiry
  maxRefreshAttempts: number
}

export class AuthRefreshManager {
  private static instance: AuthRefreshManager
  private config: AuthRefreshConfig
  private refreshTimer: NodeJS.Timeout | null = null
  private isRefreshing: boolean = false
  private refreshPromise: Promise<boolean> | null = null
  private lastRefreshTime: Date | null = null

  private constructor(config?: Partial<AuthRefreshConfig>) {
    this.config = {
      refreshThresholdMs: 5 * 60 * 1000, // 5 minutes before expiry
      checkIntervalMs: 60 * 1000, // Check every minute
      maxRefreshAttempts: 3,
      ...config
    }
  }

  static getInstance(config?: Partial<AuthRefreshConfig>): AuthRefreshManager {
    if (!AuthRefreshManager.instance) {
      AuthRefreshManager.instance = new AuthRefreshManager(config)
    }
    return AuthRefreshManager.instance
  }

  /**
   * Start monitoring auth token expiry
   */
  startMonitoring() {
    if (this.refreshTimer) {
      return // Already monitoring
    }

    console.log('🔐 Starting auth token monitoring')
    
    // Check immediately
    this.checkAndRefreshToken()

    // Set up periodic checks
    this.refreshTimer = setInterval(() => {
      this.checkAndRefreshToken()
    }, this.config.checkIntervalMs)
  }

  /**
   * Stop monitoring auth token expiry
   */
  stopMonitoring() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
      this.refreshTimer = null
      console.log('🔐 Stopped auth token monitoring')
    }
  }

  /**
   * Check if token needs refresh and refresh if necessary
   */
  private async checkAndRefreshToken() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        console.log('🔐 No active session found')
        return
      }

      const expiresAt = new Date(session.expires_at! * 1000)
      const now = new Date()
      const timeUntilExpiry = expiresAt.getTime() - now.getTime()

      console.log(`🔐 Token expires in ${Math.round(timeUntilExpiry / 1000 / 60)} minutes`)

      // Refresh if token expires soon
      if (timeUntilExpiry <= this.config.refreshThresholdMs) {
        console.log('🔐 Token expiring soon, refreshing...')
        await this.refreshToken()
      }
    } catch (error) {
      console.error('🔐 Error checking token expiry:', error)
    }
  }

  /**
   * Refresh the auth token
   */
  async refreshToken(): Promise<boolean> {
    // Prevent concurrent refresh attempts
    if (this.isRefreshing && this.refreshPromise) {
      console.log('🔐 Refresh already in progress, waiting...')
      return this.refreshPromise
    }

    this.isRefreshing = true
    this.refreshPromise = this.performRefresh()

    try {
      const result = await this.refreshPromise
      return result
    } finally {
      this.isRefreshing = false
      this.refreshPromise = null
    }
  }

  /**
   * Perform the actual token refresh
   */
  private async performRefresh(): Promise<boolean> {
    let attempts = 0
    let lastError: Error | null = null

    while (attempts < this.config.maxRefreshAttempts) {
      try {
        console.log(`🔐 Refreshing token (attempt ${attempts + 1}/${this.config.maxRefreshAttempts})`)
        
        const { data, error } = await supabase.auth.refreshSession()
        
        if (error) {
          throw error
        }

        if (data.session) {
          console.log('✅ Token refreshed successfully')
          this.lastRefreshTime = new Date()
          
          // Update cookies with new session
          await this.updateAuthCookies(data.session)
          
          return true
        }

        throw new Error('No session returned from refresh')
        
      } catch (error) {
        lastError = error as Error
        console.error(`❌ Token refresh failed (attempt ${attempts + 1}):`, error)
        
        attempts++
        
        if (attempts < this.config.maxRefreshAttempts) {
          // Wait before retrying (exponential backoff)
          const delay = Math.min(1000 * Math.pow(2, attempts), 10000)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    console.error('❌ All token refresh attempts failed:', lastError)
    return false
  }

  /**
   * Update auth cookies with new session data
   */
  private async updateAuthCookies(session: any) {
    try {
      // For server-side cookie updates
      if (typeof window === 'undefined') {
        const cookieStore = await cookies()
        
        cookieStore.set('auth-token', session.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 24 * 60 * 60 // 24 hours
        })
      }
    } catch (error) {
      console.error('Failed to update auth cookies:', error)
    }
  }

  /**
   * Ensure token is valid for a long-running operation
   */
  async ensureValidTokenForOperation(operationDurationMs: number): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        console.error('🔐 No active session for operation')
        return false
      }

      const expiresAt = new Date(session.expires_at! * 1000)
      const now = new Date()
      const timeUntilExpiry = expiresAt.getTime() - now.getTime()

      // If token won't last for the operation duration, refresh it
      if (timeUntilExpiry < operationDurationMs + this.config.refreshThresholdMs) {
        console.log(`🔐 Token won't last for ${Math.round(operationDurationMs / 1000 / 60)}min operation, refreshing...`)
        return await this.refreshToken()
      }

      return true
    } catch (error) {
      console.error('🔐 Error ensuring valid token:', error)
      return false
    }
  }

  /**
   * Get time until token expiry
   */
  async getTimeUntilExpiry(): Promise<number | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        return null
      }

      const expiresAt = new Date(session.expires_at! * 1000)
      const now = new Date()
      return Math.max(0, expiresAt.getTime() - now.getTime())
    } catch (error) {
      console.error('Error getting token expiry time:', error)
      return null
    }
  }

  /**
   * Get last refresh time
   */
  getLastRefreshTime(): Date | null {
    return this.lastRefreshTime
  }
}

// Export singleton instance
export const authRefreshManager = AuthRefreshManager.getInstance()

// Client-side helper for browser environments
export class ClientAuthRefreshManager {
  private static refreshTimer: number | null = null
  private static isRefreshing = false

  static startMonitoring() {
    if (typeof window === 'undefined') return

    // Clear any existing timer
    if (this.refreshTimer) {
      window.clearInterval(this.refreshTimer)
    }

    // Check every minute
    this.refreshTimer = window.setInterval(() => {
      this.checkAndRefresh()
    }, 60000)

    // Check immediately
    this.checkAndRefresh()
  }

  static stopMonitoring() {
    if (typeof window === 'undefined') return
    
    if (this.refreshTimer) {
      window.clearInterval(this.refreshTimer)
      this.refreshTimer = null
    }
  }

  private static async checkAndRefresh() {
    if (this.isRefreshing) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) return

      const expiresAt = new Date(session.expires_at! * 1000)
      const now = new Date()
      const timeUntilExpiry = expiresAt.getTime() - now.getTime()

      // Refresh if less than 5 minutes remaining
      if (timeUntilExpiry < 5 * 60 * 1000) {
        this.isRefreshing = true
        console.log('🔐 Client: Refreshing token...')
        
        const { error } = await supabase.auth.refreshSession()
        
        if (error) {
          console.error('❌ Client: Token refresh failed:', error)
        } else {
          console.log('✅ Client: Token refreshed')
        }
        
        this.isRefreshing = false
      }
    } catch (error) {
      console.error('Client auth refresh error:', error)
      this.isRefreshing = false
    }
  }
}