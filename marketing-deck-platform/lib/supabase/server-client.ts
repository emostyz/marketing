import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// NOTE: In Next.js app router, cookies() must be awaited in async contexts. Do not use cookies() synchronously in API routes or server components.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://waddrfstpqkvdfwbxvfw.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhZGRyZnN0cHFrdmRmd2J4dmZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNDU3NzUsImV4cCI6MjA2NTkyMTc3NX0.xzosM3NHbf_kpmw5hRFKKqDuvbNLp9MrqsWITk9tD5w'
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhZGRyZnN0cHFrdmRmd2J4dmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDM0NTc3NSwiZXhwIjoyMDY1OTIxNzc1fQ.iyqjg-2Ld4Nl6xOquPVO5ar9yIYQwP2GXL79iIaKexE'

// Server-side client for API routes (async version with cookies)
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  
  return createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        storage: {
          getItem: (key: string) => {
            return cookieStore.get(key)?.value || null
          },
          setItem: (key: string, value: string) => {
            // Cookies are set via response headers in API routes
          },
          removeItem: (key: string) => {
            // Cookies are removed via response headers in API routes
          }
        }
      },
      global: {
        headers: {
          'X-Client-Info': 'supabase-js-nextjs',
          Cookie: cookieStore.toString(),
        },
      },
    }
  )
}

// Async version for Next.js App Router compatibility
export async function createServerClient() {
  const cookieStore = await cookies()
  return createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          'X-Client-Info': 'supabase-js-nextjs',
          Cookie: cookieStore.toString(),
        },
      },
    }
  )
}

// Async version with cookies - this is what most API routes should use
export async function createServerClientWithCookies() {
  const cookieStore = await cookies()
  
  return createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        storage: {
          getItem: (key: string) => {
            return cookieStore.get(key)?.value || null
          },
          setItem: (key: string, value: string) => {
            // Cookies are set via response headers in API routes
          },
          removeItem: (key: string) => {
            // Cookies are removed via response headers in API routes
          }
        }
      },
      global: {
        headers: {
          'X-Client-Info': 'supabase-js-nextjs',
          Cookie: cookieStore.toString(),
        },
      },
    }
  )
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