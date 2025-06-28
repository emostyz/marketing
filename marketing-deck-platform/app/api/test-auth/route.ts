import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/api-auth'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing authentication...')
    
    const user = await requireAuth()
    
    return NextResponse.json({
      success: true,
      authenticated: !!user,
      user: user ? {
        id: user.id,
        email: user.email,
        name: user.name,
        demo: user.demo
      } : null,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Auth test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}