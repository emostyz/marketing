import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/api-auth'
import { AuthSystem } from '@/lib/auth/auth-system'
import { db } from '@/lib/db/drizzle'
import { profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        subscription: user.subscription,
        profile: user.profile
      }
    })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      industry, 
      targetAudience, 
      businessContext, 
      description,
      companyName, 
      logoUrl, 
      brandColors,
      keyMetrics,
      dataPreferences
    } = body

    const profileData = {
      industry,
      targetAudience,
      businessContext,
      companyName,
      keyMetrics,
      dataPreferences
    }

    // Update user profile via AuthSystem
    const updatedUser = await AuthSystem.updateUserProfile(profileData)
    
    if (updatedUser) {
      return NextResponse.json(updatedUser.profile)
    } else {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error creating/updating profile:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth()

    const profileData = await request.json()

    // Update user profile
    const updatedUser = await AuthSystem.updateUserProfile(profileData)
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        subscription: updatedUser.subscription,
        profile: updatedUser.profile
      }
    })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 