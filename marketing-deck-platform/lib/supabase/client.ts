import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// For client-side usage
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// For server-side usage with service role
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url?: string
          subscription: 'free' | 'pro' | 'enterprise'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          avatar_url?: string
          subscription?: 'free' | 'pro' | 'enterprise'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar_url?: string
          subscription?: 'free' | 'pro' | 'enterprise'
          updated_at?: string
        }
      }
      presentations: {
        Row: {
          id: string
          user_id: string
          title: string
          description?: string
          slides: any[]
          theme: string
          tags: string[]
          is_public: boolean
          qa_responses?: any
          original_data?: any[]
          thumbnail_url?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string
          slides: any[]
          theme?: string
          tags?: string[]
          is_public?: boolean
          qa_responses?: any
          original_data?: any[]
          thumbnail_url?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          slides?: any[]
          theme?: string
          tags?: string[]
          is_public?: boolean
          qa_responses?: any
          original_data?: any[]
          thumbnail_url?: string
          updated_at?: string
        }
      }
      datasets: {
        Row: {
          id: string
          user_id: string
          name: string
          description?: string
          data: any[]
          file_type?: string
          file_size?: number
          qa_responses?: any
          ai_analysis?: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string
          data: any[]
          file_type?: string
          file_size?: number
          qa_responses?: any
          ai_analysis?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string
          data?: any[]
          file_type?: string
          file_size?: number
          qa_responses?: any
          ai_analysis?: any
          updated_at?: string
        }
      }
      analytics: {
        Row: {
          id: string
          user_id?: string
          presentation_id?: string
          action: string
          metadata?: any
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          presentation_id?: string
          action: string
          metadata?: any
          created_at?: string
        }
      }
    }
  }
}

// Helper functions for common operations
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name
      }
    }
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Presentation operations
export async function savePresentation(presentation: Database['public']['Tables']['presentations']['Insert']) {
  const { data, error } = await supabase
    .from('presentations')
    .insert(presentation)
    .select()
    .single()
  
  return { data, error }
}

export async function getUserPresentations(userId: string) {
  const { data, error } = await supabase
    .from('presentations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  
  return { data, error }
}

export async function getPresentation(id: string) {
  const { data, error } = await supabase
    .from('presentations')
    .select('*')
    .eq('id', id)
    .single()
  
  return { data, error }
}

export async function updatePresentation(id: string, updates: Database['public']['Tables']['presentations']['Update']) {
  const { data, error } = await supabase
    .from('presentations')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

export async function deletePresentation(id: string) {
  const { data, error } = await supabase
    .from('presentations')
    .delete()
    .eq('id', id)
  
  return { data, error }
}

// Dataset operations
export async function saveDataset(dataset: Database['public']['Tables']['datasets']['Insert']) {
  const { data, error } = await supabase
    .from('datasets')
    .insert(dataset)
    .select()
    .single()
  
  return { data, error }
}

export async function getUserDatasets(userId: string) {
  const { data, error } = await supabase
    .from('datasets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  return { data, error }
}

// Analytics tracking
export async function trackAnalytics(analytics: Database['public']['Tables']['analytics']['Insert']) {
  const { data, error } = await supabase
    .from('analytics')
    .insert(analytics)
  
  return { data, error }
}