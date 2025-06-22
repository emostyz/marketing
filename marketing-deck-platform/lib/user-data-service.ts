'use client'

import { createClientComponentClient } from '@/lib/supabase/client'
import { DeckPersistence, DeckDraft } from './deck-persistence'
import { CSVStorage, CSVFileData } from './csv-storage'

export interface UserDataSummary {
  // Presentations
  presentations: {
    total: number
    draft: number
    completed: number
    archived: number
    recentPresentations: DeckDraft[]
  }
  
  // Data Files
  dataFiles: {
    total: number
    totalSizeMB: number
    recentFiles: CSVFileData[]
  }
  
  // User Context & Preferences
  userContext: {
    presentationStyle?: string
    industry?: string
    primaryGoal?: string
    businessChallenges?: string[]
    dataTypes?: string[]
    currentTools?: string[]
  }
  
  // Recent Activity
  recentActivity: {
    lastLogin?: string
    lastPresentationEdit?: string
    lastDataUpload?: string
  }
  
  // Usage Stats
  usageStats: {
    thisMonth: {
      presentationsCreated: number
      dataUploads: number
      exports: number
    }
    allTime: {
      presentationsCreated: number
      dataUploads: number
    }
  }
}

export class UserDataService {
  private supabase = createClientComponentClient()
  private deckPersistence = new DeckPersistence()
  private csvStorage = new CSVStorage()

  // Get comprehensive user data for dashboard
  async getUserDashboardData(): Promise<{ success: boolean; data?: UserDataSummary; error?: string }> {
    try {
      // Fetch all data in parallel
      const [
        userDecks,
        userFiles,
        userProfile,
        deckStats,
        fileStats,
        usageData
      ] = await Promise.all([
        DeckPersistence.loadUserDrafts(),
        this.csvStorage.getUserCSVFiles(),
        this.getUserProfile(),
        this.getDeckStatistics(),
        this.csvStorage.getStorageStats(),
        this.getUsageStatistics()
      ])

      // Process presentations data
      const presentations = {
        total: userDecks.length,
        draft: userDecks.filter(d => d.status === 'draft').length,
        completed: userDecks.filter(d => d.status === 'completed').length,
        archived: userDecks.filter(d => d.status === 'archived').length,
        recentPresentations: userDecks.slice(0, 5) // Most recent 5
      }

      // Process data files
      const dataFiles = {
        total: fileStats.success ? fileStats.data?.totalFiles || 0 : 0,
        totalSizeMB: fileStats.success ? fileStats.data?.totalSizeMB || 0 : 0,
        recentFiles: userFiles.success ? (userFiles.data || []).slice(0, 5) : []
      }

      // Extract user context from profile
      const userContext = {
        presentationStyle: userProfile?.presentation_style,
        industry: userProfile?.industry,
        primaryGoal: userProfile?.primary_goal,
        businessChallenges: userProfile?.business_challenges || [],
        dataTypes: userProfile?.data_types || [],
        currentTools: userProfile?.current_tools || []
      }

      // Recent activity
      const recentActivity = {
        lastLogin: userProfile?.last_login_at,
        lastPresentationEdit: userDecks[0]?.lastEditedAt?.toISOString(),
        lastDataUpload: dataFiles.recentFiles[0]?.upload_date
      }

      // Usage statistics
      const usageStats = {
        thisMonth: {
          presentationsCreated: deckStats.success ? deckStats.data?.thisMonth || 0 : 0,
          dataUploads: fileStats.success ? fileStats.data?.filesThisMonth || 0 : 0,
          exports: usageData?.exportsThisMonth || 0
        },
        allTime: {
          presentationsCreated: presentations.total,
          dataUploads: dataFiles.total
        }
      }

      const dashboardData: UserDataSummary = {
        presentations,
        dataFiles,
        userContext,
        recentActivity,
        usageStats
      }

      return { success: true, data: dashboardData }
    } catch (error) {
      console.error('Error getting user dashboard data:', error)
      return { success: false, error: 'Failed to load dashboard data' }
    }
  }

  // Get user profile from profiles table
  private async getUserProfile(): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
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

  // Get deck statistics
  private async getDeckStatistics(): Promise<{ success: boolean; data?: any }> {
    try {
      const { data, error } = await this.supabase
        .from('presentations')
        .select('status, created_at')

      if (error) {
        return { success: false }
      }

      const now = new Date()
      const thisMonth = data?.filter(d => {
        const created = new Date(d.created_at)
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
      }).length || 0

      return {
        success: true,
        data: { thisMonth }
      }
    } catch (error) {
      return { success: false }
    }
  }

  // Get usage statistics from usage_tracking table
  private async getUsageStatistics(): Promise<any> {
    try {
      const now = new Date()
      const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

      const { data, error } = await this.supabase
        .from('usage_tracking')
        .select('*')
        .eq('month_year', monthYear)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error getting usage statistics:', error)
        return {}
      }

      return data || {}
    } catch (error) {
      console.error('Error getting usage statistics:', error)
      return {}
    }
  }

  // Save user context/preferences
  async saveUserContext(contextType: string, contextKey: string, contextValue: any): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('user_context')
        .upsert({
          context_type: contextType,
          context_key: contextKey,
          context_value: contextValue,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,context_type,context_key'
        })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Failed to save user context' }
    }
  }

  // Get user context by type
  async getUserContext(contextType: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('user_context')
        .select('context_key, context_value')
        .eq('context_type', contextType)

      if (error) {
        return { success: false, error: error.message }
      }

      // Convert to key-value object
      const contextData = data?.reduce((acc, item) => {
        acc[item.context_key] = item.context_value
        return acc
      }, {} as any) || {}

      return { success: true, data: contextData }
    } catch (error) {
      return { success: false, error: 'Failed to get user context' }
    }
  }

  // Update usage tracking
  async updateUsageTracking(type: 'presentations' | 'data_uploads' | 'exports', increment: number = 1): Promise<{ success: boolean; error?: string }> {
    try {
      const now = new Date()
      const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

      const updateField = type === 'presentations' ? 'presentations_created' :
                          type === 'data_uploads' ? 'data_uploads' :
                          'exports_generated'

      const { error } = await this.supabase
        .from('usage_tracking')
        .upsert({
          month_year: monthYear,
          [updateField]: increment,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,month_year'
        })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Failed to update usage tracking' }
    }
  }

  // Search across all user data (presentations and files)
  async globalSearch(query: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const [presentationsResult, filesResult] = await Promise.all([
        DeckPersistence.loadUserDrafts(),
        this.csvStorage.searchCSVFiles(query)
      ])

      // Filter presentations by query
      const filteredPresentations = presentationsResult.filter(p =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(query.toLowerCase()))
      )

      const results = {
        presentations: filteredPresentations,
        files: filesResult.success ? filesResult.data || [] : [],
        totalResults: filteredPresentations.length + (filesResult.success ? filesResult.data?.length || 0 : 0)
      }

      return { success: true, data: results }
    } catch (error) {
      return { success: false, error: 'Search failed' }
    }
  }

  // Get recent activity feed
  async getRecentActivity(limit: number = 10): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      // Get recent presentations and files
      const [presentations, files] = await Promise.all([
        DeckPersistence.loadUserDrafts(),
        this.csvStorage.getUserCSVFiles()
      ])

      const activities: any[] = []

      // Add presentation activities
      presentations.slice(0, limit).forEach(p => {
        activities.push({
          type: 'presentation',
          action: p.status === 'draft' ? 'edited' : 'completed',
          title: p.title,
          description: p.description,
          timestamp: p.lastEditedAt,
          id: p.id
        })
      })

      // Add file upload activities
      if (files.success && files.data) {
        files.data.slice(0, limit).forEach(f => {
          activities.push({
            type: 'file',
            action: 'uploaded',
            title: f.original_filename,
            description: f.description,
            timestamp: new Date(f.upload_date!),
            id: f.id
          })
        })
      }

      // Sort by timestamp and limit
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      const recentActivities = activities.slice(0, limit)

      return { success: true, data: recentActivities }
    } catch (error) {
      return { success: false, error: 'Failed to get recent activity' }
    }
  }
}

// React hook for user data service
export function useUserDataService() {
  return new UserDataService()
}