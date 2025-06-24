import { supabase as clientSupabase } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/client'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export interface ProfileServiceOptions {
  enableCache?: boolean
  cacheTimeout?: number
  enableLogging?: boolean
}

export class ProfileService {
  private cache = new Map<string, { data: Profile; timestamp: number }>()
  private options: Required<ProfileServiceOptions>
  private supabase: any

  constructor(options: ProfileServiceOptions = {}, supabaseClient: any = clientSupabase) {
    this.options = {
      enableCache: options.enableCache ?? true,
      cacheTimeout: options.cacheTimeout ?? 5 * 60 * 1000, // 5 minutes
      enableLogging: options.enableLogging ?? true
    }
    this.supabase = supabaseClient
  }

  private log(message: string, data?: any) {
    if (this.options.enableLogging) {
      console.log(`[ProfileService] ${message}`, data || '')
    }
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.options.cacheTimeout
  }

  /**
   * Retrieve user profile from database or cache
   */
  async retrieveProfile(userId: string): Promise<Profile | null> {
    try {
      // Check cache first
      if (this.options.enableCache) {
        const cached = this.cache.get(userId)
        if (cached && this.isCacheValid(cached.timestamp)) {
          this.log(`Retrieved profile from cache for user ${userId}`)
          return cached.data
        }
      }

      // Fetch from database
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        this.log(`Error retrieving profile for user ${userId}:`, error)
        return null
      }

      // Update cache
      if (this.options.enableCache && data) {
        this.cache.set(userId, { data, timestamp: Date.now() })
      }

      this.log(`Retrieved profile from database for user ${userId}`)
      return data
    } catch (error) {
      this.log(`Exception retrieving profile for user ${userId}:`, error)
      return null
    }
  }

  /**
   * Sync profile data with external sources (if any)
   */
  async syncProfile(userId: string): Promise<Profile | null> {
    try {
      this.log(`Starting profile sync for user ${userId}`)
      
      // Get current profile
      const currentProfile = await this.retrieveProfile(userId)
      if (!currentProfile) {
        this.log(`No profile found for user ${userId}, cannot sync`)
        return null
      }

      // Get user data from auth
      const { data: { user }, error: userError } = await this.supabase.auth.getUser()
      if (userError || !user) {
        this.log(`Error getting user data for sync:`, userError)
        return currentProfile
      }

      // Check if we need to sync email or other auth data
      const updates: Partial<ProfileUpdate> = {}
      let hasUpdates = false

      if (user.email !== currentProfile.email) {
        updates.email = user.email
        hasUpdates = true
      }

      // Check user metadata for name updates
      const userMeta = user.user_metadata || {}
      const fullName = userMeta.full_name || userMeta.name
      if (fullName && fullName !== currentProfile.full_name) {
        updates.full_name = fullName
        hasUpdates = true
      }

      if (userMeta.first_name && userMeta.first_name !== currentProfile.first_name) {
        updates.first_name = userMeta.first_name
        hasUpdates = true
      }

      if (userMeta.last_name && userMeta.last_name !== currentProfile.last_name) {
        updates.last_name = userMeta.last_name
        hasUpdates = true
      }

      // Update if needed
      if (hasUpdates) {
        this.log(`Syncing profile updates for user ${userId}:`, updates)
        const updatedProfile = await this.updateProfile(userId, updates)
        return updatedProfile
      }

      this.log(`Profile sync completed for user ${userId} - no updates needed`)
      return currentProfile
    } catch (error) {
      this.log(`Exception during profile sync for user ${userId}:`, error)
      return await this.retrieveProfile(userId)
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile | null> {
    try {
      this.log(`Updating profile for user ${userId}:`, updates)

      // Ensure updated_at is set
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await this.supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        this.log(`Error updating profile for user ${userId}:`, error)
        return null
      }

      // Update cache
      if (this.options.enableCache && data) {
        this.cache.set(userId, { data, timestamp: Date.now() })
      }

      this.log(`Successfully updated profile for user ${userId}`)
      return data
    } catch (error) {
      this.log(`Exception updating profile for user ${userId}:`, error)
      return null
    }
  }

  /**
   * Create new user profile
   */
  async createProfile(profileData: ProfileInsert): Promise<Profile | null> {
    try {
      this.log(`Creating profile for user ${profileData.user_id}`)

      const { data, error } = await this.supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single()

      if (error) {
        this.log(`Error creating profile for user ${profileData.user_id}:`, error)
        return null
      }

      // Update cache
      if (this.options.enableCache && data) {
        this.cache.set(profileData.user_id, { data, timestamp: Date.now() })
      }

      this.log(`Successfully created profile for user ${profileData.user_id}`)
      return data
    } catch (error) {
      this.log(`Exception creating profile for user ${profileData.user_id}:`, error)
      return null
    }
  }

  /**
   * Get or create profile (retrieve/sync/update flywheel)
   */
  async getOrCreateProfile(userId: string, defaultData?: Partial<ProfileInsert>): Promise<Profile | null> {
    try {
      // Step 1: Retrieve
      let profile = await this.retrieveProfile(userId)

      if (!profile) {
        // Step 2: Create if doesn't exist
        this.log(`Profile not found for user ${userId}, creating new profile`)
        
        const { data: { user } } = await this.supabase.auth.getUser()
        if (!user) {
          this.log(`No authenticated user found for profile creation`)
          return null
        }

        const profileData: ProfileInsert = {
          user_id: userId,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name,
          first_name: user.user_metadata?.first_name,
          last_name: user.user_metadata?.last_name,
          ...defaultData
        }

        profile = await this.createProfile(profileData)
        if (!profile) {
          this.log(`Failed to create profile for user ${userId}`)
          return null
        }
      } else {
        // Step 3: Sync existing profile
        profile = await this.syncProfile(userId)
      }

      return profile
    } catch (error) {
      this.log(`Exception in getOrCreateProfile for user ${userId}:`, error)
      return null
    }
  }

  /**
   * Update profile with validation and error handling
   */
  async updateProfileWithValidation(
    userId: string, 
    updates: ProfileUpdate,
    validationRules?: {
      maxLengths?: Record<string, number>
      requiredFields?: string[]
    }
  ): Promise<{ success: boolean; profile?: Profile; errors?: string[] }> {
    try {
      const errors: string[] = []

      // Validation
      if (validationRules) {
        // Check required fields
        if (validationRules.requiredFields) {
          for (const field of validationRules.requiredFields) {
            if (!updates[field as keyof ProfileUpdate]) {
              errors.push(`${field} is required`)
            }
          }
        }

        // Check max lengths
        if (validationRules.maxLengths) {
          for (const [field, maxLength] of Object.entries(validationRules.maxLengths)) {
            const value = updates[field as keyof ProfileUpdate]
            if (typeof value === 'string' && value.length > maxLength) {
              errors.push(`${field} must be less than ${maxLength} characters`)
            }
          }
        }
      }

      if (errors.length > 0) {
        return { success: false, errors }
      }

      const profile = await this.updateProfile(userId, updates)
      if (!profile) {
        return { success: false, errors: ['Failed to update profile'] }
      }

      return { success: true, profile }
    } catch (error) {
      this.log(`Exception in updateProfileWithValidation for user ${userId}:`, error)
      return { success: false, errors: ['Internal server error'] }
    }
  }

  /**
   * Clear cache for a specific user or all users
   */
  clearCache(userId?: string): void {
    if (userId) {
      this.cache.delete(userId)
      this.log(`Cleared cache for user ${userId}`)
    } else {
      this.cache.clear()
      this.log('Cleared all profile cache')
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; entries: Array<{ userId: string; age: number }> } {
    const entries = Array.from(this.cache.entries()).map(([userId, { timestamp }]) => ({
      userId,
      age: Date.now() - timestamp
    }))

    return {
      size: this.cache.size,
      entries
    }
  }
}

// Export singleton instance
const profileService = new ProfileService({}, clientSupabase)

// Export convenience functions
export const getProfile = (userId: string) => profileService.retrieveProfile(userId)
export const updateProfile = (userId: string, updates: ProfileUpdate) => profileService.updateProfile(userId, updates)
export const createProfile = (profileData: ProfileInsert) => profileService.createProfile(profileData)
export const getOrCreateProfile = (userId: string, defaultData?: Partial<ProfileInsert>) => profileService.getOrCreateProfile(userId, defaultData)
