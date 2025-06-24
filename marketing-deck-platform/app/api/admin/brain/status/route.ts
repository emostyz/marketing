import { NextRequest, NextResponse } from 'next/server'
import MasterBrain from '@/lib/ai/master-brain'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')
    
    // Verify user authentication
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const masterBrain = new MasterBrain()
    const status = await masterBrain.getBrainStatus(organizationId || undefined)

    return NextResponse.json({
      success: true,
      status
    })

  } catch (error) {
    console.error('Brain status API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}