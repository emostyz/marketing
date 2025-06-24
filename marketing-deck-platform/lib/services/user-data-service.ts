import { supabase } from '@/lib/supabase/enhanced-client'

export interface UserData {
  profile: any
  presentations: any[]
  dataImports: any[]
  analytics: any
  preferences: any[]
  activities: any[]
  collaborations: any[]
  subscription: any
}

export interface ActivityData {
  activity_type: string
  activity_subtype?: string
  resource_type?: string
  resource_id?: string
  metadata?: any
  duration_seconds?: number
}

export interface AnalyticsData {
  session_count?: number
  session_time_minutes?: number
  presentations_created?: number
  presentations_edited?: number
  presentations_viewed?: number
  data_files_uploaded?: number
  exports_generated?: number
  features_used?: any
  page_views?: any
}

export class UserDataService {
  // =====================================================
  // PROFILE MANAGEMENT
  // =====================================================

  static async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching user profile:', error)
      throw error
    }
  }

  static async updateUserProfile(userId: string, profileData: any) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  }

  static async updateUserStats(userId: string) {
    try {
      const { error } = await supabase.rpc('update_user_profile_stats', {
        user_uuid: userId
      })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error updating user stats:', error)
      throw error
    }
  }

  // =====================================================
  // PRESENTATION MANAGEMENT
  // =====================================================

  static async getUserPresentations(userId: string, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('presentations')
        .select('*')
        .eq('user_id', userId)
        // NOTE: last_edited_at column must exist in the presentations table
        .order('last_edited_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching user presentations:', error)
      throw error
    }
  }

  static async createPresentation(userId: string, presentationData: any) {
    try {
      const { data, error } = await supabase
        .from('presentations')
        .insert({
          user_id: userId,
          ...presentationData,
          analytics_data: {
            timeSpentEditing: 0,
            slidesCreated: 0,
            chartsAdded: 0,
            exportsGenerated: 0
          }
        })
        .select()
        .single()

      if (error) throw error

      // Track activity
      await this.trackUserActivity(userId, {
        activity_type: 'presentation_created',
        resource_type: 'presentation',
        resource_id: data.id,
        metadata: { title: presentationData.title }
      })

      return data
    } catch (error) {
      console.error('Error creating presentation:', error)
      throw error
    }
  }

  static async updatePresentation(presentationId: string, presentationData: any) {
    try {
      const { data, error } = await supabase
        .from('presentations')
        .update({
          ...presentationData,
          // NOTE: last_edited_at column must exist in the presentations table
          last_edited_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', presentationId)
        .select()
        .single()

      if (error) throw error

      // Track activity
      await this.trackUserActivity(data.user_id, {
        activity_type: 'presentation_updated',
        resource_type: 'presentation',
        resource_id: presentationId,
        metadata: { title: presentationData.title }
      })

      return data
    } catch (error) {
      console.error('Error updating presentation:', error)
      throw error
    }
  }

  static async incrementPresentationViews(presentationId: string) {
    try {
      const { error } = await supabase.rpc('increment_presentation_views', {
        presentation_uuid: presentationId
      })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error incrementing presentation views:', error)
      throw error
    }
  }

  // =====================================================
  // DATA IMPORTS MANAGEMENT
  // =====================================================

  static async getUserDataImports(userId: string, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('data_imports')
        .select('*')
        .eq('user_id', userId)
        .order('uploaded_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching user data imports:', error)
      throw error
    }
  }

  static async createDataImport(userId: string, importData: any) {
    try {
      const { data, error } = await supabase
        .from('data_imports')
        .insert({
          user_id: userId,
          ...importData,
          processing_status: 'pending',
          processing_progress: 0
        })
        .select()
        .single()

      if (error) throw error

      // Track activity
      await this.trackUserActivity(userId, {
        activity_type: 'data_import_created',
        resource_type: 'data_import',
        resource_id: data.id,
        metadata: { 
          file_name: importData.file_name,
          file_type: importData.file_type,
          file_size: importData.file_size
        }
      })

      return data
    } catch (error) {
      console.error('Error creating data import:', error)
      throw error
    }
  }

  static async updateDataImport(importId: string, importData: any) {
    try {
      const { data, error } = await supabase
        .from('data_imports')
        .update({
          ...importData,
          updated_at: new Date().toISOString()
        })
        .eq('id', importId)
        .select()
        .single()

      if (error) throw error

      // Track activity if processing completed
      if (importData.processing_status === 'completed') {
        await this.trackUserActivity(data.user_id, {
          activity_type: 'data_import_processed',
          resource_type: 'data_import',
          resource_id: importId,
          metadata: { 
            file_name: data.file_name,
            processing_time: Date.now() - new Date(data.uploaded_at).getTime()
          }
        })
      }

      return data
    } catch (error) {
      console.error('Error updating data import:', error)
      throw error
    }
  }

  // =====================================================
  // USER ACTIVITIES TRACKING
  // =====================================================

  static async trackUserActivity(userId: string, activityData: ActivityData) {
    try {
      const { error } = await supabase.rpc('track_user_activity', {
        user_uuid: userId,
        activity_type: activityData.activity_type,
        activity_subtype: activityData.activity_subtype,
        resource_type: activityData.resource_type,
        resource_id: activityData.resource_id,
        metadata: activityData.metadata || {}
      })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error tracking user activity:', error)
      // Don't throw error for activity tracking failures
      return false
    }
  }

  static async getUserActivities(userId: string, limit = 100) {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching user activities:', error)
      throw error
    }
  }

  // =====================================================
  // USER ANALYTICS
  // =====================================================

  static async updateUserAnalytics(userId: string, analyticsData: AnalyticsData) {
    try {
      const { error } = await supabase.rpc('update_user_analytics', {
        user_uuid: userId,
        session_count: analyticsData.session_count || 0,
        session_time_minutes: analyticsData.session_time_minutes || 0,
        presentations_created: analyticsData.presentations_created || 0,
        presentations_edited: analyticsData.presentations_edited || 0,
        presentations_viewed: analyticsData.presentations_viewed || 0,
        data_files_uploaded: analyticsData.data_files_uploaded || 0,
        exports_generated: analyticsData.exports_generated || 0
      })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error updating user analytics:', error)
      throw error
    }
  }

  static async getUserAnalytics(userId: string, days = 30) {
    try {
      const { data, error } = await supabase
        .from('user_analytics')
        .select('*')
        .eq('user_id', userId)
        .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching user analytics:', error)
      throw error
    }
  }

  // =====================================================
  // USER PREFERENCES
  // =====================================================

  static async getUserPreferences(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching user preferences:', error)
      throw error
    }
  }

  static async setUserPreference(userId: string, key: string, value: any, category = 'general') {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          preference_key: key,
          preference_value: value,
          preference_category: category,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error setting user preference:', error)
      throw error
    }
  }

  // =====================================================
  // USER FEEDBACK
  // =====================================================

  static async submitUserFeedback(userId: string, feedbackData: any) {
    try {
      const { data, error } = await supabase
        .from('user_feedback')
        .insert({
          user_id: userId,
          ...feedbackData
        })
        .select()
        .single()

      if (error) throw error

      // Track activity
      await this.trackUserActivity(userId, {
        activity_type: 'feedback_submitted',
        activity_subtype: feedbackData.feedback_type,
        metadata: { 
          feedback_id: data.id,
          rating: feedbackData.rating
        }
      })

      return data
    } catch (error) {
      console.error('Error submitting user feedback:', error)
      throw error
    }
  }

  static async getUserFeedback(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_feedback')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching user feedback:', error)
      throw error
    }
  }

  // =====================================================
  // USER COLLABORATIONS
  // =====================================================

  static async getUserCollaborations(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_collaborations')
        .select(`
          *,
          presentations (*),
          profiles!user_collaborations_collaborator_id_fkey (*)
        `)
        .or(`user_id.eq.${userId},collaborator_id.eq.${userId}`)

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching user collaborations:', error)
      throw error
    }
  }

  static async createCollaboration(collaborationData: any) {
    try {
      const { data, error } = await supabase
        .from('user_collaborations')
        .insert(collaborationData)
        .select()
        .single()

      if (error) throw error

      // Track activity
      await this.trackUserActivity(collaborationData.user_id, {
        activity_type: 'collaboration_invited',
        resource_type: 'presentation',
        resource_id: collaborationData.presentation_id,
        metadata: { 
          collaborator_id: collaborationData.collaborator_id,
          role: collaborationData.role
        }
      })

      return data
    } catch (error) {
      console.error('Error creating collaboration:', error)
      throw error
    }
  }

  // =====================================================
  // SUBSCRIPTION MANAGEMENT
  // =====================================================

  static async getUserSubscription(userId: string) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data
    } catch (error) {
      console.error('Error fetching user subscription:', error)
      throw error
    }
  }

  static async updateSubscriptionUsage(userId: string, usageData: any) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          current_usage: usageData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('status', 'active')
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating subscription usage:', error)
      throw error
    }
  }

  // =====================================================
  // COMPREHENSIVE USER DATA RETRIEVAL
  // =====================================================

  static async getUserDashboardData(userId: string): Promise<UserData> {
    try {
      const { data, error } = await supabase.rpc('get_user_dashboard_data', {
        user_uuid: userId
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching user dashboard data:', error)
      throw error
    }
  }

  static async getAllUserData(userId: string): Promise<UserData> {
    try {
      const [
        profile,
        presentations,
        dataImports,
        analytics,
        preferences,
        activities,
        collaborations,
        subscription
      ] = await Promise.all([
        this.getUserProfile(userId),
        this.getUserPresentations(userId),
        this.getUserDataImports(userId),
        this.getUserAnalytics(userId),
        this.getUserPreferences(userId),
        this.getUserActivities(userId),
        this.getUserCollaborations(userId),
        this.getUserSubscription(userId).catch(() => null)
      ])

      return {
        profile,
        presentations,
        dataImports,
        analytics,
        preferences,
        activities,
        collaborations,
        subscription
      }
    } catch (error) {
      console.error('Error fetching all user data:', error)
      throw error
    }
  }

  // =====================================================
  // API USAGE TRACKING
  // =====================================================

  static async trackApiUsage(userId: string, endpoint: string, method: string, tokens = 0, cost = 0) {
    try {
      // NOTE: track_api_usage function must exist in the database with the following signature:
      //   user_uuid UUID, endpoint_path TEXT, request_method TEXT, tokens_consumed INTEGER, cost NUMERIC
      const { error } = await supabase.rpc('track_api_usage', {
        user_uuid: userId,
        endpoint_path: endpoint,
        request_method: method,
        tokens_consumed: tokens,
        cost: cost
      })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error tracking API usage:', error)
      // Don't throw error for API tracking failures
      return false
    }
  }

  // =====================================================
  // UTILITY FUNCTIONS
  // =====================================================

  static async getUserStats(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_dashboard')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching user stats:', error)
      throw error
    }
  }

  static async searchUserData(userId: string, query: string) {
    try {
      const [presentations, dataImports] = await Promise.all([
        supabase
          .from('presentations')
          .select('id, title, description, created_at')
          .eq('user_id', userId)
          .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(10),
        supabase
          .from('data_imports')
          .select('id, file_name, description, uploaded_at')
          .eq('user_id', userId)
          .or(`file_name.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(10)
      ])

      return {
        presentations: presentations.data || [],
        dataImports: dataImports.data || []
      }
    } catch (error) {
      console.error('Error searching user data:', error)
      throw error
    }
  }
}

export default UserDataService 