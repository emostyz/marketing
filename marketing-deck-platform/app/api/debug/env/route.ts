import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Only show this in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
    POSTGRES_URL: process.env.POSTGRES_URL ? 'SET' : 'NOT SET',
    SUPABASE_DB_URL: process.env.SUPABASE_DB_URL ? 'SET' : 'NOT SET',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET',
  }

  return NextResponse.json({
    message: 'Environment variables status',
    envVars,
    timestamp: new Date().toISOString()
  })
} 