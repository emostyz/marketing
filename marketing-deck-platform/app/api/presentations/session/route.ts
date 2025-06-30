import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { step, data: requestData, timestamp, presentationId, projectName } = await request.json()
    
    console.log(`📝 Saving ${step} data for presentation:`, presentationId || 'new')
    
    // Check for auth cookies directly
    const authHeader = request.headers.get('Authorization')
    const cookieHeader = request.headers.get('Cookie') || ''
    
    // Extract auth token from cookies or Authorization header
    let authToken = null
    if (authHeader && authHeader.startsWith('Bearer ')) {
      authToken = authHeader.slice(7)
    } else {
      // Check multiple cookie patterns
      const cookiePatterns = [
        /sb-waddrfstpqkvdfwbxvfw-auth-token=([^;]+)/,
        /sb-qezexjgyvzwanfrgqaio-auth-token=([^;]+)/
      ]
      
      for (const pattern of cookiePatterns) {
        const match = cookieHeader.match(pattern)
        if (match) {
          authToken = match[1]
          break
        }
      }
    }
    
    if (!authToken) {
      console.error('❌ No auth token found')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Create Supabase client with auth token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      }
    )
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ Authentication failed:', authError?.message)
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const userId = user.id
    console.log(`👤 User: ${userId.slice(0, 8)}...${userId.slice(-4)} (${user.email})`)

    // For authenticated users, use database
    console.log('✅ Database operations enabled - saving to Supabase')
    
    let presentation: any
    
    if (presentationId) {
      // Update existing presentation
      const { data: existingPresentation } = await supabase
        .from('presentations')
        .select('metadata')
        .eq('id', presentationId)
        .eq('user_id', userId)
        .single()
      
      const updatedMetadata = {
        ...(existingPresentation?.metadata || {}),
        [step]: requestData
      }
      
      const { data: updatedPresentation, error } = await supabase
        .from('presentations')
        .update({
          title: projectName,
          updated_at: new Date().toISOString(),
          metadata: updatedMetadata
        })
        .eq('id', presentationId)
        .eq('user_id', userId)
        .select()
        .single()
      
      if (error) {
        console.error('Error updating presentation:', error)
        throw error
      }
      presentation = updatedPresentation
    } else {
      // Create new presentation
      const { data: newPresentation, error } = await supabase
        .from('presentations')
        .insert({
          user_id: userId,
          title: projectName || `New Presentation - ${new Date().toLocaleDateString()}`,
          slides_data: [],
          metadata: { 
            [step]: requestData,
            description: `Draft created on ${new Date().toLocaleDateString()}`,
            status: 'draft'
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) {
        console.error('Error creating presentation:', error)
        throw error
      }
      presentation = newPresentation
    }

    console.log(`✅ Database data processed for authenticated user: ${user.email}`)
    
    return NextResponse.json({ 
      success: true,
      step,
      presentationId: presentation.id,
      data: presentation,
      message: `${step} data saved to database`
    })

  } catch (error: any) {
    console.error('Error saving presentation session:', error)
    return NextResponse.json(
      { 
        error: 'Failed to save presentation session',
        details: error?.message || 'Unknown error',
        code: error?.code
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const presentationId = searchParams.get('presentationId')
    
    // Get auth from cookies/headers like in POST
    const authHeader = request.headers.get('Authorization')
    const cookieHeader = request.headers.get('Cookie') || ''
    
    let authToken = null
    if (authHeader && authHeader.startsWith('Bearer ')) {
      authToken = authHeader.slice(7)
    } else {
      const cookiePatterns = [
        /sb-waddrfstpqkvdfwbxvfw-auth-token=([^;]+)/,
        /sb-qezexjgyvzwanfrgqaio-auth-token=([^;]+)/
      ]
      
      for (const pattern of cookiePatterns) {
        const match = cookieHeader.match(pattern)
        if (match) {
          authToken = match[1]
          break
        }
      }
    }
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const authSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      }
    )
    
    const { data: { user }, error: authError } = await authSupabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    console.log(`👤 User: ${user.id.slice(0, 8)}...${user.id.slice(-4)} (${user.email})`)

    // For authenticated users, fetch from database
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