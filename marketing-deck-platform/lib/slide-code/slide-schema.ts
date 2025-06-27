/**
 * Complete slide code schema for export/import system
 * This defines the exact structure that can be used to recreate slides
 */

export interface SlideCodeElement {
  id: string
  type: 'text' | 'image' | 'chart' | 'shape' | 'table' | 'callout' | 'metric'
  position: {
    x: number
    y: number
    z: number // layer order
  }
  size: {
    width: number
    height: number
  }
  rotation: number
  content: string | any
  style: {
    // Typography
    fontSize?: number
    fontFamily?: string
    fontWeight?: string | number
    fontStyle?: 'normal' | 'italic'
    lineHeight?: number
    letterSpacing?: number
    textAlign?: 'left' | 'center' | 'right' | 'justify'
    textDecoration?: 'none' | 'underline' | 'line-through'
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
    
    // Colors
    color?: string
    backgroundColor?: string
    borderColor?: string
    shadowColor?: string
    
    // Spacing & Layout
    padding?: string | number
    margin?: string | number
    
    // Border & Effects
    borderWidth?: number
    borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted'
    borderRadius?: number
    boxShadow?: string
    
    // Transforms & Effects
    opacity?: number
    filter?: string
    transform?: string
    
    // Gradients
    backgroundImage?: string
    backgroundSize?: string
    backgroundPosition?: string
    backgroundRepeat?: string
    
    // Advanced styling
    clipPath?: string
    maskImage?: string
    backdropFilter?: string
  }
  animations?: {
    entrance?: {
      type: 'fadeIn' | 'slideIn' | 'zoomIn' | 'bounceIn' | 'rotateIn'
      duration: number
      delay: number
      easing: string
    }
    hover?: {
      scale?: number
      translate?: { x: number, y: number }
      rotate?: number
      opacity?: number
      filter?: string
    }
    focus?: {
      scale?: number
      boxShadow?: string
      borderColor?: string
    }
  }
  interactivity?: {
    clickable?: boolean
    hoverable?: boolean
    draggable?: boolean
    resizable?: boolean
    selectable?: boolean
  }
  chartConfig?: TremorChartConfig
  metadata?: {
    elementType: string
    businessRelevance: 'low' | 'medium' | 'high' | 'critical'
    visualPriority: 'background' | 'supporting' | 'primary' | 'hero'
    contentSource: 'user' | 'ai' | 'template' | 'data'
    lastModified: string
    version: string
  }
}

export interface TremorChartConfig {
  type: 'bar' | 'line' | 'area' | 'pie' | 'donut' | 'scatter' | 'heatmap' | 'funnel' | 'gauge' | 'treemap'
  title: string
  subtitle?: string
  data: Array<Record<string, any>>
  
  // Data mapping
  xAxisKey: string
  yAxisKey: string | string[]
  categoryKey?: string
  valueKey?: string
  
  // Styling
  colors: string[]
  colorPalette?: 'blue' | 'emerald' | 'violet' | 'amber' | 'red' | 'neutral' | 'stone' | 'custom'
  
  // Axes
  showXAxis: boolean
  showYAxis: boolean
  xAxisLabel?: string
  yAxisLabel?: string
  xAxisType?: 'linear' | 'logarithmic' | 'category' | 'time'
  yAxisType?: 'linear' | 'logarithmic'
  
  // Grid & Lines
  showGrid: boolean
  showGridLines: boolean
  gridColor?: string
  gridOpacity?: number
  
  // Legend
  showLegend: boolean
  legendPosition: 'top' | 'bottom' | 'left' | 'right'
  
  // Tooltips
  showTooltip: boolean
  tooltipConfig?: {
    formatter?: string
    backgroundColor?: string
    borderColor?: string
    borderRadius?: number
  }
  
  // Animation
  animateOnLoad: boolean
  animationDuration?: number
  animationEasing?: string
  
  // Interactivity
  enableZoom?: boolean
  enablePan?: boolean
  enableBrush?: boolean
  enableCrosshair?: boolean
  
  // Advanced
  margin?: { top: number, right: number, bottom: number, left: number }
  height?: number
  width?: number
  responsive?: boolean
  
  // Tremor-specific
  className?: string
  variant?: 'default' | 'simple'
  stack?: boolean
  relative?: boolean
  curveType?: 'linear' | 'natural' | 'monotone' | 'step'
  connectNulls?: boolean
  
  // Business context for AI training
  businessMetric?: string
  insightLevel?: 'operational' | 'tactical' | 'strategic'
  audienceLevel?: 'analyst' | 'manager' | 'executive'
  
  // McKinsey-style enhancements
  consultingStyle?: {
    emphasizeInsight?: boolean
    calloutValue?: number | string
    calloutLabel?: string
    benchmark?: {
      value: number
      label: string
      color: string
    }
    annotations?: Array<{
      x: number | string
      y: number
      text: string
      color?: string
    }>
  }
}

export interface SlideCodeLayout {
  type: 'title' | 'content' | 'twoColumn' | 'threeColumn' | 'dashboard' | 'fullCanvas' | 'comparison'
  grid: {
    columns: number
    rows: number
    gap: number
  }
  margins: {
    top: number
    right: number
    bottom: number
    left: number
  }
  contentAreas: Array<{
    id: string
    x: number
    y: number
    width: number
    height: number
    purpose: 'title' | 'subtitle' | 'content' | 'chart' | 'metric' | 'image' | 'callout'
  }>
}

export interface SlideCodeTheme {
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    neutral: string
    background: string
    surface: string
    text: string
    textSecondary: string
    border: string
    success: string
    warning: string
    error: string
  }
  typography: {
    fontFamily: string
    headingFont?: string
    sizes: {
      xs: number
      sm: number
      base: number
      lg: number
      xl: number
      '2xl': number
      '3xl': number
      '4xl': number
      '5xl': number
      '6xl': number
    }
    weights: {
      light: number
      normal: number
      medium: number
      semibold: number
      bold: number
      black: number
    }
    lineHeights: {
      tight: number
      normal: number
      relaxed: number
      loose: number
    }
  }
  spacing: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
    '2xl': number
    '3xl': number
    '4xl': number
    '5xl': number
    '6xl': number
  }
  borderRadius: {
    none: number
    sm: number
    md: number
    lg: number
    xl: number
    full: number
  }
  shadows: {
    sm: string
    md: string
    lg: string
    xl: string
    inner: string
  }
  effects: {
    blur: {
      sm: string
      md: string
      lg: string
    }
    brightness: {
      low: number
      normal: number
      high: number
    }
    contrast: {
      low: number
      normal: number
      high: number
    }
  }
}

export interface SlideCode {
  id: string
  version: string
  createdAt: string
  lastModified: string
  
  // Slide Properties
  title: string
  subtitle?: string
  slideNumber: number
  layout: SlideCodeLayout
  theme: SlideCodeTheme
  
  // Elements
  elements: SlideCodeElement[]
  
  // Background
  background: {
    type: 'solid' | 'gradient' | 'image' | 'pattern'
    value: string
    opacity?: number
    overlay?: {
      color: string
      opacity: number
    }
  }
  
  // Animations & Transitions
  slideTransition?: {
    type: 'slide' | 'fade' | 'zoom' | 'flip' | 'cube'
    duration: number
    easing: string
  }
  
  // Business Context (for AI training)
  businessContext?: {
    slideType: 'title' | 'agenda' | 'insights' | 'analysis' | 'recommendations' | 'conclusion'
    industry: string
    audience: 'analyst' | 'manager' | 'executive' | 'board'
    purpose: string
    keyMessage: string
    dataSource?: string
    confidenceLevel?: number
    businessImpact?: 'low' | 'medium' | 'high' | 'critical'
  }
  
  // AI Training Data
  aiTrainingContext?: {
    templateQuality: 'basic' | 'professional' | 'executive' | 'mckinsey'
    designPrinciples: string[]
    userFeedback?: {
      rating: number
      comments: string
      improvements: string[]
    }
    performanceMetrics?: {
      timeToCreate: number
      userSatisfaction: number
      businessValue: number
    }
  }
  
  // Metadata
  metadata: {
    generatedBy: 'user' | 'ai' | 'template'
    generationMethod?: string
    parentSlideId?: string
    tags: string[]
    categories: string[]
    searchKeywords: string[]
    isTemplate: boolean
    isPublic: boolean
    usageCount?: number
    rating?: number
  }
}

export interface PresentationCode {
  id: string
  version: string
  createdAt: string
  lastModified: string
  
  // Presentation Properties
  title: string
  description?: string
  author: string
  company?: string
  
  // Slides
  slides: SlideCode[]
  
  // Global Settings
  theme: SlideCodeTheme
  defaultLayout: SlideCodeLayout
  
  // Presentation Settings
  settings: {
    aspectRatio: '16:9' | '4:3' | '16:10'
    dimensions: { width: number, height: number }
    defaultTransition: SlideCode['slideTransition']
    autoAdvance?: {
      enabled: boolean
      duration: number
    }
    loop?: boolean
    enableRemote?: boolean
  }
  
  // Business Context
  businessContext: {
    purpose: string
    audience: string
    duration: number
    industry: string
    objectives: string[]
    keyMessages: string[]
    callToAction?: string
  }
  
  // AI Training Context
  aiContext?: {
    dataSource: string
    analysisType: string
    insightCount: number
    chartCount: number
    qualityScore: number
    templateUsed?: string
    generationTime: number
    userCustomizations: number
  }
}

// Validation schemas
export const validateSlideCode = (slide: any): slide is SlideCode => {
  return (
    typeof slide.id === 'string' &&
    typeof slide.title === 'string' &&
    typeof slide.slideNumber === 'number' &&
    Array.isArray(slide.elements) &&
    slide.layout &&
    slide.theme &&
    slide.background
  )
}

export const validatePresentationCode = (presentation: any): presentation is PresentationCode => {
  return (
    typeof presentation.id === 'string' &&
    typeof presentation.title === 'string' &&
    Array.isArray(presentation.slides) &&
    presentation.slides.every(validateSlideCode) &&
    presentation.theme &&
    presentation.settings
  )
}

// Helper functions for code generation
export const generateSlideCode = (slide: any): SlideCode => {
  return {
    id: slide.id || `slide_${Date.now()}`,
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    title: slide.title || 'Untitled Slide',
    subtitle: slide.subtitle,
    slideNumber: slide.number || 1,
    layout: slide.layout || getDefaultLayout(),
    theme: slide.theme || getDefaultTheme(),
    elements: slide.elements?.map(generateElementCode) || [],
    background: slide.background || { type: 'solid', value: '#ffffff' },
    slideTransition: slide.slideTransition || {
      type: 'fade',
      duration: 300,
      easing: 'ease-in-out'
    },
    businessContext: slide.businessContext,
    aiTrainingContext: slide.aiTrainingContext,
    metadata: {
      generatedBy: 'ai',
      tags: extractTags(slide),
      categories: extractCategories(slide),
      searchKeywords: extractKeywords(slide),
      isTemplate: false,
      isPublic: false
    }
  }
}

export const generateElementCode = (element: any): SlideCodeElement => {
  return {
    id: element.id || `element_${Date.now()}`,
    type: element.type || 'text',
    position: {
      x: element.position?.x || 0,
      y: element.position?.y || 0,
      z: element.position?.z || 0
    },
    size: {
      width: element.size?.width || 200,
      height: element.size?.height || 50
    },
    rotation: element.rotation || 0,
    content: element.content || '',
    style: {
      fontSize: element.style?.fontSize || 16,
      fontFamily: element.style?.fontFamily || 'Inter',
      fontWeight: element.style?.fontWeight || 'normal',
      color: element.style?.color || '#1F2937',
      backgroundColor: element.style?.backgroundColor || 'transparent',
      textAlign: element.style?.textAlign || 'left',
      ...element.style
    },
    animations: element.animations,
    interactivity: element.interactivity || {
      clickable: false,
      hoverable: true,
      draggable: true,
      resizable: true,
      selectable: true
    },
    chartConfig: element.chartConfig,
    metadata: {
      elementType: element.type || 'text',
      businessRelevance: element.metadata?.businessRelevance || 'medium',
      visualPriority: element.metadata?.visualPriority || 'supporting',
      contentSource: element.metadata?.contentSource || 'ai',
      lastModified: new Date().toISOString(),
      version: '1.0.0'
    }
  }
}

// Default configurations
export const getDefaultTheme = (): SlideCodeTheme => ({
  name: 'Professional',
  colors: {
    primary: '#1e40af',
    secondary: '#64748b',
    accent: '#3b82f6',
    neutral: '#6b7280',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1f2937',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626'
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    headingFont: 'Inter, system-ui, sans-serif',
    sizes: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
      '5xl': 48,
      '6xl': 60
    },
    weights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      black: 900
    },
    lineHeights: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
    '4xl': 80,
    '5xl': 96,
    '6xl': 128
  },
  borderRadius: {
    none: 0,
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
    full: 9999
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
  },
  effects: {
    blur: {
      sm: 'blur(4px)',
      md: 'blur(8px)',
      lg: 'blur(16px)'
    },
    brightness: {
      low: 0.75,
      normal: 1,
      high: 1.25
    },
    contrast: {
      low: 0.75,
      normal: 1,
      high: 1.25
    }
  }
})

export const getDefaultLayout = (): SlideCodeLayout => ({
  type: 'content',
  grid: {
    columns: 12,
    rows: 8,
    gap: 16
  },
  margins: {
    top: 60,
    right: 60,
    bottom: 60,
    left: 60
  },
  contentAreas: [
    {
      id: 'title',
      x: 0,
      y: 0,
      width: 12,
      height: 1,
      purpose: 'title'
    },
    {
      id: 'content',
      x: 0,
      y: 2,
      width: 12,
      height: 6,
      purpose: 'content'
    }
  ]
})

// Utility functions
export const extractTags = (slide: any): string[] => {
  const tags = []
  if (slide.title) tags.push('titled')
  if (slide.elements?.some((e: any) => e.type === 'chart')) tags.push('chart')
  if (slide.elements?.some((e: any) => e.type === 'image')) tags.push('image')
  if (slide.elements?.some((e: any) => e.type === 'metric')) tags.push('metrics')
  return tags
}

export const extractCategories = (slide: any): string[] => {
  const categories = []
  if (slide.businessContext?.slideType) {
    categories.push(slide.businessContext.slideType)
  }
  if (slide.elements?.length > 5) categories.push('complex')
  if (slide.elements?.some((e: any) => e.chartConfig)) categories.push('data-driven')
  return categories
}

export const extractKeywords = (slide: any): string[] => {
  const keywords = []
  if (slide.title) keywords.push(...slide.title.toLowerCase().split(' '))
  if (slide.subtitle) keywords.push(...slide.subtitle.toLowerCase().split(' '))
  return keywords.filter(k => k.length > 2)
}