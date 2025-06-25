type ColorScheme = { primary: string; secondary: string; accent: string; success: string; danger: string; neutral: string[] };
type ColorSchemes = { [key: string]: ColorScheme };

export const VISUAL_EXCELLENCE_RULES = {
  colorSchemes: {
    executive: {
      primary: '#1a365d',    // Deep blue - trust, stability
      secondary: '#153e75',  // Slightly lighter blue
      accent: '#2a69ac',     // Accent blue
      success: '#38a169',    // Green
      danger: '#e53e3e',     // Red
      neutral: ['#f7fafc', '#e2e8f0', '#cbd5e0', '#a0aec0', '#718096']
    },
    modern: {
      primary: '#2d3748',
      secondary: '#4a5568',
      accent: '#805ad5',
      success: '#48bb78',
      danger: '#f56565',
      neutral: ['#edf2f7', '#e2e8f0', '#cbd5e0', '#a0aec0', '#718096']
    },
    sales: {
      primary: '#d53f8c',
      secondary: '#b83280',
      accent: '#f6ad55',
      success: '#38a169',
      danger: '#e53e3e',
      neutral: ['#fff5f7', '#fed7e2', '#fbb6ce', '#f687b3', '#e53e3e']
    },
    futuristic: {
      primary: '#00b5d8',
      secondary: '#805ad5',
      accent: '#f6ad55',
      success: '#38a169',
      danger: '#e53e3e',
      neutral: ['#e6fffa', '#b2f5ea', '#81e6d9', '#4fd1c5', '#38b2ac']
    },
    premium: {
      primary: '#ecc94b',
      secondary: '#b7791f',
      accent: '#f6ad55',
      success: '#38a169',
      danger: '#e53e3e',
      neutral: ['#fdf6b2', '#f6e05e', '#ecc94b', '#b7791f', '#744210']
    },
    vibrant: {
      primary: '#f56565',
      secondary: '#ed8936',
      accent: '#f6e05e',
      success: '#48bb78',
      danger: '#4299e1',
      neutral: ['#fff5f7', '#fed7e2', '#fbb6ce', '#f687b3', '#e53e3e']
    }
  } as ColorSchemes,
  
  layoutPrinciples: {
    whiteSpace: {
      minimum: 0.3,  // 30% minimum white space
      optimal: 0.4,  // 40% optimal
      margins: { top: 80, right: 80, bottom: 80, left: 80 }
    },
    
    hierarchy: {
      title: {
        size: { min: 36, max: 48 },
        weight: 700,
        lineHeight: 1.2
      },
      subtitle: {
        size: { min: 20, max: 28 },
        weight: 500,
        lineHeight: 1.4
      },
      body: {
        size: { min: 16, max: 20 },
        weight: 400,
        lineHeight: 1.6
      },
      caption: {
        size: { min: 12, max: 14 },
        weight: 400,
        lineHeight: 1.4
      }
    },
    
    gridSystem: {
      columns: 12,
      gutter: 24,
      maxContentWidth: 1200
    }
  },
  
  chartRules: {
    maxDataPoints: {
      line: 12,      // Monthly for a year
      bar: 8,        // Comfortable comparison
      pie: 6,        // Maximum segments
      scatter: 100,  // Before it gets cluttered
      treemap: 20,   // Hierarchical segments
      sunburst: 15,  // Radial segments
      bubble: 50,    // Multi-dimensional points
      heatmap: 100   // Matrix cells
    },
    
    colorStrategy: {
      categorical: 'useDistinctColors',
      sequential: 'useSingleHueGradient',
      diverging: 'useOpposingColors',
      highlight: 'dimOthersExceptTarget',
      gradient: 'useAdvancedGradients',
      premium: 'usePremiumPalettes'
    },
    
    annotations: {
      showTrendline: 'whenSignificant',
      showAverage: 'whenHelpful',
      showTargets: 'always',
      dataLabels: 'smartPlacement',
      callouts: 'highlightKey',
      milestones: 'showMajorEvents'
    },
    
    // NEW: Advanced visual elements
    modernStyling: {
      shadows: {
        subtle: '0 2px 4px rgba(0,0,0,0.1)',
        medium: '0 4px 12px rgba(0,0,0,0.15)',
        dramatic: '0 8px 32px rgba(0,0,0,0.25)'
      },
      gradients: {
        enabled: true,
        intensity: 0.8,
        direction: 135 // degrees
      },
      borderRadius: {
        subtle: 4,
        medium: 8,
        rounded: 16
      },
      animations: {
        entrance: 'fadeInUp',
        interaction: 'pulse',
        transition: 'smoothBezier'
      },
      typography: {
        fontStack: ['Inter', 'system-ui', 'sans-serif'],
        weights: {
          light: 300,
          regular: 400,
          medium: 500,
          semibold: 600,
          bold: 700
        }
      }
    }
  },
  
  slideLayouts: {
    titleSlide: {
      elements: ['title', 'subtitle', 'date', 'logo'],
      alignment: 'center',
      emphasis: 'title',
      variants: {
        classic: { background: 'solid', decoration: 'minimal' },
        modern: { background: 'gradient', decoration: 'geometric' },
        premium: { background: 'textured', decoration: 'elegant' }
      }
    },
    
    sectionDivider: {
      elements: ['sectionTitle', 'sectionNumber'],
      alignment: 'left',
      background: 'primary',
      variants: {
        bold: { style: 'fullBleed', typography: 'heavy' },
        elegant: { style: 'framed', typography: 'light' },
        dynamic: { style: 'angled', typography: 'modern' }
      }
    },
    
    contentSlide: {
      maxElements: 3,
      layouts: [
        'singleChart',
        'chartWithBullets',
        'twoChartsComparison',
        'metricsGrid',
        // NEW: Advanced layouts
        'heroChart',        // Dominant visualization
        'storyBoard',       // Sequential narrative
        'dashboard',        // Multiple KPIs
        'comparison',       // Side-by-side analysis
        'timeline',         // Chronological flow
        'hierarchy'         // Layered information
      ],
      gridSystems: {
        golden: { ratio: 1.618, emphasis: 'visual' },
        thirds: { sections: 3, emphasis: 'balanced' },
        asymmetric: { ratio: 2.414, emphasis: 'dynamic' }
      }
    },
    
    closingSlide: {
      elements: ['callToAction', 'nextSteps', 'contact'],
      alignment: 'center',
      emphasis: 'action',
      variants: {
        urgent: { style: 'bold', color: 'accent' },
        confident: { style: 'professional', color: 'primary' },
        inspiring: { style: 'uplifting', color: 'gradient' }
      }
    },
    
    // NEW: Innovative slide types
    innovativeLayouts: {
      immersiveChart: {
        description: 'Full-screen visualization with minimal text overlay',
        usage: 'Maximum visual impact for key insights',
        elements: ['backgroundChart', 'overlayTitle', 'keyMetric']
      },
      splitNarrative: {
        description: 'Split screen with visualization and narrative',
        usage: 'Storytelling with supporting visuals',
        elements: ['leftVisualization', 'rightNarrative', 'connectingElement']
      },
      progressiveReveal: {
        description: 'Layered information with guided discovery',
        usage: 'Complex insights with step-by-step revelation',
        elements: ['baseLayer', 'revealLayers', 'progressIndicator']
      },
      interactiveExploration: {
        description: 'User-driven data exploration interface',
        usage: 'Engaging stakeholder interaction',
        elements: ['controlPanel', 'dynamicVisualization', 'guidanceSystem']
      }
    }
  }
}

export interface SlideDesign {
  colors: {
    background: string
    text: string
    headings?: string
    accent?: string
    data?: {
      positive: string
      negative: string
      neutral: string
    }
  }
  layout: {
    margins: { top: number, right: number, bottom: number, left: number }
    grid: { columns: number, gutter: number }
    maxWidth: number
  }
  typography: {
    title: { size: number, weight: number, lineHeight: number }
    subtitle: { size: number, weight: number, lineHeight: number }
    body: { size: number, weight: number, lineHeight: number }
    caption: { size: number, weight: number, lineHeight: number }
  }
  charts?: any[]
}

export function applyVisualExcellence(slides: any[], deckType: string, innovationLevel: 'standard' | 'advanced' | 'revolutionary' = 'advanced'): any[] {
  const colorScheme = VISUAL_EXCELLENCE_RULES.colorSchemes[deckType] || 
                     VISUAL_EXCELLENCE_RULES.colorSchemes.futuristic // Default to stunning futuristic theme
  
  return slides.map((slide, index) => ({
    ...slide,
    design: {
      colors: assignSlideColors(slide, colorScheme, index),
      layout: optimizeLayout(slide, VISUAL_EXCELLENCE_RULES.layoutPrinciples, innovationLevel),
      typography: applyTypography(slide, VISUAL_EXCELLENCE_RULES.layoutPrinciples.hierarchy),
      charts: slide.charts?.map((chart: any) => enhanceChart(chart, VISUAL_EXCELLENCE_RULES.chartRules, innovationLevel)),
      // NEW: Advanced styling
      modernStyling: applyModernStyling(slide, VISUAL_EXCELLENCE_RULES.chartRules.modernStyling, innovationLevel),
      animations: generateAnimationSequence(slide, index),
      interactivity: defineInteractivity(slide, innovationLevel)
    }
  }))
}

/**
 * Apply modern styling elements for stunning visuals
 */
function applyModernStyling(slide: any, modernRules: any, innovationLevel: string) {
  const baseStyle = {
    shadows: modernRules.shadows.medium,
    borderRadius: modernRules.borderRadius.medium,
    gradients: modernRules.gradients.enabled
  }
  
  if (innovationLevel === 'revolutionary') {
    return {
      ...baseStyle,
      shadows: modernRules.shadows.dramatic,
      borderRadius: modernRules.borderRadius.rounded,
      gradients: {
        ...modernRules.gradients,
        intensity: 1.0,
        effects: ['glassmorphism', 'neural-network', 'particle-system']
      },
      animations: {
        entrance: 'cinematicReveal',
        interaction: 'dynamicResponse',
        transition: 'fluidMotion'
      },
      effects: {
        parallax: true,
        particles: true,
        morphing: true
      }
    }
  }
  
  if (innovationLevel === 'advanced') {
    return {
      ...baseStyle,
      shadows: modernRules.shadows.medium,
      gradients: {
        ...modernRules.gradients,
        intensity: 0.9,
        effects: ['subtle-glow', 'depth-layering']
      },
      animations: {
        entrance: 'elegantEntry',
        interaction: 'smoothResponse',
        transition: 'organicFlow'
      }
    }
  }
  
  return baseStyle
}

/**
 * Generate animation sequences for engaging presentations
 */
function generateAnimationSequence(slide: any, slideIndex: number) {
  const baseDelay = slideIndex * 200 // Stagger slide animations
  
  return {
    slideEntry: {
      type: 'fadeInUp',
      delay: baseDelay,
      duration: 800,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    },
    chartAnimations: slide.charts?.map((chart: any, chartIndex: number) => ({
      type: getChartAnimationType(chart.type),
      delay: baseDelay + (chartIndex * 300),
      duration: 1200,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    })),
    textAnimations: {
      title: { type: 'fadeInDown', delay: baseDelay + 100 },
      subtitle: { type: 'fadeInUp', delay: baseDelay + 200 },
      content: { type: 'fadeInLeft', delay: baseDelay + 400 }
    }
  }
}

/**
 * Get optimal animation type for chart type
 */
function getChartAnimationType(chartType: string): string {
  const animations: { [key: string]: string } = {
    line: 'drawPath',
    bar: 'growHeight',
    pie: 'rotateSegments',
    scatter: 'bubbleIn',
    area: 'fillArea',
    treemap: 'morphRectangles',
    sunburst: 'radialExpand',
    gauge: 'sweepNeedle',
    timeline: 'progressiveReveal'
  }
  
  return animations[chartType] || 'fadeIn'
}

/**
 * Define interactivity based on innovation level
 */
function defineInteractivity(slide: any, innovationLevel: string) {
  const baseInteractivity = {
    hover: ['highlight', 'tooltip'],
    click: ['detail', 'focus']
  }
  
  if (innovationLevel === 'revolutionary') {
    return {
      ...baseInteractivity,
      gestures: ['swipe', 'pinch', 'rotate'],
      voice: ['navigate', 'filter', 'explain'],
      ai: ['auto-insights', 'smart-recommendations'],
      collaboration: ['real-time-annotations', 'shared-exploration']
    }
  }
  
  if (innovationLevel === 'advanced') {
    return {
      ...baseInteractivity,
      advanced: ['zoom', 'filter', 'drill-down'],
      storytelling: ['guided-tour', 'narrative-flow']
    }
  }
  
  return baseInteractivity
}

function assignSlideColors(slide: any, colorScheme: any, index: number) {
  // Smart color assignment based on slide type and position
  if (index === 0) {
    // Title slide - use primary brand colors
    return {
      background: '#ffffff',
      text: colorScheme.primary,
      accent: colorScheme.accent
    }
  }
  
  if (slide.type === 'sectionDivider') {
    // Section dividers - inverse colors
    return {
      background: colorScheme.primary,
      text: '#ffffff',
      accent: colorScheme.accent
    }
  }
  
  // Content slides - subtle backgrounds
  return {
    background: '#ffffff',
    text: colorScheme.neutral[0],
    headings: colorScheme.primary,
    data: {
      positive: colorScheme.success,
      negative: colorScheme.danger,
      neutral: colorScheme.neutral[2]
    }
  }
}

function optimizeLayout(slide: any, layoutPrinciples: any, innovationLevel: string) {
  const { whiteSpace, gridSystem } = layoutPrinciples
  
  return {
    margins: whiteSpace.margins,
    grid: {
      columns: gridSystem.columns,
      gutter: gridSystem.gutter
    },
    maxWidth: gridSystem.maxContentWidth,
    whiteSpaceRatio: whiteSpace.optimal
  }
}

function applyTypography(slide: any, hierarchy: any) {
  // Select appropriate font sizes based on slide type and content density
  const density = calculateContentDensity(slide)
  
  return {
    title: {
      size: density === 'high' ? hierarchy.title.size.min : hierarchy.title.size.max,
      weight: hierarchy.title.weight,
      lineHeight: hierarchy.title.lineHeight
    },
    subtitle: {
      size: density === 'high' ? hierarchy.subtitle.size.min : hierarchy.subtitle.size.max,
      weight: hierarchy.subtitle.weight,
      lineHeight: hierarchy.subtitle.lineHeight
    },
    body: {
      size: density === 'high' ? hierarchy.body.size.min : hierarchy.body.size.max,
      weight: hierarchy.body.weight,
      lineHeight: hierarchy.body.lineHeight
    },
    caption: {
      size: hierarchy.caption.size.max,
      weight: hierarchy.caption.weight,
      lineHeight: hierarchy.caption.lineHeight
    }
  }
}

function calculateContentDensity(slide: any): 'low' | 'medium' | 'high' {
  let elementCount = 0
  
  if (slide.title) elementCount++
  if (slide.subtitle) elementCount++
  if (slide.content) elementCount += Array.isArray(slide.content) ? slide.content.length : 1
  if (slide.charts) elementCount += slide.charts.length
  if (slide.elements) elementCount += slide.elements.length
  
  if (elementCount <= 3) return 'low'
  if (elementCount <= 6) return 'medium'
  return 'high'
}

function enhanceChart(chart: any, chartRules: any, innovationLevel: string = 'advanced') {
  const { maxDataPoints, colorStrategy, annotations, modernStyling } = chartRules
  
  const enhanced = { ...chart }
  
  // Apply data point limits
  if (chart.type && maxDataPoints[chart.type]) {
    const maxPoints = maxDataPoints[chart.type]
    if (chart.data && chart.data.length > maxPoints) {
      enhanced.data = simplifyDataset(chart.data, maxPoints)
      enhanced.note = `Data simplified from ${chart.data.length} to ${maxPoints} points for clarity`
    }
  }
  
  // Apply advanced color strategy
  enhanced.colors = applyAdvancedColorStrategy(chart, colorStrategy, innovationLevel)
  
  // Add smart annotations
  enhanced.annotations = generateSmartAnnotations(chart, annotations)
  
  // Enhanced styling with modern elements
  enhanced.styling = {
    fontSize: calculateOptimalFontSize(chart),
    gridLines: shouldShowGridLines(chart),
    dataLabels: shouldShowDataLabels(chart),
    legend: optimizeLegendPlacement(chart),
    // NEW: Modern styling enhancements
    shadows: modernStyling.shadows.medium,
    borderRadius: modernStyling.borderRadius.medium,
    gradients: modernStyling.gradients,
    typography: modernStyling.typography
  }
  
  // Add innovation-specific enhancements
  if (innovationLevel === 'revolutionary') {
    enhanced.revolutionaryFeatures = {
      threedEffects: true,
      particleSystem: true,
      morphingTransitions: true,
      aiInsights: true,
      voiceInteraction: true
    }
  } else if (innovationLevel === 'advanced') {
    enhanced.advancedFeatures = {
      smoothAnimations: true,
      interactiveElements: true,
      smartTooltips: true,
      contextualInsights: true
    }
  }
  
  return enhanced
}

/**
 * Apply advanced color strategy with gradients and modern palettes
 */
function applyAdvancedColorStrategy(chart: any, colorStrategy: any, innovationLevel: string) {
  const baseColors = applyChartColorStrategy(chart, colorStrategy)
  
  if (innovationLevel === 'revolutionary') {
    return {
      primary: baseColors,
      gradients: generateDynamicGradients(baseColors),
      interactive: generateInteractiveColors(baseColors),
      contextual: generateContextualColors(chart.type),
      ai: generateAIRecommendedColors(chart.data)
    }
  }
  
  if (innovationLevel === 'advanced') {
    return {
      primary: baseColors,
      gradients: generateSubtleGradients(baseColors),
      hover: generateHoverStates(baseColors)
    }
  }
  
  return { primary: baseColors }
}

/**
 * Generate dynamic gradients for revolutionary charts
 */
function generateDynamicGradients(colors: string[]): string[] {
  return colors.map((color, index) => {
    const nextColor = colors[(index + 1) % colors.length]
    return `linear-gradient(135deg, ${color} 0%, ${nextColor} 100%)`
  })
}

/**
 * Generate interactive color states
 */
function generateInteractiveColors(baseColors: string[]) {
  return {
    default: baseColors,
    hover: baseColors.map(color => adjustColorBrightness(color, 20)),
    active: baseColors.map(color => adjustColorBrightness(color, -10)),
    selected: baseColors.map(color => adjustColorSaturation(color, 30))
  }
}

/**
 * Generate contextual colors based on chart type
 */
function generateContextualColors(chartType: string) {
  const contextualPalettes: { [key: string]: any } = {
    line: ['#667eea', '#764ba2'],
    bar: ['#f093fb', '#f5576c'],
    pie: ['#4facfe', '#00f2fe'],
    scatter: ['#43e97b', '#38f9d7'],
    treemap: ['#fa709a', '#fee140'],
    sunburst: ['#a8edea', '#fed6e3'],
    gauge: ['#ff9a9e', '#fecfef']
  }
  
  return contextualPalettes[chartType] || contextualPalettes.line
}

/**
 * Generate AI-recommended colors based on data patterns
 */
function generateAIRecommendedColors(data: any) {
  // Placeholder for AI color recommendation logic
  // In a real implementation, this would analyze data patterns
  // and suggest optimal color schemes
  return {
    trending: '#4facfe',
    declining: '#f5576c',
    stable: '#43e97b',
    volatile: '#f093fb',
    opportunity: '#667eea'
  }
}

/**
 * Adjust color brightness
 */
function adjustColorBrightness(color: string, percent: number): string {
  // Simplified color adjustment - in real implementation would use proper color manipulation
  return color // Placeholder
}

/**
 * Adjust color saturation
 */
function adjustColorSaturation(color: string, percent: number): string {
  // Simplified color adjustment - in real implementation would use proper color manipulation
  return color // Placeholder
}

function simplifyDataset(data: any[], maxPoints: number): any[] {
  if (data.length <= maxPoints) return data
  
  // Intelligent sampling - keep first, last, and evenly distribute middle points
  const result = [data[0]] // Always keep first
  
  const step = Math.floor((data.length - 2) / (maxPoints - 2))
  for (let i = step; i < data.length - 1; i += step) {
    result.push(data[i])
    if (result.length >= maxPoints - 1) break
  }
  
  result.push(data[data.length - 1]) // Always keep last
  
  return result
}

function applyChartColorStrategy(chart: any, colorStrategy: any) {
  // Smart color application based on chart type and data characteristics
  if (chart.type === 'pie' || chart.type === 'donut') {
    return generateCategoricalColors(chart.data?.length || 6)
  }
  
  if (chart.type === 'line' && chart.series?.length === 1) {
    return ['#2b6cb0'] // Single series - use primary blue
  }
  
  if (chart.type === 'bar' && isSequentialData(chart.data)) {
    return generateSequentialColors(chart.data?.length || 5)
  }
  
  // Default to categorical colors
  return generateCategoricalColors(chart.data?.length || 5)
}

function generateCategoricalColors(count: number): string[] {
  const baseColors = ['#2b6cb0', '#38a169', '#ed8936', '#e53e3e', '#667eea', '#d69e2e']
  const colors = []
  
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length])
  }
  
  return colors
}

function generateSequentialColors(count: number): string[] {
  // Generate gradient from light to dark blue
  const colors = []
  const baseHue = 210 // Blue
  
  for (let i = 0; i < count; i++) {
    const lightness = 80 - (i * 50 / count) // From light to dark
    colors.push(`hsl(${baseHue}, 70%, ${lightness}%)`)
  }
  
  return colors
}

function isSequentialData(data: any[]): boolean {
  if (!data || data.length < 2) return false
  
  // Check if data represents a sequence (like time series or rankings)
  const values = data.map((d: any) => d.value || d.y || d[1])
  const hasOrder = values.every((val, i) => i === 0 || val >= values[i - 1])
  
  return hasOrder
}

function generateSmartAnnotations(chart: any, annotationRules: any) {
  const annotations = []
  
  // Add trend line for time series with clear trend
  if (chart.type === 'line' && annotationRules.showTrendline === 'whenSignificant') {
    if (hasSigificantTrend(chart.data)) {
      annotations.push({
        type: 'trendline',
        style: { color: '#718096', strokeDasharray: '5,5' }
      })
    }
  }
  
  // Add average line when helpful
  if (annotationRules.showAverage === 'whenHelpful' && shouldShowAverage(chart)) {
    annotations.push({
      type: 'averageLine',
      value: calculateAverage(chart.data),
      label: 'Average',
      style: { color: '#a0aec0' }
    })
  }
  
  // Add target lines
  if (annotationRules.showTargets === 'always' && chart.target) {
    annotations.push({
      type: 'targetLine',
      value: chart.target,
      label: 'Target',
      style: { color: '#38a169', strokeWidth: 2 }
    })
  }
  
  return annotations
}

function hasSigificantTrend(data: any[]): boolean {
  if (!data || data.length < 3) return false
  
  // Simple trend detection - check if consistently increasing or decreasing
  const values = data.map((d: any) => d.value || d.y || d[1])
  let increasingCount = 0
  let decreasingCount = 0
  
  for (let i = 1; i < values.length; i++) {
    if (values[i] > values[i - 1]) increasingCount++
    if (values[i] < values[i - 1]) decreasingCount++
  }
  
  const totalComparisons = values.length - 1
  const trendStrength = Math.max(increasingCount, decreasingCount) / totalComparisons
  
  return trendStrength > 0.7 // 70% of points follow the trend
}

function shouldShowAverage(chart: any): boolean {
  // Show average when data has significant variance
  if (!chart.data || chart.data.length < 3) return false
  
  const values = chart.data.map((d: any) => d.value || d.y || d[1])
  const avg = values.reduce((sum: any, val: any) => sum + val, 0) / values.length
  const variance = values.reduce((sum: any, val: any) => sum + Math.pow(val - avg, 2), 0) / values.length
  const stdDev = Math.sqrt(variance)
  
  // Show average if standard deviation is significant relative to mean
  return stdDev / avg > 0.2
}

function calculateAverage(data: any[]): number {
  if (!data || data.length === 0) return 0
  
  const values = data.map((d: any) => d.value || d.y || d[1])
  return values.reduce((sum: any, val: any) => sum + val, 0) / values.length
}

function calculateOptimalFontSize(chart: any): number {
  // Base font size on chart complexity and size
  const dataPointCount = chart.data?.length || 0
  const hasMultipleSeries = chart.series && chart.series.length > 1
  
  let baseSize = 14
  
  if (dataPointCount > 10) baseSize -= 1
  if (hasMultipleSeries) baseSize -= 1
  if (chart.size === 'small') baseSize -= 2
  
  return Math.max(baseSize, 10) // Minimum readable size
}

function shouldShowGridLines(chart: any): boolean {
  // Show grid lines for complex charts, hide for simple ones
  const dataPointCount = chart.data?.length || 0
  const hasMultipleSeries = chart.series && chart.series.length > 1
  
  return dataPointCount > 5 || hasMultipleSeries
}

function shouldShowDataLabels(chart: any): boolean {
  // Show data labels for simple charts with few data points
  const dataPointCount = chart.data?.length || 0
  
  return dataPointCount <= 6 && chart.type !== 'line'
}

function optimizeLegendPlacement(chart: any): { position: string, orientation: string } {
  const seriesCount = chart.series?.length || chart.data?.length || 1
  
  if (seriesCount <= 3) {
    return { position: 'top', orientation: 'horizontal' }
  } else if (seriesCount <= 6) {
    return { position: 'right', orientation: 'vertical' }
  } else {
    return { position: 'bottom', orientation: 'horizontal' }
  }
}

// Stub functions for missing gradient/hover generators
function generateSubtleGradients(colors: string[]): string[] { return colors; }
function generateHoverStates(colors: string[]): string[] { return colors; }

export { assignSlideColors, optimizeLayout, applyTypography, enhanceChart }