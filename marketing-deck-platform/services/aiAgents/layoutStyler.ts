/**
 * Layout Styler Service
 * Converts slide outlines + chart configs into positioned slide elements
 * Compatible with your existing SlideCanvas and SlideElementRenderer
 */

import { SlideOutline } from './slidePlanner'
import { ChartConfig, chartConfigToSlideElement } from './chartBuilder'

export interface PositionedSlideElement {
  id: string
  type: 'text' | 'chart' | 'image' | 'shape'
  position: { x: number; y: number }
  size: { width: number; height: number }
  rotation: number
  content?: string
  style?: any
  chartData?: any[]
  chartType?: string
  metadata?: any
  isVisible: boolean
  isLocked: boolean
}

export interface StyledSlide {
  id: string
  number: number
  title: string
  subtitle?: string
  elements: PositionedSlideElement[]
  background: any
  layout: string
  animation?: any
  customStyles?: any
  keyTakeaways?: string[]
  aiInsights?: any
  notes?: string
}

// Standard 16:9 slide dimensions (1280x720)
const SLIDE_WIDTH = 1280
const SLIDE_HEIGHT = 720

// Layout templates with precise positioning
const LAYOUT_TEMPLATES = {
  'title-only': {
    title: { x: 64, y: 280, width: 1152, height: 160 },
    subtitle: { x: 64, y: 440, width: 1152, height: 80 }
  },
  'executive-summary': {
    title: { x: 64, y: 64, width: 1152, height: 80 },
    bullets: { x: 64, y: 180, width: 1152, height: 460 }
  },
  'text-left-chart-right': {
    title: { x: 64, y: 64, width: 1152, height: 80 },
    bullets: { x: 64, y: 180, width: 500, height: 460 },
    chart: { x: 640, y: 180, width: 576, height: 460 }
  },
  'text-right-chart-left': {
    title: { x: 64, y: 64, width: 1152, height: 80 },
    chart: { x: 64, y: 180, width: 576, height: 460 },
    bullets: { x: 720, y: 180, width: 496, height: 460 }
  },
  'chart-focus': {
    title: { x: 64, y: 64, width: 1152, height: 80 },
    chart: { x: 140, y: 160, width: 1000, height: 480 },
    subtitle: { x: 64, y: 660, width: 1152, height: 40 }
  },
  'bullets-only': {
    title: { x: 64, y: 64, width: 1152, height: 80 },
    bullets: { x: 64, y: 180, width: 1152, height: 460 }
  }
}

const CONSULTING_COLORS = {
  primary: '#1e293b',
  secondary: '#64748b', 
  accent: '#3B82F6',
  text: '#ffffff',
  background: '#1e293b'
}

const FONT_STYLES = {
  title: {
    fontSize: 44,
    fontWeight: '700',
    fontFamily: 'Inter',
    color: CONSULTING_COLORS.text,
    lineHeight: 1.2
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '400', 
    fontFamily: 'Inter',
    color: CONSULTING_COLORS.secondary,
    lineHeight: 1.3
  },
  bullets: {
    fontSize: 20,
    fontWeight: '400',
    fontFamily: 'Inter',
    color: CONSULTING_COLORS.text,
    lineHeight: 1.5
  }
}

export function layoutStyler(
  slideOutlines: SlideOutline[],
  chartConfigs: ChartConfig[]
): StyledSlide[] {
  
  console.log(`🎨 Starting layout styling for ${slideOutlines.length} slides with ${chartConfigs.length} charts`)
  
  return slideOutlines.map((outline, index) => {
    const slideCharts = chartConfigs.filter(chart => chart.slideId === outline.id)
    const template = LAYOUT_TEMPLATES[outline.layout] || LAYOUT_TEMPLATES['bullets-only']
    
    const elements: PositionedSlideElement[] = []
    let elementCounter = 0

    // Add title element
    if (template.title) {
      elements.push({
        id: `title_${outline.id}_${elementCounter++}`,
        type: 'text',
        position: { x: template.title.x, y: template.title.y },
        size: { width: template.title.width, height: template.title.height },
        rotation: 0,
        content: outline.title,
        style: {
          ...FONT_STYLES.title,
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          padding: '0',
          backgroundColor: 'transparent'
        },
        isVisible: true,
        isLocked: false
      })
    }

    // Add subtitle if present and template supports it
    if (outline.subtitle && template.subtitle) {
      elements.push({
        id: `subtitle_${outline.id}_${elementCounter++}`,
        type: 'text',
        position: { x: template.subtitle.x, y: template.subtitle.y },
        size: { width: template.subtitle.width, height: template.subtitle.height },
        rotation: 0,
        content: outline.subtitle,
        style: {
          ...FONT_STYLES.subtitle,
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          padding: '0',
          backgroundColor: 'transparent'
        },
        isVisible: true,
        isLocked: false
      })
    }

    // Add bullets if template supports them
    if (outline.bullets.length > 0 && template.bullets) {
      const bulletsContent = outline.bullets
        .slice(0, 5) // Max 5 bullets for readability
        .map(bullet => `• ${bullet}`)
        .join('\n')

      elements.push({
        id: `bullets_${outline.id}_${elementCounter++}`,
        type: 'text',
        position: { x: template.bullets.x, y: template.bullets.y },
        size: { width: template.bullets.width, height: template.bullets.height },
        rotation: 0,
        content: bulletsContent,
        style: {
          ...FONT_STYLES.bullets,
          textAlign: 'left',
          display: 'flex',
          alignItems: 'flex-start',
          padding: '16px',
          backgroundColor: 'transparent',
          whiteSpace: 'pre-line'
        },
        isVisible: true,
        isLocked: false
      })
    }

    // Add chart if available and template supports it
    if (slideCharts.length > 0 && template.chart) {
      const chart = slideCharts[0] // Use first chart for this slide
      const chartElement = chartConfigToSlideElement(
        chart,
        { x: template.chart.x, y: template.chart.y },
        { width: template.chart.width, height: template.chart.height }
      )
      elements.push(chartElement)
    }

    // Handle special chart-focus layout
    if (outline.layout === 'chart-focus' && slideCharts.length > 0) {
      const chart = slideCharts[0]
      const chartElement = chartConfigToSlideElement(
        chart,
        { x: template.chart!.x, y: template.chart!.y },
        { width: template.chart!.width, height: template.chart!.height }
      )
      elements.push(chartElement)

      // Add chart insight as subtitle
      if (chart.metadata.insight && template.subtitle) {
        elements.push({
          id: `insight_${outline.id}_${elementCounter++}`,
          type: 'text',
          position: { x: template.subtitle.x, y: template.subtitle.y },
          size: { width: template.subtitle.width, height: template.subtitle.height },
          rotation: 0,
          content: chart.metadata.insight,
          style: {
            ...FONT_STYLES.subtitle,
            textAlign: 'center',
            fontStyle: 'italic',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0',
            backgroundColor: 'transparent'
          },
          isVisible: true,
          isLocked: false
        })
      }
    }

    // Create styled slide
    const styledSlide: StyledSlide = {
      id: outline.id,
      number: outline.slideNumber,
      title: outline.title,
      subtitle: outline.subtitle,
      elements,
      background: {
        type: 'solid',
        value: CONSULTING_COLORS.background
      },
      layout: outline.layout,
      animation: {
        transition: 'slide',
        duration: 0.5
      },
      customStyles: {
        consultingTheme: true,
        palette: 'executive'
      },
      keyTakeaways: outline.bullets.slice(0, 3), // Top 3 bullets as takeaways
      aiInsights: {
        priority: outline.priority,
        estimatedDuration: outline.estimatedDuration,
        chartCount: slideCharts.length,
        generated: true
      },
      notes: outline.speakerNotes || `Slide ${outline.slideNumber}: ${outline.title}`
    }

    console.log(`✅ Styled slide ${outline.slideNumber}: ${elements.length} elements, layout: ${outline.layout}`)
    
    return styledSlide
  })
}

// Helper function to adjust positioning for different aspect ratios
export function adjustForAspectRatio(
  elements: PositionedSlideElement[],
  targetWidth: number,
  targetHeight: number
): PositionedSlideElement[] {
  const scaleX = targetWidth / SLIDE_WIDTH
  const scaleY = targetHeight / SLIDE_HEIGHT

  return elements.map(element => ({
    ...element,
    position: {
      x: Math.round(element.position.x * scaleX),
      y: Math.round(element.position.y * scaleY)
    },
    size: {
      width: Math.round(element.size.width * scaleX),
      height: Math.round(element.size.height * scaleY)
    }
  }))
}

// Helper function to ensure minimum spacing between elements
export function enforceMinimumSpacing(elements: PositionedSlideElement[]): PositionedSlideElement[] {
  const minSpacing = 16
  const sortedElements = [...elements].sort((a, b) => a.position.y - b.position.y)
  
  for (let i = 1; i < sortedElements.length; i++) {
    const current = sortedElements[i]
    const previous = sortedElements[i - 1]
    
    const previousBottom = previous.position.y + previous.size.height
    const currentTop = current.position.y
    
    if (currentTop < previousBottom + minSpacing) {
      current.position.y = previousBottom + minSpacing
      
      // Ensure element doesn't go off slide
      if (current.position.y + current.size.height > SLIDE_HEIGHT) {
        current.size.height = SLIDE_HEIGHT - current.position.y - minSpacing
      }
    }
  }
  
  return elements
}

// Quality check for layout
export function validateSlideLayout(slide: StyledSlide): { valid: boolean; issues: string[] } {
  const issues: string[] = []
  
  // Check for overlapping elements
  for (let i = 0; i < slide.elements.length; i++) {
    for (let j = i + 1; j < slide.elements.length; j++) {
      const el1 = slide.elements[i]
      const el2 = slide.elements[j]
      
      if (elementsOverlap(el1, el2)) {
        issues.push(`Elements ${el1.id} and ${el2.id} overlap`)
      }
    }
  }
  
  // Check for elements outside slide bounds
  slide.elements.forEach(element => {
    if (element.position.x < 0 || element.position.y < 0) {
      issues.push(`Element ${element.id} has negative position`)
    }
    
    if (element.position.x + element.size.width > SLIDE_WIDTH) {
      issues.push(`Element ${element.id} extends beyond slide width`)
    }
    
    if (element.position.y + element.size.height > SLIDE_HEIGHT) {
      issues.push(`Element ${element.id} extends beyond slide height`)
    }
  })
  
  // Check for minimum element sizes
  slide.elements.forEach(element => {
    if (element.size.width < 50 || element.size.height < 30) {
      issues.push(`Element ${element.id} is too small`)
    }
  })
  
  return {
    valid: issues.length === 0,
    issues
  }
}

function elementsOverlap(el1: PositionedSlideElement, el2: PositionedSlideElement): boolean {
  return !(
    el1.position.x + el1.size.width <= el2.position.x ||
    el2.position.x + el2.size.width <= el1.position.x ||
    el1.position.y + el1.size.height <= el2.position.y ||
    el2.position.y + el2.size.height <= el1.position.y
  )
}