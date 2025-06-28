import { NextRequest, NextResponse } from 'next/server'
import { AuthSystem } from '@/lib/auth/auth-system'
import { DeckPersistence } from '@/lib/deck-persistence'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('📥 Loading presentation:', id)

    // Handle demo decks (no auth required for demo)
    if (id.startsWith('demo-deck-')) {
      console.log('🎭 Loading demo deck...', id)
      
      // Try to load from global storage first (if deck was recently generated)
      global.demoDeckStorage = global.demoDeckStorage || new Map()
      const storedDeck = global.demoDeckStorage.get(id)
      
      if (storedDeck) {
        console.log('✅ Found generated demo deck in memory with', storedDeck.slides.length, 'slides')
        return NextResponse.json({
          success: true,
          data: storedDeck
        })
      }
      
      // Fallback to default demo presentation for demo deck URLs that don't have generated content
      console.log('📋 Using fallback demo presentation')
      const demoPresentation = {
        id: id,
        title: 'AI-Generated Demo Presentation',
        slides: [
          {
            id: 'slide-title-1',
            title: 'Demo Dataset Analysis',
            content: [
              {
                id: 'element-title-1',
                type: 'text',
                content: { 
                  text: 'Demo Dataset Analysis',
                  html: '<h1>Demo Dataset Analysis</h1>'
                },
                position: { x: 100, y: 100, width: 600, height: 80, rotation: 0 },
                style: { 
                  fontSize: 36, 
                  fontWeight: 'bold', 
                  color: '#1f2937',
                  textAlign: 'center',
                  backgroundColor: 'transparent'
                },
                layer: 1,
                locked: false,
                hidden: false,
                animations: []
              },
              {
                id: 'element-subtitle-1',
                type: 'text',
                content: { 
                  text: 'AI-Generated Insights from Real Data',
                  html: '<p>AI-Generated Insights from Real Data</p>'
                },
                position: { x: 100, y: 200, width: 600, height: 40, rotation: 0 },
                style: { 
                  fontSize: 18, 
                  color: '#6b7280',
                  textAlign: 'center',
                  backgroundColor: 'transparent'
                },
                layer: 2,
                locked: false,
                hidden: false,
                animations: []
              }
            ],
            template: 'title',
            notes: 'Generated from uploaded CSV data',
            duration: 5,
            animations: [],
            background: { type: 'solid', color: '#ffffff' },
            locked: false,
            hidden: false
          },
          {
            id: 'slide-overview-2',
            title: 'Data Overview',
            content: [
              {
                id: 'element-overview-title-2',
                type: 'text',
                content: { 
                  text: 'Data Overview',
                  html: '<h2>Data Overview</h2>'
                },
                position: { x: 100, y: 50, width: 600, height: 60, rotation: 0 },
                style: { 
                  fontSize: 28, 
                  fontWeight: 'bold', 
                  color: '#1f2937',
                  backgroundColor: 'transparent'
                },
                layer: 1,
                locked: false,
                hidden: false,
                animations: []
              },
              {
                id: 'element-overview-content-2',
                type: 'text',
                content: { 
                  text: 'Dataset contains 10 records with 14 columns: Date, Region, Revenue, Units_Sold, Product_Category...',
                  html: '<p>Dataset contains 10 records with 14 columns: Date, Region, Revenue, Units_Sold, Product_Category...</p>'
                },
                position: { x: 100, y: 150, width: 600, height: 100, rotation: 0 },
                style: { 
                  fontSize: 16, 
                  color: '#374151',
                  lineHeight: 1.6,
                  backgroundColor: 'transparent'
                },
                layer: 2,
                locked: false,
                hidden: false,
                animations: []
              }
            ],
            template: 'content',
            notes: 'Overview of the uploaded dataset structure',
            duration: 5,
            animations: [],
            background: { type: 'solid', color: '#ffffff' },
            locked: false,
            hidden: false
          },
          {
            id: 'slide-chart-3',
            title: 'Revenue Analysis',
            content: [
              {
                id: 'element-chart-title-3',
                type: 'text',
                content: { 
                  text: 'Revenue by Region',
                  html: '<h2>Revenue by Region</h2>'
                },
                position: { x: 100, y: 50, width: 600, height: 60, rotation: 0 },
                style: { 
                  fontSize: 28, 
                  fontWeight: 'bold', 
                  color: '#1f2937',
                  backgroundColor: 'transparent'
                },
                layer: 1,
                locked: false,
                hidden: false,
                animations: []
              },
              {
                id: 'element-chart-3',
                type: 'chart',
                content: { 
                  type: 'bar',
                  title: 'Revenue by Region',
                  data: [
                    { name: 'North America', value: 47065.65 },
                    { name: 'Europe', value: 36000.43 },
                    { name: 'Asia Pacific', value: 55650.58 },
                    { name: 'Latin America', value: 28310.45 },
                    { name: 'Middle East', value: 43085.23 }
                  ],
                  colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']
                },
                position: { x: 100, y: 150, width: 600, height: 300, rotation: 0 },
                style: {
                  backgroundColor: '#ffffff',
                  borderColor: '#e5e7eb',
                  borderWidth: 1,
                  borderRadius: 8
                },
                layer: 2,
                locked: false,
                hidden: false,
                animations: []
              }
            ],
            template: 'chart',
            notes: 'Revenue analysis chart generated from real data',
            duration: 7,
            animations: [],
            background: { type: 'solid', color: '#ffffff' },
            locked: false,
            hidden: false
          }
        ],
        theme: {
          colors: {
            primary: '#2563eb',
            secondary: '#64748b',
            accent: '#f59e0b',
            background: '#ffffff',
            text: '#1e293b'
          },
          fonts: {
            heading: 'Inter',
            body: 'Inter',
            monospace: 'JetBrains Mono'
          },
          spacing: 'comfortable'
        },
        settings: {
          aspectRatio: '16:9',
          slideSize: 'standard',
          defaultTransition: 'slide'
        },
        collaborators: [],
        lastModified: new Date()
      }

      console.log('✅ Demo presentation created with', demoPresentation.slides.length, 'slides')
      
      return NextResponse.json({
        success: true,
        data: demoPresentation
      })
    }

    // For real presentations, require auth
    const user = await AuthSystem.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Try to load from drafts first
    const draft = await DeckPersistence.loadDraft(id)
    
    if (draft) {
      // Track view activity
      await DeckPersistence.trackUserActivity('draft_viewed', {
        draftId: id,
        title: draft.title
      })

      return NextResponse.json({
        success: true,
        presentation: draft
      })
    }
    
    // If not found in drafts, try to load from presentations table
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      
      const { data: presentation, error } = await supabase
        .from('presentations')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()
      
      if (error || !presentation) {
        console.log('Presentation not found in presentations table:', error)
        return NextResponse.json(
          { error: 'Presentation not found' },
          { status: 404 }
        )
      }
      
      console.log('✅ Found presentation in presentations table:', presentation.title)
      
      return NextResponse.json({
        success: true,
        data: {
          id: presentation.id,
          title: presentation.title,
          slides: presentation.slides || [],
          theme: {
            colors: {
              primary: '#2563eb',
              secondary: '#64748b',
              accent: '#f59e0b',
              background: '#ffffff',
              text: '#1e293b'
            },
            fonts: {
              heading: 'Inter',
              body: 'Inter',
              monospace: 'JetBrains Mono'
            },
            spacing: 'comfortable'
          },
          settings: {
            aspectRatio: '16:9',
            slideSize: 'standard',
            defaultTransition: 'slide'
          },
          collaborators: [],
          lastModified: new Date(presentation.updated_at || presentation.created_at)
        }
      })
      
    } catch (error) {
      console.error('Error loading from presentations table:', error)
      return NextResponse.json(
        { error: 'Presentation not found' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error loading presentation:', error)
    return NextResponse.json(
      { error: 'Failed to load presentation' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await AuthSystem.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const updateData = await request.json()
    
    // Load existing draft
    const existingDraft = await DeckPersistence.loadDraft(id)
    if (!existingDraft) {
      return NextResponse.json(
        { error: 'Presentation not found' },
        { status: 404 }
      )
    }

    // Update draft with new data
    const updatedDraft = await DeckPersistence.saveDraft({
      ...existingDraft,
      ...updateData,
      id: id, // Ensure we keep the same ID
      lastEditedAt: new Date()
    })

    if (!updatedDraft) {
      return NextResponse.json(
        { error: 'Failed to update presentation' },
        { status: 500 }
      )
    }

    // Track update activity
    await DeckPersistence.trackUserActivity('draft_updated', {
      draftId: id,
      title: updatedDraft.title,
      changes: Object.keys(updateData)
    })

    return NextResponse.json({
      success: true,
      presentation: updatedDraft
    })
  } catch (error) {
    console.error('Error updating presentation:', error)
    return NextResponse.json(
      { error: 'Failed to update presentation' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await AuthSystem.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const success = await DeckPersistence.deleteDraft(id)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete presentation' },
        { status: 500 }
      )
    }

    // Track deletion activity
    await DeckPersistence.trackUserActivity('draft_deleted', {
      draftId: id
    })

    return NextResponse.json({
      success: true,
      message: 'Presentation deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting presentation:', error)
    return NextResponse.json(
      { error: 'Failed to delete presentation' },
      { status: 500 }
    )
  }
}