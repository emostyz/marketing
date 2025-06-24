import { NextRequest, NextResponse } from 'next/server'
import MasterBrain from '@/lib/ai/master-brain'

export async function POST(request: NextRequest) {
  try {
    const { organizationId, requestedBy } = await request.json()
    
    // Verify user authentication
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!organizationId || !requestedBy) {
      return NextResponse.json({ error: 'Organization ID and user ID required' }, { status: 400 })
    }

    const masterBrain = new MasterBrain()
    const result = await masterBrain.reloadProviders(organizationId, requestedBy)

    return NextResponse.json(result)

  } catch (error) {
    console.error('Brain reload API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}