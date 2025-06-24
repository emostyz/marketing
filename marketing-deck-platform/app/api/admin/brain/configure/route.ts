import { NextRequest, NextResponse } from 'next/server'
import MasterBrain from '@/lib/ai/master-brain'

export async function POST(request: NextRequest) {
  try {
    const { action, organizationId, updatedBy, config } = await request.json()
    
    // Verify user authentication
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const masterBrain = new MasterBrain()
    
    switch (action) {
      case 'update_brain_config':
        const updateResult = await masterBrain.updateBrainConfig(
          organizationId,
          config,
          updatedBy
        )
        return NextResponse.json(updateResult)

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Brain configuration API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}