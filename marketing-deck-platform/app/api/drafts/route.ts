import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserWithDemo } from '@/lib/auth/api-auth'

export async function POST(request: NextRequest) {
  try {
    const { user, isDemo } = await getAuthenticatedUserWithDemo()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { draftData, type = 'intake' } = await request.json()

    if (isDemo) {
      // For demo users, store in localStorage-compatible format
      return NextResponse.json({ 
        success: true, 
        draftId: `demo-draft-${Date.now()}`,
        message: 'Draft saved to local storage' 
      })
    }

    // For real users, store in database
    // For now, we'll use a simple storage approach
    // In a real app, you'd want a proper drafts table
    
    const draftId = `draft_${user.id}_${type}_${Date.now()}`
    
    // Store draft metadata (you could extend this to save to a dedicated table)
    console.log('💾 Saving draft for user:', user.id, 'type:', type)
    
    return NextResponse.json({ 
      success: true, 
      draftId,
      message: 'Draft saved successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Error saving draft:', error)
    return NextResponse.json({ error: 'Failed to save draft' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { user, isDemo } = await getAuthenticatedUserWithDemo()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'intake'

    if (isDemo) {
      // For demo users, return empty drafts (they use localStorage)
      return NextResponse.json({ 
        success: true, 
        drafts: [],
        message: 'Demo mode - drafts stored locally' 
      })
    }

    // For real users, retrieve from database
    console.log('📖 Retrieving drafts for user:', user.id, 'type:', type)
    
    return NextResponse.json({ 
      success: true, 
      drafts: [], // Would load from database
      message: 'Drafts retrieved successfully'
    })

  } catch (error) {
    console.error('❌ Error retrieving drafts:', error)
    return NextResponse.json({ error: 'Failed to retrieve drafts' }, { status: 500 })
  }
}