// Comprehensive Supabase persistence service for presentations, templates, and design elements
// Ensures all customization data can be saved and retrieved

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'

export interface PresentationData {
  id?: string
  user_id?: string
  title: string
  description?: string
  slides: SlideData[]
  template_id?: string
  theme_id?: string
  metadata: {
    created_at?: string
    updated_at?: string
    version: number
    total_slides: number
    estimated_duration: number
    design_system_version?: string
    custom_fonts?: string[]
    custom_colors?: string[]
    custom_elements?: any[]
  }
  status: 'draft' | 'completed' | 'published' | 'archived'
}

export interface SlideData {
  id: string
  slide_number: number
  slide_type: string
  title?: string
  subtitle?: string
  content: {
    summary?: string
    bullet_points?: string[]
    hidden_insight?: string
    strategic_implication?: string
  }
  elements: ElementData[]
  background: {
    type: 'solid' | 'gradient' | 'image'
    value?: string
    gradient?: {
      from: string
      to: string
      direction: string
    }
    image?: {
      url: string
      position: string
      size: string
    }
  }
  style: {
    font_family?: string
    text_color?: string
    accent_color?: string
    layout?: string
  }
  charts: ChartData[]
  ai_insights?: {
    confidence: number
    key_findings: string[]
    recommendations: string[]
    data_story: string
    business_impact: string
  }
  metadata: {
    created_at: string
    updated_at: string
    version: number
    template_used?: string
    custom_elements_count: number
  }
}

export interface ElementData {
  id: string
  type: 'text' | 'shape' | 'image' | 'chart' | 'icon' | 'container'
  content?: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  rotation: number
  style: {
    // Text styles
    font_family?: string
    font_size?: number
    font_weight?: string | number
    font_style?: string
    text_align?: string
    text_decoration?: string
    line_height?: number
    letter_spacing?: string
    color?: string
    
    // Shape/container styles
    fill?: string
    stroke?: string
    stroke_width?: number
    background_color?: string
    border?: string
    border_color?: string
    border_width?: string
    border_radius?: string
    
    // Effects
    opacity?: number
    box_shadow?: string
    filter?: string
    transform?: string
    
    // Layout
    display?: string
    justify_content?: string
    align_items?: string
    padding?: string
    margin?: string
  }
  is_locked?: boolean
  is_visible?: boolean
  z_index?: number
  metadata: {
    template_id?: string
    source: 'manual' | 'ai_generated' | 'template'
    created_at: string
    updated_at: string
    customizations: string[]
  }
}

export interface ChartData {
  id: string
  type: 'line' | 'bar' | 'area' | 'pie' | 'scatter' | 'radar'
  title: string
  data: any[]
  config: {
    x_axis_key: string
    y_axis_key: string | string[]
    show_animation: boolean
    show_legend: boolean
    show_grid_lines: boolean
    colors: string[]
    stroke_width?: number
    bar_size?: number
    inner_radius?: number
    outer_radius?: number
    value_formatter?: string
  }
  style: {
    width: number
    height: number
    background_color?: string
    border_radius?: number
    padding?: number
  }
  insights?: string[]
  metadata: {
    template_id?: string
    data_source?: string
    created_at: string
    updated_at: string
    customizations: string[]
  }
}

export interface TemplateData {
  id?: string
  name: string
  description?: string
  category: string
  thumbnail_url?: string
  template_data: {
    slides: SlideData[]
    theme: {
      primary_color: string
      secondary_color: string
      font_family: string
      background_style: string
    }
    design_tokens: {
      colors: string[]
      fonts: string[]
      spacing: number[]
    }
  }
  is_public: boolean
  created_by?: string
  tags?: string[]
  metadata: {
    version: number
    created_at: string
    updated_at: string
    usage_count: number
    rating: number
    complexity: 'simple' | 'moderate' | 'complex'
  }
}

export interface ThemeData {
  id?: string
  name: string
  description?: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
    muted: string
  }
  fonts: {
    heading: string
    body: string
    monospace?: string
  }
  spacing: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
  }
  borders: {
    radius: number
    width: number
  }
  is_public: boolean
  created_by?: string
  metadata: {
    version: number
    created_at: string
    updated_at: string
    usage_count: number
  }
}

class PresentationPersistenceService {
  private supabase = createClientComponentClient()

  // ===== PRESENTATIONS =====

  async savePresentation(presentationData: PresentationData): Promise<string> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const now = new Date().toISOString()
      const presentationRecord = {
        id: presentationData.id || undefined,
        user_id: user.id,
        title: presentationData.title,
        description: presentationData.description,
        slides: JSON.stringify(presentationData.slides),
        template_id: presentationData.template_id,
        theme_id: presentationData.theme_id,
        metadata: JSON.stringify({
          ...presentationData.metadata,
          updated_at: now,
          created_at: presentationData.metadata.created_at || now
        }),
        status: presentationData.status,
        created_at: presentationData.metadata.created_at || now,
        updated_at: now
      }

      const { data, error } = await this.supabase
        .from('presentations')
        .upsert(presentationRecord)
        .select('id')
        .single()

      if (error) throw error

      // Save individual slides for better querying
      await this.saveSlidesData(data.id, presentationData.slides)

      toast.success('Presentation saved successfully!')
      return data.id
    } catch (error) {
      console.error('Error saving presentation:', error)
      toast.error('Failed to save presentation')
      throw error
    }
  }

  async loadPresentation(presentationId: string): Promise<PresentationData> {
    try {
      const { data, error } = await this.supabase
        .from('presentations')
        .select(`
          *,
          slides (*)
        `)
        .eq('id', presentationId)
        .single()

      if (error) throw error

      return {
        id: data.id,
        user_id: data.user_id,
        title: data.title,
        description: data.description,
        slides: typeof data.slides === 'string' ? JSON.parse(data.slides) : data.slides,
        template_id: data.template_id,
        theme_id: data.theme_id,
        metadata: typeof data.metadata === 'string' ? JSON.parse(data.metadata) : data.metadata,
        status: data.status
      }
    } catch (error) {
      console.error('Error loading presentation:', error)
      throw error
    }
  }

  async getUserPresentations(userId?: string): Promise<PresentationData[]> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      const targetUserId = userId || user?.id
      if (!targetUserId) throw new Error('User ID required')

      const { data, error } = await this.supabase
        .from('presentations')
        .select('*')
        .eq('user_id', targetUserId)
        .order('updated_at', { ascending: false })

      if (error) throw error

      return data.map(presentation => ({
        id: presentation.id,
        user_id: presentation.user_id,
        title: presentation.title,
        description: presentation.description,
        slides: typeof presentation.slides === 'string' ? JSON.parse(presentation.slides) : presentation.slides,
        template_id: presentation.template_id,
        theme_id: presentation.theme_id,
        metadata: typeof presentation.metadata === 'string' ? JSON.parse(presentation.metadata) : presentation.metadata,
        status: presentation.status
      }))
    } catch (error) {
      console.error('Error loading user presentations:', error)
      throw error
    }
  }

  private async saveSlidesData(presentationId: string, slides: SlideData[]): Promise<void> {
    try {
      // Delete existing slides
      await this.supabase
        .from('slides')
        .delete()
        .eq('presentation_id', presentationId)

      // Insert new slides
      const slideRecords = slides.map(slide => ({
        presentation_id: presentationId,
        slide_number: slide.slide_number,
        slide_type: slide.slide_type,
        content: JSON.stringify(slide),
        metadata: JSON.stringify(slide.metadata),
        created_at: slide.metadata.created_at,
        updated_at: slide.metadata.updated_at
      }))

      const { error } = await this.supabase
        .from('slides')
        .insert(slideRecords)

      if (error) throw error
    } catch (error) {
      console.error('Error saving slides data:', error)
      throw error
    }
  }

  // ===== TEMPLATES =====

  async saveTemplate(templateData: TemplateData): Promise<string> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const now = new Date().toISOString()
      const templateRecord = {
        id: templateData.id || undefined,
        name: templateData.name,
        description: templateData.description,
        category: templateData.category,
        thumbnail_url: templateData.thumbnail_url,
        template_data: JSON.stringify(templateData.template_data),
        is_public: templateData.is_public,
        created_by: user.id,
        created_at: templateData.metadata?.created_at || now,
        updated_at: now
      }

      const { data, error } = await this.supabase
        .from('templates')
        .upsert(templateRecord)
        .select('id')
        .single()

      if (error) throw error

      toast.success('Template saved successfully!')
      return data.id
    } catch (error) {
      console.error('Error saving template:', error)
      toast.error('Failed to save template')
      throw error
    }
  }

  async loadTemplate(templateId: string): Promise<TemplateData> {
    try {
      const { data, error } = await this.supabase
        .from('templates')
        .select('*')
        .eq('id', templateId)
        .single()

      if (error) throw error

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        category: data.category,
        thumbnail_url: data.thumbnail_url,
        template_data: typeof data.template_data === 'string' ? JSON.parse(data.template_data) : data.template_data,
        is_public: data.is_public,
        created_by: data.created_by,
        metadata: {
          version: 1,
          created_at: data.created_at,
          updated_at: data.updated_at,
          usage_count: 0,
          rating: 5,
          complexity: 'moderate'
        }
      }
    } catch (error) {
      console.error('Error loading template:', error)
      throw error
    }
  }

  async getPublicTemplates(category?: string): Promise<TemplateData[]> {
    try {
      let query = this.supabase
        .from('templates')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (category && category !== 'all') {
        query = query.eq('category', category)
      }

      const { data, error } = await query

      if (error) throw error

      return data.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        thumbnail_url: template.thumbnail_url,
        template_data: typeof template.template_data === 'string' ? JSON.parse(template.template_data) : template.template_data,
        is_public: template.is_public,
        created_by: template.created_by,
        metadata: {
          version: 1,
          created_at: template.created_at,
          updated_at: template.updated_at,
          usage_count: 0,
          rating: 5,
          complexity: 'moderate'
        }
      }))
    } catch (error) {
      console.error('Error loading public templates:', error)
      throw error
    }
  }

  // ===== THEMES =====

  async saveTheme(themeData: ThemeData): Promise<string> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const now = new Date().toISOString()
      const themeRecord = {
        id: themeData.id || undefined,
        name: themeData.name,
        description: themeData.description,
        colors: JSON.stringify(themeData.colors),
        fonts: JSON.stringify(themeData.fonts),
        is_public: themeData.is_public,
        created_by: user.id,
        created_at: themeData.metadata?.created_at || now,
        updated_at: now
      }

      const { data, error } = await this.supabase
        .from('themes')
        .upsert(themeRecord)
        .select('id')
        .single()

      if (error) throw error

      toast.success('Theme saved successfully!')
      return data.id
    } catch (error) {
      console.error('Error saving theme:', error)
      toast.error('Failed to save theme')
      throw error
    }
  }

  async loadTheme(themeId: string): Promise<ThemeData> {
    try {
      const { data, error } = await this.supabase
        .from('themes')
        .select('*')
        .eq('id', themeId)
        .single()

      if (error) throw error

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        colors: typeof data.colors === 'string' ? JSON.parse(data.colors) : data.colors,
        fonts: typeof data.fonts === 'string' ? JSON.parse(data.fonts) : data.fonts,
        spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
        borders: { radius: 8, width: 1 },
        is_public: data.is_public,
        created_by: data.created_by,
        metadata: {
          version: 1,
          created_at: data.created_at,
          updated_at: data.updated_at,
          usage_count: 0
        }
      }
    } catch (error) {
      console.error('Error loading theme:', error)
      throw error
    }
  }

  async getPublicThemes(): Promise<ThemeData[]> {
    try {
      const { data, error } = await this.supabase
        .from('themes')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data.map(theme => ({
        id: theme.id,
        name: theme.name,
        description: theme.description,
        colors: typeof theme.colors === 'string' ? JSON.parse(theme.colors) : theme.colors,
        fonts: typeof theme.fonts === 'string' ? JSON.parse(theme.fonts) : theme.fonts,
        spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
        borders: { radius: 8, width: 1 },
        is_public: theme.is_public,
        created_by: theme.created_by,
        metadata: {
          version: 1,
          created_at: theme.created_at,
          updated_at: theme.updated_at,
          usage_count: 0
        }
      }))
    } catch (error) {
      console.error('Error loading public themes:', error)
      throw error
    }
  }

  // ===== USER PREFERENCES =====

  async saveUserPreferences(preferences: any): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await this.supabase
        .from('profiles')
        .update({
          preferences: JSON.stringify(preferences),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (error) throw error

      toast.success('Preferences saved!')
    } catch (error) {
      console.error('Error saving user preferences:', error)
      toast.error('Failed to save preferences')
      throw error
    }
  }

  async loadUserPreferences(): Promise<any> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await this.supabase
        .from('profiles')
        .select('preferences')
        .eq('user_id', user.id)
        .single()

      if (error) throw error

      return typeof data.preferences === 'string' ? JSON.parse(data.preferences) : data.preferences
    } catch (error) {
      console.error('Error loading user preferences:', error)
      return {}
    }
  }

  // ===== ANALYTICS =====

  async trackPresentationUsage(presentationId: string, action: string, metadata?: any): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      
      const { error } = await this.supabase
        .from('user_events')
        .insert({
          user_id: user?.id,
          event_type: `presentation_${action}`,
          event_data: JSON.stringify({
            presentation_id: presentationId,
            ...metadata
          }),
          created_at: new Date().toISOString()
        })

      if (error) console.warn('Analytics tracking error:', error)
    } catch (error) {
      console.warn('Analytics tracking failed:', error)
    }
  }
}

// Create and export singleton instance
export const presentationPersistence = new PresentationPersistenceService()

// Export service class for advanced usage
export { PresentationPersistenceService }