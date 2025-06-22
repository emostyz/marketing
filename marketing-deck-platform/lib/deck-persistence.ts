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
        userId: user.id.toString(),
        title: draft.title || 'Untitled Presentation',
        description: draft.description,
        slides: draft.slides || [],
        status: draft.status || 'draft',
        templateId: draft.templateId,
        dataSources: draft.dataSources || [],
        narrativeConfig: draft.narrativeConfig || {
          tone: 'professional',
          audience: 'executive',
          keyMessages: [],
          callToAction: ''
        },
        aiFeedback: draft.aiFeedback || {
          suggestions: [],
          improvements: [],
          confidence: 0
        },
        createdAt: draft.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastEditedAt: new Date().toISOString()
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
        lastEditedAt: new Date()
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
      lastEditedAt: new Date(data.last_edited_at || data.updated_at)
    }
  }

  // Set up auto-save interval for active drafts
  static setupAutoSave(draftId: string, getDraftData: () => Partial<DeckDraft>): () => void {
    const interval = setInterval(async () => {
      const draftData = getDraftData()
      if (draftData) {
        await this.autoSaveDraft(draftData)
      }
    }, 30000) // Auto-save every 30 seconds

    // Return cleanup function
    return () => clearInterval(interval)
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