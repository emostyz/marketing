import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// For client-side usage (browser)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          email: string
          full_name: string | null
          first_name: string | null
          last_name: string | null
          company_name: string | null
          job_title: string | null
          industry: string | null
          avatar_url: string | null
          subscription_tier: string | null
          subscription_status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          onboarding_completed: boolean | null
          brand_colors: any | null
          bio: string | null
          phone: string | null
          target_audience: string | null
          business_context: string | null
          master_system_prompt: string | null
          key_metrics: any | null
          logo_url: string | null
          profile_picture_url: string | null
          preferences: any | null
          last_login: string | null
          login_count: number | null
          is_active: boolean | null
          email_verified: boolean | null
          timezone: string | null
          language: string | null
          notification_settings: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email?: string
          full_name?: string | null
          first_name?: string | null
          last_name?: string | null
          company_name?: string | null
          job_title?: string | null
          industry?: string | null
          avatar_url?: string | null
          subscription_tier?: string | null
          subscription_status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          onboarding_completed?: boolean | null
          brand_colors?: any | null
          bio?: string | null
          phone?: string | null
          target_audience?: string | null
          business_context?: string | null
          master_system_prompt?: string | null
          key_metrics?: any | null
          logo_url?: string | null
          profile_picture_url?: string | null
          preferences?: any | null
          last_login?: string | null
          login_count?: number | null
          is_active?: boolean | null
          email_verified?: boolean | null
          timezone?: string | null
          language?: string | null
          notification_settings?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          full_name?: string | null
          first_name?: string | null
          last_name?: string | null
          company_name?: string | null
          job_title?: string | null
          industry?: string | null
          avatar_url?: string | null
          subscription_tier?: string | null
          subscription_status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          onboarding_completed?: boolean | null
          brand_colors?: any | null
          bio?: string | null
          phone?: string | null
          target_audience?: string | null
          business_context?: string | null
          master_system_prompt?: string | null
          key_metrics?: any | null
          logo_url?: string | null
          profile_picture_url?: string | null
          preferences?: any | null
          last_login?: string | null
          login_count?: number | null
          is_active?: boolean | null
          email_verified?: boolean | null
          timezone?: string | null
          language?: string | null
          notification_settings?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      presentations: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          status: string
          template_id: string | null
          data: any
          settings: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          status?: string
          template_id?: string | null
          data?: any
          settings?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          status?: string
          template_id?: string | null
          data?: any
          settings?: any
          created_at?: string
          updated_at?: string
        }
      }
      datasets: {
        Row: {
          id: string
          user_id: string
          name: string
          data: any
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          data: any
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          data?: any
          created_at?: string
        }
      }
      analytics: {
        Row: {
          id: string
          user_id: string | null
          event_type: string
          event_data: any
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          event_type: string
          event_data: any
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          event_type?: string
          event_data?: any
          created_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          user_id: string | null
          email: string
          full_name: string | null
          company_name: string | null
          source: string
          status: 'new' | 'contacted' | 'qualified' | 'converted'
          ip_address: string | null
          user_agent: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          email: string
          full_name?: string | null
          company_name?: string | null
          source?: string
          status?: 'new' | 'contacted' | 'qualified' | 'converted'
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          email?: string
          full_name?: string | null
          company_name?: string | null
          source?: string
          status?: 'new' | 'contacted' | 'qualified' | 'converted'
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_events: {
        Row: {
          id: string
          user_id: string | null
          session_id: string | null
          event_type: string
          event_data: any | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          event_type: string
          event_data?: any | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          event_type?: string
          event_data?: any | null
          ip_address?: string | null
          user_agent?: string | null
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
    .order('created_at', { ascending: false })
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
  const { error } = await supabase
    .from('presentations')
    .delete()
    .eq('id', id)
  return { error }
}

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

export async function trackAnalytics(analytics: Database['public']['Tables']['analytics']['Insert']) {
  const { data, error } = await supabase
    .from('analytics')
    .insert(analytics)
    .select()
    .single()
  return { data, error }
}