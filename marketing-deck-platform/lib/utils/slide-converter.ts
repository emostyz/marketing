/**
 * Converts API slide responses to editor-compatible format
 */

export interface APISlideElement {
  id: string
  type: string
  content?: any
  position?: any
  size?: any
  style?: any
  [key: string]: any
}

export interface EditorSlideElement {
  id: string
  type: 'text' | 'image' | 'chart' | 'shape'
  position: { x: number; y: number }
  size: { width: number; height: number }
  rotation: number
  content?: string
  style?: any
  isLocked?: boolean
  metadata?: any
  chartData?: any[]
  chartType?: string
  isVisible?: boolean
}

export interface APISlide {
  id?: string
  title?: string
  subtitle?: string
  content?: any
  elements?: APISlideElement[]
  background?: any
  style?: string
  layout?: string
  charts?: any[]
  keyTakeaways?: string[]
  aiInsights?: any
  notes?: string
  [key: string]: any
}

export interface EditorSlide {
  id: string
  number: number
  title: string
  subtitle?: string
  content?: any
  elements: EditorSlideElement[]
  background: any
  style?: string
  layout?: string
  animation?: any
  customStyles?: any
  charts?: any[]
  keyTakeaways?: string[]
  aiInsights?: any
  notes?: string
}

/**
 * Converts API element to editor-compatible format
 */
export function convertAPIElementToEditor(apiElement: APISlideElement): EditorSlideElement {
  // Ensure valid position
  const position = {
    x: Number(apiElement.position?.x || 100),
    y: Number(apiElement.position?.y || 100)
  }

  // Ensure valid size with minimums
  const size = {
    width: Math.max(50, Number(apiElement.size?.width || 200)),
    height: Math.max(30, Number(apiElement.size?.height || 60))
  }

  // Map API element types to editor types
  let elementType: 'text' | 'image' | 'chart' | 'shape'
  switch (apiElement.type.toLowerCase()) {
    case 'text':
    case 'title':
    case 'heading':
    case 'paragraph':
      elementType = 'text'
      break
    case 'image':
    case 'img':
    case 'picture':
      elementType = 'image'
      break
    case 'chart':
    case 'graph':
    case 'visualization':
    case 'bar':
    case 'line':
    case 'pie':
      elementType = 'chart'
      break
    case 'shape':
    case 'rectangle':
    case 'circle':
    case 'square':
      elementType = 'shape'
      break
    default:
      elementType = 'text'
  }

  // Extract content
  let content = ''
  if (typeof apiElement.content === 'string') {
    content = apiElement.content
  } else if (apiElement.content?.text) {
    content = apiElement.content.text
  } else if (apiElement.content?.html) {
    // Strip HTML tags for text content
    content = apiElement.content.html.replace(/<[^>]*>/g, '')
  } else if (apiElement.text) {
    content = apiElement.text
  } else if (apiElement.title) {
    content = apiElement.title
  }

  // Process chart data
  let chartData: any[] = []
  let chartType = 'bar'
  
  if (elementType === 'chart') {
    if (apiElement.chartData && Array.isArray(apiElement.chartData)) {
      chartData = apiElement.chartData
    } else if (apiElement.data && Array.isArray(apiElement.data)) {
      chartData = apiElement.data
    } else if (apiElement.content?.data && Array.isArray(apiElement.content.data)) {
      chartData = apiElement.content.data
    }

    // Determine chart type
    if (apiElement.chartType) {
      chartType = apiElement.chartType
    } else if (apiElement.type?.includes('bar')) {
      chartType = 'bar'
    } else if (apiElement.type?.includes('line')) {
      chartType = 'line'
    } else if (apiElement.type?.includes('pie')) {
      chartType = 'pie'
    }
  }

  // Process styling
  const style = {
    fontSize: Number(apiElement.style?.fontSize || 16),
    fontFamily: apiElement.style?.fontFamily || 'Inter',
    fontWeight: apiElement.style?.fontWeight || 'normal',
    color: apiElement.style?.color || '#000000',
    backgroundColor: apiElement.style?.backgroundColor || 'transparent',
    textAlign: apiElement.style?.textAlign || 'left',
    padding: apiElement.style?.padding || '8px',
    borderRadius: Number(apiElement.style?.borderRadius || 0),
    borderWidth: Number(apiElement.style?.borderWidth || 0),
    borderColor: apiElement.style?.borderColor || '#000000',
    lineHeight: Number(apiElement.style?.lineHeight || 1.4),
    ...apiElement.style
  }

  return {
    id: apiElement.id || `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: elementType,
    position,
    size,
    rotation: Number(apiElement.rotation || 0),
    content,
    style,
    isLocked: Boolean(apiElement.isLocked || false),
    metadata: apiElement.metadata || {},
    chartData,
    chartType,
    isVisible: apiElement.isVisible !== false
  }
}

/**
 * Converts API slide to editor-compatible format
 */
export function convertAPISlideToEditor(apiSlide: APISlide, slideNumber: number): EditorSlide {
  // Convert all elements
  const elements = (apiSlide.elements || []).map(convertAPIElementToEditor)

  // If slide has no elements, create a basic title element
  if (elements.length === 0 && apiSlide.title) {
    elements.push({
      id: `title_${slideNumber}_${Date.now()}`,
      type: 'text',
      position: { x: 100, y: 100 },
      size: { width: 800, height: 80 },
      rotation: 0,
      content: apiSlide.title,
      style: {
        fontSize: 32,
        fontFamily: 'Inter',
        fontWeight: 'bold',
        color: '#1F2937',
        textAlign: 'center',
        backgroundColor: 'transparent'
      },
      isVisible: true,
      isLocked: false
    })
  }

  return {
    id: apiSlide.id || `slide_${slideNumber}`,
    number: slideNumber,
    title: apiSlide.title || `Slide ${slideNumber}`,
    subtitle: apiSlide.subtitle,
    content: apiSlide.content || {},
    elements,
    background: apiSlide.background || { type: 'solid', value: '#ffffff' },
    style: apiSlide.style || 'modern',
    layout: apiSlide.layout || 'default',
    animation: apiSlide.animation,
    customStyles: apiSlide.customStyles,
    charts: apiSlide.charts || [],
    keyTakeaways: apiSlide.keyTakeaways || [],
    aiInsights: apiSlide.aiInsights || {},
    notes: apiSlide.notes || ''
  }
}

/**
 * Converts multiple API slides to editor format
 */
export function convertAPISlidesToEditor(apiSlides: APISlide[]): EditorSlide[] {
  return apiSlides.map((slide, index) => convertAPISlideToEditor(slide, index + 1))
}

/**
 * Validates that slide elements are properly formatted
 */
export function validateSlideElements(elements: EditorSlideElement[]): EditorSlideElement[] {
  return elements.map(element => {
    // Ensure all required fields exist
    const validated: EditorSlideElement = {
      id: element.id || `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: ['text', 'image', 'chart', 'shape'].includes(element.type) ? element.type : 'text',
      position: {
        x: Math.max(0, Number(element.position?.x || 0)),
        y: Math.max(0, Number(element.position?.y || 0))
      },
      size: {
        width: Math.max(50, Number(element.size?.width || 200)),
        height: Math.max(30, Number(element.size?.height || 60))
      },
      rotation: Number(element.rotation || 0),
      content: String(element.content || ''),
      style: element.style || {},
      isLocked: Boolean(element.isLocked || false),
      metadata: element.metadata || {},
      chartData: Array.isArray(element.chartData) ? element.chartData : [],
      chartType: element.chartType || 'bar',
      isVisible: element.isVisible !== false
    }

    return validated
  })
}

/**
 * Creates a fallback slide if no slides are provided
 */
export function createFallbackSlide(title: string = 'New Presentation'): EditorSlide {
  return {
    id: `slide_${Date.now()}`,
    number: 1,
    title,
    elements: [
      {
        id: `title_${Date.now()}`,
        type: 'text',
        position: { x: 100, y: 200 },
        size: { width: 800, height: 100 },
        rotation: 0,
        content: title,
        style: {
          fontSize: 36,
          fontFamily: 'Inter',
          fontWeight: 'bold',
          color: '#1F2937',
          textAlign: 'center',
          backgroundColor: 'transparent'
        },
        isVisible: true,
        isLocked: false
      }
    ],
    background: { type: 'solid', value: '#ffffff' },
    style: 'modern',
    layout: 'title'
  }
}