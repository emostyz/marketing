// Enhanced presentation persistence service with real database integration

import { createServerSupabaseClient } from '@/lib/supabase/server-client'

export interface PresentationData {
  id: string
  title: string
  description?: string
  slides: any[]
  metadata: {
    created_at: string
    updated_at: string
    user_id: string
    version: number
    template_id?: string
    dataset_id?: string
    ai_generated: boolean
    slide_count: number
    quality_score?: number
    status: 'draft' | 'published' | 'archived'
  }
  settings: {
    theme: string
    transitions: boolean
    auto_advance: boolean
    presentation_mode: 'slideshow' | 'scroll'
  }
}

export class EnhancedPresentationService {
  private supabase: any
  private isServer: boolean

  constructor(isServer = false) {
    this.isServer = isServer
  }

  private async getSupabaseClient() {
    if (!this.supabase) {
      if (this.isServer) {
        this.supabase = await createServerSupabaseClient()
      } else {
        // For client-side, import dynamically
        const { createBrowserSupabaseClient } = await import('@/lib/supabase/browser-client')
        this.supabase = createBrowserSupabaseClient()
      }
    }
    return this.supabase
  }

  // Save presentation to database
  async savePresentation(presentation: PresentationData): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const supabase = await this.getSupabaseClient()
      
      // Prepare presentation data for database
      const presentationData = {
        id: presentation.id,
        title: presentation.title,
        description: presentation.description,
        slides: presentation.slides,
        user_id: presentation.metadata.user_id,
        template_id: presentation.metadata.template_id,
        dataset_id: presentation.metadata.dataset_id,
        slide_count: presentation.slides.length,
        quality_score: presentation.metadata.quality_score || 85,
        status: presentation.metadata.status,
        ai_generated: presentation.metadata.ai_generated,
        version: presentation.metadata.version,
        settings: presentation.settings,
        created_at: presentation.metadata.created_at,
        updated_at: new Date().toISOString()
      }

      // Upsert presentation (insert or update)
      const { data, error } = await supabase
        .from('presentations')
        .upsert(presentationData, {
          onConflict: 'id',
          ignoreDuplicates: false
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Failed to save presentation:', error)
        return { success: false, error: error.message }
      }

      console.log('✅ Presentation saved successfully:', data.id)
      return { success: true, id: data.id }

    } catch (error: any) {
      console.error('❌ Save presentation error:', error)
      return { success: false, error: error.message }
    }
  }

  // Load presentation from database
  async loadPresentation(presentationId: string, userId: string): Promise<{ success: boolean; data?: PresentationData; error?: string }> {
    try {
      const supabase = await this.getSupabaseClient()

      const { data, error } = await supabase
        .from('presentations')
        .select('*')
        .eq('id', presentationId)
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('❌ Failed to load presentation:', error)
        return { success: false, error: error.message }
      }

      if (!data) {
        return { success: false, error: 'Presentation not found' }
      }

      // Transform database data to PresentationData format
      const presentation: PresentationData = {
        id: data.id,
        title: data.title,
        description: data.description,
        slides: data.slides || [],
        metadata: {
          created_at: data.created_at,
          updated_at: data.updated_at,
          user_id: data.user_id,
          version: data.version || 1,
          template_id: data.template_id,
          dataset_id: data.dataset_id,
          ai_generated: data.ai_generated || false,
          slide_count: data.slide_count || 0,
          quality_score: data.quality_score,
          status: data.status || 'draft'
        },
        settings: data.settings || {
          theme: 'professional',
          transitions: true,
          auto_advance: false,
          presentation_mode: 'slideshow'
        }
      }

      console.log('✅ Presentation loaded successfully:', presentation.id)
      return { success: true, data: presentation }

    } catch (error: any) {
      console.error('❌ Load presentation error:', error)
      return { success: false, error: error.message }
    }
  }

  // Get all presentations for a user
  async getUserPresentations(userId: string): Promise<{ success: boolean; data?: PresentationData[]; error?: string }> {
    try {
      const supabase = await this.getSupabaseClient()

      const { data, error } = await supabase
        .from('presentations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('❌ Failed to load user presentations:', error)
        return { success: false, error: error.message }
      }

      const presentations: PresentationData[] = (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        slides: item.slides || [],
        metadata: {
          created_at: item.created_at,
          updated_at: item.updated_at,
          user_id: item.user_id,
          version: item.version || 1,
          template_id: item.template_id,
          dataset_id: item.dataset_id,
          ai_generated: item.ai_generated || false,
          slide_count: item.slide_count || 0,
          quality_score: item.quality_score,
          status: item.status || 'draft'
        },
        settings: item.settings || {
          theme: 'professional',
          transitions: true,
          auto_advance: false,
          presentation_mode: 'slideshow'
        }
      }))

      console.log(`✅ Loaded ${presentations.length} presentations for user ${userId}`)
      return { success: true, data: presentations }

    } catch (error: any) {
      console.error('❌ Load user presentations error:', error)
      return { success: false, error: error.message }
    }
  }

  // Delete presentation
  async deletePresentation(presentationId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = await this.getSupabaseClient()

      const { error } = await supabase
        .from('presentations')
        .delete()
        .eq('id', presentationId)
        .eq('user_id', userId)

      if (error) {
        console.error('❌ Failed to delete presentation:', error)
        return { success: false, error: error.message }
      }

      console.log('✅ Presentation deleted successfully:', presentationId)
      return { success: true }

    } catch (error: any) {
      console.error('❌ Delete presentation error:', error)
      return { success: false, error: error.message }
    }
  }

  // Create new presentation from deck generation
  static createPresentationFromDeck(deckData: {
    deckId: string
    title: string
    slides: any[]
    userId: string
    datasetId?: string
    templateId?: string
    qualityScore?: number
  }): PresentationData {
    const now = new Date().toISOString()
    
    return {
      id: deckData.deckId,
      title: deckData.title,
      description: `AI-generated presentation with ${deckData.slides.length} slides`,
      slides: deckData.slides,
      metadata: {
        created_at: now,
        updated_at: now,
        user_id: deckData.userId,
        version: 1,
        template_id: deckData.templateId,
        dataset_id: deckData.datasetId,
        ai_generated: true,
        slide_count: deckData.slides.length,
        quality_score: deckData.qualityScore || 85,
        status: 'draft'
      },
      settings: {
        theme: 'professional',
        transitions: true,
        auto_advance: false,
        presentation_mode: 'slideshow'
      }
    }
  }

  // Auto-save functionality for drafts
  async autoSavePresentation(presentation: PresentationData): Promise<void> {
    try {
      // Update version and timestamp
      presentation.metadata.version += 1
      presentation.metadata.updated_at = new Date().toISOString()
      
      await this.savePresentation(presentation)
      console.log('✅ Auto-saved presentation:', presentation.id)
    } catch (error) {
      console.error('❌ Auto-save failed:', error)
    }
  }

  // Backup to localStorage as fallback
  backupToLocalStorage(presentation: PresentationData): void {
    try {
      const key = `presentation-backup-${presentation.id}`
      const data = {
        presentation,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem(key, JSON.stringify(data))
      console.log('✅ Presentation backed up to localStorage')
    } catch (error) {
      console.error('❌ localStorage backup failed:', error)
    }
  }

  // Restore from localStorage
  restoreFromLocalStorage(presentationId: string): PresentationData | null {
    try {
      const key = `presentation-backup-${presentationId}`
      const data = localStorage.getItem(key)
      
      if (data) {
        const backup = JSON.parse(data)
        console.log('✅ Presentation restored from localStorage')
        return backup.presentation
      }
      
      return null
    } catch (error) {
      console.error('❌ localStorage restore failed:', error)
      return null
    }
  }
}

// Export singleton instances
export const serverPresentationService = new EnhancedPresentationService(true)
export const clientPresentationService = new EnhancedPresentationService(false)