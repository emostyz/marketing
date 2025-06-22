import { NextRequest, NextResponse } from 'next/server'
import { AuthSystem } from '@/lib/auth/auth-system'
import { db } from '@/lib/db/drizzle'
import { profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const user = await AuthSystem.getCurrentUser()
    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await AuthSystem.getUserProfile()
    return NextResponse.json(profile || {})
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await AuthSystem.getCurrentUser()
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
    const user = await AuthSystem.getCurrentUser()
    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { companyName, logoUrl, brandColors } = body

    const updatedProfile = await db
      .update(profiles)
      .set({
        companyName: companyName,
        logoUrl: logoUrl,
        brandColors: brandColors,
        updatedAt: new Date()
      })
      .where(eq(profiles.email, user.email))
      .returning()

    if (updatedProfile.length === 0) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json(updatedProfile[0])
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 