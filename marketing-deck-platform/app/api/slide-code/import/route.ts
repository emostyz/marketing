import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserWithDemo } from '@/lib/auth/api-auth'
import { createServerSupabaseClient } from '@/lib/supabase/server-client'
import { 
  importSlideFromCode, 
  importPresentationFromCode, 
  importFromFormat 
} from '@/lib/slide-code/slide-exporter'
import { validateSlideCode, validatePresentationCode } from '@/lib/slide-code/slide-schema'

export async function POST(request: NextRequest) {
  try {
    const { code, format = 'json', type = 'presentation' } = await request.json()
    
    // Get authenticated user
    const { user, isDemo } = await getAuthenticatedUserWithDemo()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const supabase = await createServerSupabaseClient()

    // Parse the code based on format
    let codeObject
    try {
      if (format === 'json') {
        codeObject = JSON.parse(code)
      } else {
        codeObject = importFromFormat(code, format as any)
      }
    } catch (parseError) {
      return NextResponse.json({ 
        error: 'Invalid code format',
        details: parseError instanceof Error ? parseError.message : 'Failed to parse code'
      }, { status: 400 })
    }

    if (type === 'slide') {
      // Import single slide
      if (!validateSlideCode(codeObject)) {
        return NextResponse.json({ error: 'Invalid slide code structure' }, { status: 400 })
      }

      const slide = importSlideFromCode(codeObject)
      
      // Create slide in database
      const { data: createdSlide, error: slideError } = await supabase
        .from('slides')
        .insert({
          title: slide.title,
          layout: slide.layout?.type || 'content',
          background_color: slide.background?.value || '#ffffff',
          order_index: 0,
          design_config: {
            theme: slide.theme,
            layout: slide.layout,
            businessContext: slide.metadata?.businessContext
          }
        })
        .select()
        .single()

      if (slideError) {
        return NextResponse.json({ 
          error: 'Failed to create slide',
          details: slideError.message 
        }, { status: 500 })
      }

      // Create elements
      for (const element of slide.elements) {
        await supabase
          .from('elements')
          .insert({
            slide_id: createdSlide.id,
            type: element.type,
            content: element.content,
            position_x: element.position.x,
            position_y: element.position.y,
            width: element.size.width,
            height: element.size.height,
            style: element.style,
            chart_config: element.chartConfig,
            z_index: element.position.z || 0,
            design_metadata: element.metadata,
            animations: element.animations
          })
      }

      return NextResponse.json({
        success: true,
        slideId: createdSlide.id,
        slide: slide,
        metadata: {
          elementsCreated: slide.elements.length,
          importedAt: new Date().toISOString(),
          originalVersion: codeObject.version
        }
      })
    }

    if (type === 'presentation') {
      // Import entire presentation
      if (!validatePresentationCode(codeObject)) {
        return NextResponse.json({ error: 'Invalid presentation code structure' }, { status: 400 })
      }

      const presentation = importPresentationFromCode(codeObject)
      
      // Create presentation in database
      const { data: createdPresentation, error: presentationError } = await supabase
        .from('presentations')
        .insert({
          user_id: user.id,
          title: presentation.title,
          description: presentation.description,
          template_name: presentation.theme?.name || 'Professional',
          context: presentation.businessContext,
          quality_score: presentation.aiContext?.qualityScore || 85,
          slide_count: presentation.slides.length,
          slides: presentation.slides // Store complete slide data
        })
        .select()
        .single()

      if (presentationError) {
        return NextResponse.json({ 
          error: 'Failed to create presentation',
          details: presentationError.message 
        }, { status: 500 })
      }

      // Create slides and elements
      let createdSlides = 0
      let createdElements = 0

      for (const [index, slide] of presentation.slides.entries()) {
        // Create slide
        const { data: createdSlide, error: slideError } = await supabase
          .from('slides')
          .insert({
            presentation_id: createdPresentation.id,
            title: slide.title,
            layout: slide.layout?.type || 'content',
            background_color: slide.background?.value || '#ffffff',
            order_index: index,
            design_config: {
              theme: slide.theme,
              layout: slide.layout,
              businessContext: slide.metadata?.businessContext
            }
          })
          .select()
          .single()

        if (!slideError && createdSlide) {
          createdSlides++

          // Create elements for this slide
          for (const element of slide.elements) {
            const { error: elementError } = await supabase
              .from('elements')
              .insert({
                slide_id: createdSlide.id,
                type: element.type,
                content: element.content,
                position_x: element.position.x,
                position_y: element.position.y,
                width: element.size.width,
                height: element.size.height,
                style: element.style,
                chart_config: element.chartConfig,
                z_index: element.position.z || 0,
                design_metadata: element.metadata,
                animations: element.animations
              })

            if (!elementError) {
              createdElements++
            }
          }
        }
      }

      return NextResponse.json({
        success: true,
        presentationId: createdPresentation.id,
        presentation: presentation,
        metadata: {
          slidesCreated: createdSlides,
          elementsCreated: createdElements,
          totalSlides: presentation.slides.length,
          importedAt: new Date().toISOString(),
          originalVersion: codeObject.version,
          qualityScore: codeObject.aiContext?.qualityScore || 85
        }
      })
    }

    return NextResponse.json({ error: 'Invalid type. Must be "slide" or "presentation"' }, { status: 400 })

  } catch (error) {
    console.error('Slide code import error:', error)
    return NextResponse.json({
      error: 'Import failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Generate slide from code (for AI training)
export async function PUT(request: NextRequest) {
  try {
    const { code, updateExisting = false, slideId } = await request.json()
    
    const { user, isDemo } = await getAuthenticatedUserWithDemo()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const supabase = await createServerSupabaseClient()

    // Parse and validate slide code
    let slideCode
    try {
      slideCode = typeof code === 'string' ? JSON.parse(code) : code
    } catch (parseError) {
      return NextResponse.json({ error: 'Invalid JSON code' }, { status: 400 })
    }

    if (!validateSlideCode(slideCode)) {
      return NextResponse.json({ error: 'Invalid slide code structure' }, { status: 400 })
    }

    const slide = importSlideFromCode(slideCode)

    if (updateExisting && slideId) {
      // Update existing slide
      const { data: updatedSlide, error: updateError } = await supabase
        .from('slides')
        .update({
          title: slide.title,
          layout: slide.layout?.type || 'content',
          background_color: slide.background?.value || '#ffffff',
          design_config: {
            theme: slide.theme,
            layout: slide.layout,
            businessContext: slide.metadata?.businessContext,
            updatedFromCode: true,
            codeVersion: slideCode.version
          }
        })
        .eq('id', slideId)
        .select()
        .single()

      if (updateError) {
        return NextResponse.json({ 
          error: 'Failed to update slide',
          details: updateError.message 
        }, { status: 500 })
      }

      // Delete existing elements and recreate
      await supabase
        .from('elements')
        .delete()
        .eq('slide_id', slideId)

      // Create new elements
      for (const element of slide.elements) {
        await supabase
          .from('elements')
          .insert({
            slide_id: slideId,
            type: element.type,
            content: element.content,
            position_x: element.position.x,
            position_y: element.position.y,
            width: element.size.width,
            height: element.size.height,
            style: element.style,
            chart_config: element.chartConfig,
            z_index: element.position.z || 0,
            design_metadata: element.metadata,
            animations: element.animations
          })
      }

      return NextResponse.json({
        success: true,
        slideId: slideId,
        slide: slide,
        action: 'updated',
        metadata: {
          elementsRecreated: slide.elements.length,
          updatedAt: new Date().toISOString(),
          codeVersion: slideCode.version
        }
      })
    } else {
      // Create new slide (same as POST)
      return NextResponse.json({ error: 'Use POST to create new slides' }, { status: 400 })
    }

  } catch (error) {
    console.error('Slide code update error:', error)
    return NextResponse.json({
      error: 'Update failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}