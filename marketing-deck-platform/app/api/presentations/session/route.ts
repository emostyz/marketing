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

    // For authenticated users, use database
    console.log('✅ Database operations enabled - saving to Supabase')
    
    // Create or update presentation in database
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    let presentation: any
    
    if (presentationId) {
      // Update existing presentation
      const { data, error } = await supabase
        .from('presentations')
        .update({
          title: projectName,
          updated_at: new Date().toISOString(),
          step_data: { [step]: data }
        })
        .eq('id', presentationId)
        .eq('user_id', userId)
        .select()
        .single()
      
      if (error) {
        console.error('Error updating presentation:', error)
        throw error
      }
      presentation = data
    } else {
      // Create new presentation
      const { data, error } = await supabase
        .from('presentations')
        .insert({
          user_id: userId,
          title: projectName || `New Presentation - ${new Date().toLocaleDateString()}`,
          description: `Draft created on ${new Date().toLocaleDateString()}`,
          status: 'draft',
          slides: [],
          step_data: { [step]: data },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) {
        console.error('Error creating presentation:', error)
        throw error
      }
      presentation = data
    }

    console.log(`✅ Database data processed for authenticated user: ${user.email}`)
    
    return NextResponse.json({ 
      success: true,
      step,
      presentationId: presentation.id,
      data: presentation,
      message: `${step} data saved to database`
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

    // For authenticated users, fetch from database
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    let session: any = {
      id: presentationId || 'session-' + Date.now(),
      userId: user.id,
      useLocalStorage: false
    }
    
    if (presentationId) {
      const { data: presentation, error } = await supabase
        .from('presentations')
        .select('*')
        .eq('id', presentationId)
        .eq('user_id', user.id)
        .single()
      
      if (!error && presentation) {
        session = {
          id: presentation.id,
          userId: presentation.user_id,
          title: presentation.title,
          data: presentation.step_data || {},
          useLocalStorage: false
        }
      }
    }
    
    return NextResponse.json({ 
      session,
      useLocalStorage: false
    })

  } catch (error) {
    console.error('Error fetching presentation session:', error)
    return NextResponse.json(
      { error: 'Failed to fetch presentation session' },
      { status: 500 }
    )
  }
} 