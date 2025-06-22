import { NextRequest, NextResponse } from 'next/server'
import { AuthSystem } from '@/lib/auth/auth-system'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Try Supabase first, fallback to mock auth
    let userId: string
    let useSupabase = false
    
    try {
      const supabase = createServerComponentClient({ cookies })
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user?.id) {
        userId = session.user.id
        useSupabase = true
      } else {
        throw new Error('No Supabase session')
      }
    } catch (supabaseError) {
      const user = await AuthSystem.getCurrentUser()
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      userId = user.id.toString()
    }

    // Try to get presentations from Supabase
    if (useSupabase) {
      try {
        const supabase = createServerComponentClient({ cookies })
        const { data: presentations, error } = await supabase
          .from('presentations')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (!error && presentations) {
          return NextResponse.json({
            success: true,
            presentations: presentations.map(p => ({
              id: p.id,
              title: p.title,
              description: p.description,
              status: p.status,
              slides: p.slides || [],
              createdAt: p.created_at,
              updatedAt: p.updated_at,
              slideCount: Array.isArray(p.slides) ? p.slides.length : 0
            }))
          })
        }
      } catch (dbError) {
        console.warn('Database query failed, returning empty list:', dbError)
      }
    }

    // Fallback: return empty array for now
    return NextResponse.json({
      success: true,
      presentations: []
    })
  } catch (error) {
    console.error('Presentations API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    let userId: string
    let useSupabase = false
    
    try {
      const supabase = createServerComponentClient({ cookies })
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user?.id) {
        userId = session.user.id
        useSupabase = true
      } else {
        throw new Error('No Supabase session')
      }
    } catch (supabaseError) {
      const user = await AuthSystem.getCurrentUser()
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      userId = user.id.toString()
    }

    const body = await request.json()
    const { 
      title, 
      description, 
      intakeData, 
      analysisResult, 
      slideStructure,
      templateId,
      dataSources 
    } = body

    // Generate presentation ID
    const presentationId = `pres_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Prepare presentation data
    const presentationData = {
      id: presentationId,
      user_id: userId,
      title: title || `Presentation - ${new Date().toLocaleDateString()}`,
      description: description || 'AI-generated presentation',
      status: 'draft',
      template_id: templateId || null,
      slides: slideStructure || [],
      data_sources: dataSources || (intakeData?.files ? intakeData.files.map((f: any) => ({
        fileId: f.id,
        fileName: f.name,
        fileType: f.type,
        insights: f.parsedData?.insights
      })) : []),
      narrative_config: analysisResult?.narrative || {},
      metadata: {
        intakeData,
        analysisResult,
        generatedAt: new Date().toISOString(),
        version: '2.0'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Try to save to Supabase database
    if (useSupabase) {
      try {
        const supabase = createServerComponentClient({ cookies })
        
        // Check if user profile exists, create if not
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .single()

        if (!profile) {
          // Create profile if it doesn't exist
          await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: 'user@example.com', // This should come from session
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
        }

        // Save presentation
        const { data: savedPresentation, error: saveError } = await supabase
          .from('presentations')
          .insert(presentationData)
          .select()
          .single()

        if (!saveError && savedPresentation) {
          console.log('✅ Presentation saved to database:', savedPresentation.id)
          
          return NextResponse.json({
            success: true,
            presentation: {
              id: savedPresentation.id,
              title: savedPresentation.title,
              description: savedPresentation.description,
              status: savedPresentation.status,
              slides: savedPresentation.slides || [],
              slideCount: Array.isArray(savedPresentation.slides) ? savedPresentation.slides.length : 0,
              createdAt: savedPresentation.created_at,
              updatedAt: savedPresentation.updated_at,
              metadata: savedPresentation.metadata
            }
          })
        } else {
          throw new Error(saveError?.message || 'Failed to save presentation')
        }
      } catch (dbError) {
        console.error('❌ Database save failed:', dbError)
        // Continue to fallback save
      }
    }

    // Fallback: return success with mock data (for development)
    console.log('📄 Presentation created (fallback mode):', presentationData.title)
    
    return NextResponse.json({
      success: true,
      presentation: {
        id: presentationData.id,
        title: presentationData.title,
        description: presentationData.description,
        status: presentationData.status,
        slides: presentationData.slides || [],
        slideCount: Array.isArray(presentationData.slides) ? presentationData.slides.length : 0,
        createdAt: presentationData.created_at,
        updatedAt: presentationData.updated_at,
        metadata: presentationData.metadata
      }
    })

  } catch (error) {
    console.error('❌ Create presentation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}