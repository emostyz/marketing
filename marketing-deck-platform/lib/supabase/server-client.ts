import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://waddrfstpqkvdfwbxvfw.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhZGRyZnN0cHFrdmRmd2J4dmZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNDU3NzUsImV4cCI6MjA2NTkyMTc3NX0.xzosM3NHbf_kpmw5hRFKKqDuvbNLp9MrqsWITk9tD5w'
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhZGRyZnN0cHFrdmRmd2J4dmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDM0NTc3NSwiZXhwIjoyMDY1OTIxNzc1fQ.iyqjg-2Ld4Nl6xOquPVO5ar9yIYQwP2GXL79iIaKexE'

// Server-side client for API routes
export async function createServerSupabaseClient(authHeader?: string) {
  const cookieStore = await cookies()
  
  const headers: any = {
    Cookie: cookieStore.toString()
  }
  
  // If Authorization header is provided, use it
  if (authHeader) {
    headers.Authorization = authHeader
  }
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    },
    global: {
      headers
    }
  })
}

// Alternative alias for compatibility
export async function createServerClient() {
  return createServerSupabaseClient()
}

// Alias for compatibility
export async function createServerClientWithCookies() {
  return createServerSupabaseClient()
}

// Helper function to get user session from server-side
export async function getServerSession() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// Helper function to get user from server-side
export async function getServerUser() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Admin client with service role for bypassing RLS and managing users
export function createAdminSupabaseClient() {
  return createClient(
    supabaseUrl,
    supabaseServiceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
} 