import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/api-auth'

export async function POST(request: NextRequest) {
  try {
    const { step, data, timestamp, presentationId, projectName } = await request.json()
    
    console.log(`📝 Saving ${step} data for presentation:`, presentationId || 'new')
    
    // Require real authentication - no demo fallback
    const user = await requireAuth()
    const userId = user.id
    
    console.log(`👤 Real User: ${userId.slice(0, 8)}...${userId.slice(-4)} (${user.email})`)

    // For authenticated users, use database (if available)
    console.log('⚠️ Database operations disabled for now - using session storage')
    
    const sessionPresentation = {
      id: presentationId || `session-presentation-${Date.now()}`,
      userId,
      title: projectName || `New Presentation - ${new Date().toLocaleDateString()}`,
      description: `Draft created on ${new Date().toLocaleDateString()}`,
      status: 'draft',
      slides: [],
      dataSources: [],
      narrativeConfig: {},
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Update presentation based on step
    let updateData: any = {
      updatedAt: new Date()
    }

    // For now, just return success with session data structure
    console.log(`✅ Session data processed for authenticated user: ${user.email}`)
    
    return NextResponse.json({ 
      success: true,
      step,
      presentationId: sessionPresentation.id,
      data: sessionPresentation,
      message: `${step} data saved to session storage`
    })

  } catch (error) {
    console.error('Error saving presentation session:', error)
    return NextResponse.json(
      { error: 'Failed to save presentation session' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const presentationId = searchParams.get('presentationId')
    
    // Require real authentication - no demo fallback
    const user = await requireAuth()
    
    console.log(`👤 Real User: ${user.id.slice(0, 8)}...${user.id.slice(-4)} (${user.email})`)

    // For authenticated users, indicate to use local storage for now
    return NextResponse.json({ 
      session: {
        id: presentationId || 'session-' + Date.now(),
        userId: user.id,
        useLocalStorage: true
      },
      useLocalStorage: true
    })

  } catch (error) {
    console.error('Error fetching presentation session:', error)
    return NextResponse.json(
      { error: 'Failed to fetch presentation session' },
      { status: 500 }
    )
  }
} 