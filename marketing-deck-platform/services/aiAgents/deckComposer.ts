/**
 * Deck Composer Service
 * Produces final JSON compatible with WorldClassPresentationEditor and AIDeckBuilder
 * Integrates with your existing successful slide rendering system
 */

import { StyledSlide, validateSlideLayout } from './layoutStyler'
import { PresentationStructure } from './slidePlanner'
import { publishProgress } from './bridge'

export interface FinalDeckJSON {
  id: string
  title: string
  description?: string
  template: string
  slides: StyledSlide[]
  theme: {
    colors: {
      primary: string
      secondary: string
      accent: string
      background: string
      text: string
    }
    fonts: {
      heading: string
      body: string
      monospace: string
    }
    spacing: string
  }
  settings: {
    aspectRatio: string
    slideSize: string
    defaultTransition: string
  }
  collaborators: any[]
  metadata: {
    aiGenerated: boolean
    generatedAt: string
    qualityScore: number
    totalElements: number
    totalCharts: number
    estimatedDuration: number
    narrative: string
    version: string
  }
  lastModified: string
}

// Professional consulting theme
const EXECUTIVE_THEME = {
  colors: {
    primary: '#1e293b',
    secondary: '#64748b',
    accent: '#3B82F6',
    background: '#1e293b',
    text: '#ffffff'
  },
  fonts: {
    heading: 'Inter',
    body: 'Inter', 
    monospace: 'JetBrains Mono'
  },
  spacing: 'comfortable'
}

const DECK_SETTINGS = {
  aspectRatio: '16:9',
  slideSize: 'standard',
  defaultTransition: 'slide'
}

export async function composeFinalDeck(
  deckId: string,
  presentationStructure: PresentationStructure,
  styledSlides: StyledSlide[],
  originalDatasetId?: string
): Promise<FinalDeckJSON> {
  
  try {
    await publishProgress(deckId, 'composing', 'Assembling final presentation JSON')

    // Validate all slides
    const validationResults = styledSlides.map(slide => ({
      slide: slide.id,
      validation: validateSlideLayout(slide)
    }))

    const invalidSlides = validationResults.filter(result => !result.validation.valid)
    if (invalidSlides.length > 0) {
      console.warn(`⚠️  Layout issues found in ${invalidSlides.length} slides:`)
      invalidSlides.forEach(result => {
        console.warn(`   Slide ${result.slide}: ${result.validation.issues.join(', ')}`)
      })
    }

    // Calculate metadata
    const totalElements = styledSlides.reduce((sum, slide) => sum + slide.elements.length, 0)
    const totalCharts = styledSlides.reduce((sum, slide) => 
      sum + slide.elements.filter(el => el.type === 'chart').length, 0
    )

    // Calculate quality score based on various factors
    const qualityScore = calculateQualityScore(styledSlides, invalidSlides.length)

    // Ensure slides are properly numbered and have required fields
    const finalSlides = styledSlides.map((slide, index) => ({
      ...slide,
      number: index + 1,
      // Ensure compatibility with existing SlideCanvas interface
      content: {
        title: slide.title,
        subtitle: slide.subtitle,
        bullets: slide.keyTakeaways || []
      },
      charts: slide.elements
        .filter(el => el.type === 'chart')
        .map(el => ({
          type: el.chartType,
          data: el.chartData,
          title: el.content,
          metadata: el.metadata
        }))
    }))

    const finalDeck: FinalDeckJSON = {
      id: deckId,
      title: presentationStructure.title,
      description: `AI-generated presentation: ${presentationStructure.subtitle}`,
      template: 'Board Update', // Compatible with your existing templates
      slides: finalSlides,
      theme: EXECUTIVE_THEME,
      settings: DECK_SETTINGS,
      collaborators: [],
      metadata: {
        aiGenerated: true,
        generatedAt: new Date().toISOString(),
        qualityScore,
        totalElements,
        totalCharts,
        estimatedDuration: presentationStructure.estimatedDuration,
        narrative: presentationStructure.narrativeArc,
        version: '2.0.0'
      },
      lastModified: new Date().toISOString()
    }

    await publishProgress(deckId, 'composing', 'Final presentation assembled', {
      slideCount: finalSlides.length,
      elementCount: totalElements,
      chartCount: totalCharts,
      qualityScore
    })

    console.log(`✅ Deck composition completed:`)
    console.log(`   - Slides: ${finalSlides.length}`)
    console.log(`   - Elements: ${totalElements}`)
    console.log(`   - Charts: ${totalCharts}`)
    console.log(`   - Quality Score: ${qualityScore}/100`)

    return finalDeck

  } catch (error) {
    await publishProgress(deckId, 'error', `Deck composition failed: ${error.message}`)
    throw new Error(`Deck composition failed: ${error.message}`)
  }
}

function calculateQualityScore(slides: StyledSlide[], layoutIssues: number): number {
  let score = 100

  // Penalize for layout issues
  score -= layoutIssues * 10

  // Bonus for having charts
  const chartSlides = slides.filter(slide => 
    slide.elements.some(el => el.type === 'chart')
  ).length
  score += Math.min(20, chartSlides * 5)

  // Penalize for too many or too few slides
  if (slides.length < 4) score -= 15
  if (slides.length > 8) score -= 10

  // Bonus for consistent elements across slides
  const avgElementsPerSlide = slides.reduce((sum, slide) => sum + slide.elements.length, 0) / slides.length
  if (avgElementsPerSlide >= 2 && avgElementsPerSlide <= 4) {
    score += 10
  }

  // Bonus for having speaker notes
  const slidesWithNotes = slides.filter(slide => slide.notes && slide.notes.length > 0).length
  score += Math.min(10, (slidesWithNotes / slides.length) * 10)

  // Bonus for key takeaways
  const slidesWithTakeaways = slides.filter(slide => 
    slide.keyTakeaways && slide.keyTakeaways.length > 0
  ).length
  score += Math.min(10, (slidesWithTakeaways / slides.length) * 10)

  return Math.max(0, Math.min(100, Math.round(score)))
}

// Helper function to convert to demo deck format (for compatibility)
export function convertToDemoDeckFormat(finalDeck: FinalDeckJSON) {
  return {
    id: finalDeck.id,
    title: finalDeck.title,
    slides: finalDeck.slides.map(slide => ({
      id: slide.id,
      title: slide.title,
      content: slide.elements.map(element => {
        if (element.type === 'text' && element.content?.includes('•')) {
          // Convert bullet points to array
          return {
            type: 'bullets',
            bullets: element.content.split('\n').filter(line => line.trim().startsWith('•')).map(line => line.replace('•', '').trim())
          }
        }
        return {
          type: element.type,
          content: element.content,
          chartData: element.chartData,
          chartType: element.chartType,
          position: element.position,
          size: element.size,
          style: element.style
        }
      }),
      background: slide.background?.value || '#1e293b',
      layout: slide.layout,
      charts: slide.elements
        .filter(el => el.type === 'chart')
        .map(el => ({
          type: el.chartType,
          data: el.chartData,
          title: el.content,
          metadata: el.metadata
        }))
    })),
    metadata: finalDeck.metadata,
    theme: finalDeck.theme
  }
}

// Helper function to ensure compatibility with existing WorldClassPresentationEditor
export function ensureEditorCompatibility(finalDeck: FinalDeckJSON): FinalDeckJSON {
  return {
    ...finalDeck,
    slides: finalDeck.slides.map(slide => ({
      ...slide,
      // Ensure all required fields for SlideCanvas are present
      content: slide.content || {
        title: slide.title,
        subtitle: slide.subtitle || '',
        bullets: slide.keyTakeaways || []
      },
      style: slide.layout,
      animation: slide.animation || { transition: 'slide', duration: 0.5 },
      customStyles: slide.customStyles || {},
      charts: slide.elements
        .filter(el => el.type === 'chart')
        .map(el => ({
          type: el.chartType,
          data: el.chartData || [],
          title: el.content || 'Chart',
          metadata: el.metadata || {}
        })),
      // Add missing fields that WorldClassPresentationEditor expects
      notes: slide.notes || '',
      aiInsights: slide.aiInsights || { generated: true }
    }))
  }
}