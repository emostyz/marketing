import { NextRequest, NextResponse } from 'next/server'
import DemoUserManager from '@/lib/services/demo-user-manager'

export async function POST(request: NextRequest) {
  try {
    const { action, ...params } = await request.json()
    
    const demoManager = new DemoUserManager()
    
    switch (action) {
      case 'create_demo_user':
        const createResult = await demoManager.createDemoUser(
          params.email,
          params.referralSource
        )
        return NextResponse.json(createResult)

      case 'check_presentation_limit':
        const limitCheck = await demoManager.canCreatePresentation(params.demoUserId)
        return NextResponse.json(limitCheck)

      case 'record_presentation_created':
        const recordResult = await demoManager.recordPresentationCreated(params.demoUserId)
        return NextResponse.json(recordResult)

      case 'check_changes_permission':
        const changesCheck = await demoManager.canMakeChanges(
          params.demoUserId,
          params.changeType
        )
        return NextResponse.json(changesCheck)

      case 'record_change':
        const changeResult = await demoManager.recordChange(
          params.demoUserId,
          params.changeType,
          params.metadata
        )
        return NextResponse.json(changeResult)

      case 'get_demo_status':
        const status = await demoManager.getDemoUserStatus(params.demoUserId)
        return NextResponse.json(status)

      case 'cleanup_expired':
        const cleanupResult = await demoManager.cleanupExpiredDemoUsers()
        return NextResponse.json({
          success: true,
          cleanup: cleanupResult
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Demo API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const demoUserId = searchParams.get('demoUserId')
    
    if (!demoUserId) {
      return NextResponse.json({ error: 'Demo user ID required' }, { status: 400 })
    }

    const demoManager = new DemoUserManager()
    const status = await demoManager.getDemoUserStatus(demoUserId)

    return NextResponse.json({
      success: true,
      ...status
    })

  } catch (error) {
    console.error('Get demo status error:', error)
    return NextResponse.json({ 
      error: 'Failed to get demo status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}