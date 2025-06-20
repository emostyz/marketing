import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name?: string
          avatar_url?: string
          company?: string
          role: string
          subscription_status: string
          subscription_expires_at?: string
          oauth_provider?: string
          oauth_provider_id?: string
          preferences: any
          api_usage_count: number
          api_usage_reset_date: string
          is_active: boolean
          email_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string
          avatar_url?: string
          company?: string
          role?: string
          subscription_status?: string
          subscription_expires_at?: string
          oauth_provider?: string
          oauth_provider_id?: string
          preferences?: any
          api_usage_count?: number
          api_usage_reset_date?: string
          is_active?: boolean
          email_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string
          company?: string
          role?: string
          subscription_status?: string
          subscription_expires_at?: string
          oauth_provider?: string
          oauth_provider_id?: string
          preferences?: any
          api_usage_count?: number
          api_usage_reset_date?: string
          is_active?: boolean
          email_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      presentations: {
        Row: {
          id: string
          user_id: string
          title: string
          description?: string
          thumbnail_url?: string
          slides: any
          theme: string
          template_id?: string
          is_public: boolean
          is_template: boolean
          version: number
          parent_id?: string
          tags: string[]
          view_count: number
          like_count: number
          download_count: number
          last_viewed_at?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string
          thumbnail_url?: string
          slides?: any
          theme?: string
          template_id?: string
          is_public?: boolean
          is_template?: boolean
          version?: number
          parent_id?: string
          tags?: string[]
          view_count?: number
          like_count?: number
          download_count?: number
          last_viewed_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          thumbnail_url?: string
          slides?: any
          theme?: string
          template_id?: string
          is_public?: boolean
          is_template?: boolean
          version?: number
          parent_id?: string
          tags?: string[]
          view_count?: number
          like_count?: number
          download_count?: number
          last_viewed_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      datasets: {
        Row: {
          id: string
          user_id: string
          name: string
          description?: string
          file_name?: string
          file_size?: number
          file_type?: string
          data: any
          column_metadata: any
          row_count?: number
          upload_source: string
          is_sample: boolean
          processing_status: string
          error_message?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string
          file_name?: string
          file_size?: number
          file_type?: string
          data: any
          column_metadata?: any
          row_count?: number
          upload_source?: string
          is_sample?: boolean
          processing_status?: string
          error_message?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string
          file_name?: string
          file_size?: number
          file_type?: string
          data?: any
          column_metadata?: any
          row_count?: number
          upload_source?: string
          is_sample?: boolean
          processing_status?: string
          error_message?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      user_dashboard: {
        Row: {
          id: string
          email: string
          full_name?: string
          subscription_status: string
          presentation_count: number
          dataset_count: number
          total_views: number
          joined_at: string
        }
      }
    }
    Functions: {
      increment_presentation_views: {
        Args: { presentation_uuid: string }
        Returns: void
      }
      track_api_usage: {
        Args: {
          user_uuid: string
          endpoint_path: string
          request_method: string
          tokens_consumed?: number
          cost?: number
        }
        Returns: void
      }
    }
  }
}

// Enhanced API functions
export class SupabaseAPI {
  static async saveDataset(userId: string, name: string, data: any[], metadata: any = {}) {
    const { data: result, error } = await supabase
      .from('datasets')
      .insert({
        user_id: userId,
        name,
        data,
        column_metadata: metadata,
        row_count: data.length,
        processing_status: 'completed'
      })
      .select()
      .single()

    if (error) throw error
    return result
  }

  static async saveQAResponses(userId: string, datasetId: string, presentationId: string, responses: any) {
    const { data: result, error } = await supabase
      .from('qa_responses')
      .insert({
        user_id: userId,
        dataset_id: datasetId,
        presentation_id: presentationId,
        ...responses
      })
      .select()
      .single()

    if (error) throw error
    return result
  }

  static async saveAIAnalysis(userId: string, datasetId: string, qaResponseId: string, presentationId: string, analysis: any) {
    const { data: result, error } = await supabase
      .from('ai_analysis_results')
      .insert({
        user_id: userId,
        dataset_id: datasetId,
        qa_response_id: qaResponseId,
        presentation_id: presentationId,
        analysis_type: 'openai',
        insights: analysis.insights || {},
        slide_recommendations: analysis.slideRecommendations || [],
        executive_summary: analysis.executiveSummary,
        key_findings: analysis.keyTakeaways || [],
        confidence_score: analysis.confidence || 0,
        iteration_count: 1
      })
      .select()
      .single()

    if (error) throw error
    return result
  }

  static async savePresentation(userId: string, title: string, slides: any[], metadata: any = {}) {
    const { data: result, error } = await supabase
      .from('presentations')
      .insert({
        user_id: userId,
        title,
        slides,
        theme: metadata.theme || 'dark',
        description: metadata.description,
        tags: metadata.tags || [],
        is_public: metadata.isPublic || false
      })
      .select()
      .single()

    if (error) throw error
    return result
  }

  static async getUserPresentations(userId: string) {
    const { data, error } = await supabase
      .from('presentations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data
  }

  static async getPresentation(id: string) {
    const { data, error } = await supabase
      .from('presentations')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  static async trackAPIUsage(userId: string, endpoint: string, method: string, tokens: number = 0) {
    await supabase.rpc('track_api_usage', {
      user_uuid: userId,
      endpoint_path: endpoint,
      request_method: method,
      tokens_consumed: tokens
    })
  }

  static async incrementPresentationViews(presentationId: string) {
    await supabase.rpc('increment_presentation_views', {
      presentation_uuid: presentationId
    })
  }
}

export default supabase