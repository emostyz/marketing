import { supabase } from '@/lib/supabase/enhanced-client'
import { ClientAuth, User } from '@/lib/auth/client-auth'

export interface DeckSlide {
  id: string
  type: 'title' | 'content' | 'chart' | 'data' | 'summary'
  title: string
  content: string
  chartData?: any
  chartType?: string
  chartConfig?: any
  order: number
  metadata?: any
}

export interface DeckDraft {
  id: string
  userId: string
  title: string
  description?: string
  slides: DeckSlide[]
  status: 'draft' | 'in_progress' | 'completed' | 'published'
  templateId?: string
  dataSources: any[]
  narrativeConfig: {
    tone: string
    audience: string
    keyMessages: string[]
    callToAction?: string
  }
  aiFeedback: {
    suggestions: string[]
    improvements: string[]
    confidence: number
  }
  createdAt: Date
  updatedAt: Date
  lastEditedAt: Date
}

export interface ChartGenerationRequest {
  slideId: string
  dataType: string
  chartType: string
  data: any[]
  userPreferences: {
    chartStyles: string[]
    colorSchemes: string[]
    narrativeStyle: string
  }
  businessContext: string
}

export interface ChartGenerationResponse {
  success: boolean
  chartData?: any
  chartConfig?: any
  narrative?: string
  suggestions?: string[]
  error?: string
}

export class DeckPersistence {
  // Save deck draft
  static async saveDraft(draft: Partial<DeckDraft>): Promise<DeckDraft | null> {
    try {
      const user = await ClientAuth.createUserFromSession()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const draftData = {
        id: draft.id || crypto.randomUUID(),
        user_id: user.id.toString(),
        title: draft.title || 'Untitled Presentation',
        description: draft.description,
        slides: draft.slides || [],
        status: draft.status || 'draft',
        template_id: draft.templateId,
        data_sources: draft.dataSources || [],
        narrative_config: draft.narrativeConfig || {
          tone: 'professional',
          audience: 'executive',
          keyMessages: [],
          callToAction: ''
        },
        ai_feedback: draft.aiFeedback || {
          suggestions: [],
          improvements: [],
          confidence: 0
        },
        created_at: draft.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('presentations')
        .upsert(draftData, { onConflict: 'id' })
        .select()
        .single()

      if (error) {
        console.error('Error saving draft:', error)
        return null
      }

      return this.mapToDeckDraft(data)
    } catch (error) {
      console.error('Error saving draft:', error)
      return null
    }
  }

  // Load user's deck drafts
  static async loadUserDrafts(): Promise<DeckDraft[]> {
    try {
      const user = await ClientAuth.createUserFromSession()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('presentations')
        .select('*')
        .eq('user_id', user.id.toString())
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error loading drafts:', error)
        return []
      }

      return data.map(item => this.mapToDeckDraft(item))
    } catch (error) {
      console.error('Error loading drafts:', error)
      return []
    }
  }

  // Load specific deck draft
  static async loadDraft(draftId: string): Promise<DeckDraft | null> {
    try {
      const user = await ClientAuth.createUserFromSession()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('presentations')
        .select('*')
        .eq('id', draftId)
        .eq('user_id', user.id.toString())
        .single()

      if (error) {
        console.error('Error loading draft:', error)
        return null
      }

      return this.mapToDeckDraft(data)
    } catch (error) {
      console.error('Error loading draft:', error)
      return null
    }
  }

  // Delete deck draft
  static async deleteDraft(draftId: string): Promise<boolean> {
    try {
      const user = await ClientAuth.createUserFromSession()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { error } = await supabase
        .from('presentations')
        .delete()
        .eq('id', draftId)
        .eq('user_id', user.id.toString())

      if (error) {
        console.error('Error deleting draft:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error deleting draft:', error)
      return false
    }
  }

  // Auto-save draft (called periodically during editing)
  static async autoSaveDraft(draft: Partial<DeckDraft>): Promise<boolean> {
    try {
      const savedDraft = await this.saveDraft({
        ...draft,
        updatedAt: new Date()
      })
      return savedDraft !== null
    } catch (error) {
      console.error('Error auto-saving draft:', error)
      return false
    }
  }

  // Generate chart using OpenAI
  static async generateChart(request: ChartGenerationRequest): Promise<ChartGenerationResponse> {
    try {
      const response = await fetch('/api/openai/chart-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slideId: request.slideId,
          dataType: request.dataType,
          chartType: request.chartType,
          data: request.data,
          userPreferences: request.userPreferences,
          businessContext: request.businessContext
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate chart')
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error generating chart:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Chart generation failed'
      }
    }
  }

  // Get AI feedback for entire deck
  static async getDeckFeedback(draft: DeckDraft): Promise<any> {
    try {
      const response = await fetch('/api/openai/content-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slides: draft.slides,
          narrativeConfig: draft.narrativeConfig,
          businessContext: draft.narrativeConfig.audience
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get deck feedback')
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error getting deck feedback:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Feedback generation failed'
      }
    }
  }

  // Update slide with AI-generated content
  static async updateSlideWithAI(slideId: string, aiContent: any): Promise<boolean> {
    try {
      const response = await fetch('/api/openai/slide-qa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slideId,
          aiContent,
          action: 'update'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update slide with AI')
      }

      return true
    } catch (error) {
      console.error('Error updating slide with AI:', error)
      return false
    }
  }

  // Get presentation analytics
  static async getPresentationAnalytics(draftId: string): Promise<any> {
    try {
      const response = await fetch(`/api/presentations/${draftId}/analytics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('Failed to get presentation analytics')
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error getting presentation analytics:', error)
      return null
    }
  }

  // Export deck to various formats
  static async exportDeck(draftId: string, format: 'pdf' | 'pptx' | 'html'): Promise<any> {
    try {
      const response = await fetch(`/api/export/${format}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ draftId })
      })

      if (!response.ok) {
        throw new Error(`Failed to export deck to ${format}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error(`Error exporting deck to ${format}:`, error)
      return null
    }
  }

  // Helper method to map database data to DeckDraft
  private static mapToDeckDraft(data: any): DeckDraft {
    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      description: data.description,
      slides: data.slides || [],
      status: data.status || 'draft',
      templateId: data.template_id,
      dataSources: data.data_sources || [],
      narrativeConfig: data.narrative_config || {
        tone: 'professional',
        audience: 'executive',
        keyMessages: [],
        callToAction: ''
      },
      aiFeedback: data.ai_feedback || {
        suggestions: [],
        improvements: [],
        confidence: 0
      },
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      lastEditedAt: new Date(data.updated_at) // Use updated_at since last_edited_at doesn't exist
    }
  }

  // Set up auto-save interval for active drafts (10 seconds)
  static setupAutoSave(draftId: string, getDraftData: () => Partial<DeckDraft>): () => void {
    let lastSavedContent = ''
    
    const interval = setInterval(async () => {
      const draftData = getDraftData()
      if (draftData) {
        const currentContent = JSON.stringify(draftData)
        
        // Only save if content has changed
        if (currentContent !== lastSavedContent) {
          const success = await this.autoSaveDraft(draftData)
          if (success) {
            lastSavedContent = currentContent
            console.log('Auto-saved deck:', draftId, new Date().toLocaleTimeString())
          }
        }
      }
    }, 10000) // Auto-save every 10 seconds

    // Return cleanup function
    return () => clearInterval(interval)
  }

  // Enhanced auto-save that also saves to our new autosave table
  static async enhancedAutoSave(draftId: string, content: any): Promise<boolean> {
    try {
      // Save to main presentations table
      const mainSaveSuccess = await this.autoSaveDraft({
        id: draftId,
        slides: content.slides,
        narrativeConfig: content.narrativeConfig,
        updatedAt: new Date()
      })

      // Get current user for autosave table
      const user = await ClientAuth.createUserFromSession()
      if (!user) {
        return mainSaveSuccess
      }

      // Also save to autosaves table for versioning
      const { error } = await supabase
        .from('presentation_autosaves')
        .insert({
          presentation_id: draftId,
          user_id: user.id.toString(),
          content,
          saved_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error saving to autosaves table:', error)
        // Still return true if main save succeeded
        return mainSaveSuccess
      }

      return mainSaveSuccess
    } catch (error) {
      console.error('Error in enhanced auto-save:', error)
      return false
    }
  }

  // Get auto-save history for a presentation
  static async getAutoSaveHistory(draftId: string, limit: number = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('presentation_autosaves')
        .select('content, saved_at')
        .eq('presentation_id', draftId)
        .order('saved_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error getting auto-save history:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error getting auto-save history:', error)
      return []
    }
  }

  // Restore from auto-save
  static async restoreFromAutoSave(draftId: string, autoSaveId?: string): Promise<DeckDraft | null> {
    try {
      let query = supabase
        .from('presentation_autosaves')
        .select('content')
        .eq('presentation_id', draftId)

      if (autoSaveId) {
        query = query.eq('id', autoSaveId)
      } else {
        query = query.order('saved_at', { ascending: false }).limit(1)
      }

      const { data, error } = await query.single()

      if (error) {
        console.error('Error restoring from auto-save:', error)
        return null
      }

      // Update the main presentation with the auto-saved content
      const restored = await this.saveDraft({
        id: draftId,
        ...data.content
      })

      return restored
    } catch (error) {
      console.error('Error restoring from auto-save:', error)
      return null
    }
  }

  // Track user activity for analytics
  static async trackUserActivity(action: string, metadata: any = {}): Promise<void> {
    try {
      const user = await ClientAuth.createUserFromSession()
      if (!user) return

      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          action,
          metadata,
          timestamp: new Date().toISOString()
        })
      })
    } catch (error) {
      console.error('Error tracking user activity:', error)
    }
  }
} 