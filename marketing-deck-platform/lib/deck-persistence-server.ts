import { supabase } from '@/lib/supabase/enhanced-client'
import { AuthSystem } from '@/lib/auth/auth-system'
import { DeckSlide, DeckDraft } from './deck-persistence'

/**
 * Server-side deck persistence utilities
 * These functions use server-only AuthSystem and can only be called from server components
 */
export class ServerDeckPersistence {
  // Load user's deck drafts (server-side)
  static async loadUserDrafts(): Promise<DeckDraft[]> {
    try {
      const user = await AuthSystem.getCurrentUser()
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

  // Load specific deck draft (server-side)
  static async loadDraft(draftId: string): Promise<DeckDraft | null> {
    try {
      const user = await AuthSystem.getCurrentUser()
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

  // Save deck draft (server-side)
  static async saveDraft(draft: Partial<DeckDraft>): Promise<DeckDraft | null> {
    try {
      const user = await AuthSystem.getCurrentUser()
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

  // Delete deck draft (server-side)
  static async deleteDraft(draftId: string): Promise<boolean> {
    try {
      const user = await AuthSystem.getCurrentUser()
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
}