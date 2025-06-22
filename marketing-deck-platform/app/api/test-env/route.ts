import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    openaiKeyExists: !!process.env.OPENAI_API_KEY,
    openaiKeyLength: process.env.OPENAI_API_KEY?.length || 0,
    openaiKeyStartsWith: process.env.OPENAI_API_KEY?.startsWith('sk-') || false,
    supabaseUrlExists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  })
} 