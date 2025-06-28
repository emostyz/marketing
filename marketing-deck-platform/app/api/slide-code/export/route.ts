import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/api-auth'
import { createServerSupabaseClient } from '@/lib/supabase/server-client'
import { 
  exportSlideToCode, 
  exportPresentationToCode, 
  exportToFormat 
} from '@/lib/slide-code/slide-exporter'

export async function POST(request: NextRequest) {
  try {
    const { slideId, presentationId, format = 'json' } = await request.json()
    
    // Get authenticated user
    const user = await requireAuth()

    const supabase = await createServerSupabaseClient()

    if (slideId) {
      // Export single slide
      const { data: slide, error } = await supabase
        .from('slides')
        .select(`
          *,
          elements (*)
        `)
        .eq('id', slideId)
        .single()

      if (error || !slide) {
        return NextResponse.json({ error: 'Slide not found' }, { status: 404 })
      }

      const slideCode = exportSlideToCode(slide)
      const formattedCode = format === 'json' 
        ? JSON.stringify(slideCode, null, 2)
        : exportToFormat(slide, format as any)

      return NextResponse.json({
        success: true,
        code: formattedCode,
        format,
        slideCode,
        metadata: {
          slideId: slide.id,
          title: slide.title,
          elementCount: slide.elements?.length || 0,
          exportedAt: new Date().toISOString()
        }
      })
    }

    if (presentationId) {
      // Export entire presentation
      const { data: presentation, error } = await supabase
        .from('presentations')
        .select(`
          *,
          slides (
            *,
            elements (*)
          )
        `)
        .eq('id', presentationId)
        .eq('user_id', user.id)
        .single()

      if (error || !presentation) {
        return NextResponse.json({ error: 'Presentation not found' }, { status: 404 })
      }

      const presentationCode = exportPresentationToCode(presentation)
      const formattedCode = format === 'json' 
        ? JSON.stringify(presentationCode, null, 2)
        : exportToFormat(presentation, format as any)

      return NextResponse.json({
        success: true,
        code: formattedCode,
        format,
        presentationCode,
        metadata: {
          presentationId: presentation.id,
          title: presentation.title,
          slideCount: presentation.slides?.length || 0,
          totalElements: presentation.slides?.reduce((sum: number, slide: any) => 
            sum + (slide.elements?.length || 0), 0) || 0,
          exportedAt: new Date().toISOString(),
          qualityScore: presentationCode.aiContext?.qualityScore || 0
        }
      })
    }

    return NextResponse.json({ error: 'Must provide slideId or presentationId' }, { status: 400 })

  } catch (error) {
    console.error('Slide code export error:', error)
    return NextResponse.json({
      error: 'Export failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slideId = searchParams.get('slideId')
    const presentationId = searchParams.get('presentationId')
    const format = searchParams.get('format') || 'json'

    // Redirect to POST with same parameters
    return NextResponse.json({ 
      message: 'Use POST method for exports',
      example: {
        method: 'POST',
        body: { slideId, presentationId, format }
      }
    })

  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}