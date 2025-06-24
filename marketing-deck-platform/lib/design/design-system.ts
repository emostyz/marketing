// Comprehensive Design System for World-Class Presentation Editor
// Rivals Google Drive, Graphy, and Beautiful.ai

export interface DesignToken {
  id: string
  name: string
  value: string
  category: string
  description?: string
}

export interface ColorPalette {
  id: string
  name: string
  colors: string[]
  type: 'gradient' | 'monochrome' | 'complementary' | 'triadic' | 'analogous'
  description?: string
}

export interface FontFamily {
  id: string
  name: string
  family: string
  weights: number[]
  styles: string[]
  category: 'serif' | 'sans-serif' | 'monospace' | 'display' | 'handwriting'
  googleFont?: boolean
}

export interface ShapeTemplate {
  id: string
  name: string
  category: string
  svg: string
  defaultSize: { width: number; height: number }
  customizable: string[]
}

export interface ElementTemplate {
  id: string
  name: string
  category: string
  type: 'text' | 'shape' | 'icon' | 'chart' | 'image' | 'container'
  template: any
  thumbnail: string
  customizable: string[]
}

// Professional Color Palettes
export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    colors: ['#003366', '#0066CC', '#3399FF', '#66B2FF', '#99CCFF'],
    type: 'monochrome',
    description: 'Professional corporate blue palette'
  },
  {
    id: 'modern-gradient',
    name: 'Modern Gradient',
    colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'],
    type: 'gradient',
    description: 'Contemporary gradient colors'
  },
  {
    id: 'earth-tones',
    name: 'Earth Tones',
    colors: ['#8B4513', '#D2691E', '#DEB887', '#F4A460', '#FFEFD5'],
    type: 'analogous',
    description: 'Warm, natural earth tones'
  },
  {
    id: 'tech-minimal',
    name: 'Tech Minimal',
    colors: ['#1a1a1a', '#333333', '#666666', '#999999', '#cccccc'],
    type: 'monochrome',
    description: 'Clean, minimal tech palette'
  },
  {
    id: 'vibrant-energy',
    name: 'Vibrant Energy',
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
    type: 'complementary',
    description: 'High-energy vibrant colors'
  },
  {
    id: 'luxury-gold',
    name: 'Luxury Gold',
    colors: ['#2C1810', '#8B4513', '#DAA520', '#FFD700', '#FFF8DC'],
    type: 'analogous',
    description: 'Elegant luxury gold palette'
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    colors: ['#0C2340', '#1B4F72', '#2E8B57', '#20B2AA', '#87CEEB'],
    type: 'analogous',
    description: 'Calming ocean-inspired colors'
  },
  {
    id: 'sunset-glow',
    name: 'Sunset Glow',
    colors: ['#FF6B35', '#F7931E', '#FFD23F', '#06FFA5', '#4D96FF'],
    type: 'triadic',
    description: 'Warm sunset-inspired palette'
  }
]

// Professional Typography
export const FONT_FAMILIES: FontFamily[] = [
  {
    id: 'inter',
    name: 'Inter',
    family: 'Inter, sans-serif',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    styles: ['normal', 'italic'],
    category: 'sans-serif',
    googleFont: true
  },
  {
    id: 'roboto',
    name: 'Roboto',
    family: 'Roboto, sans-serif',
    weights: [100, 300, 400, 500, 700, 900],
    styles: ['normal', 'italic'],
    category: 'sans-serif',
    googleFont: true
  },
  {
    id: 'playfair',
    name: 'Playfair Display',
    family: 'Playfair Display, serif',
    weights: [400, 500, 600, 700, 800, 900],
    styles: ['normal', 'italic'],
    category: 'serif',
    googleFont: true
  },
  {
    id: 'montserrat',
    name: 'Montserrat',
    family: 'Montserrat, sans-serif',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    styles: ['normal', 'italic'],
    category: 'sans-serif',
    googleFont: true
  },
  {
    id: 'source-code',
    name: 'Source Code Pro',
    family: 'Source Code Pro, monospace',
    weights: [200, 300, 400, 500, 600, 700, 800, 900],
    styles: ['normal', 'italic'],
    category: 'monospace',
    googleFont: true
  },
  {
    id: 'dancing-script',
    name: 'Dancing Script',
    family: 'Dancing Script, cursive',
    weights: [400, 500, 600, 700],
    styles: ['normal'],
    category: 'handwriting',
    googleFont: true
  }
]

// Shape Templates
export const SHAPE_TEMPLATES: ShapeTemplate[] = [
  {
    id: 'rectangle',
    name: 'Rectangle',
    category: 'basic',
    svg: '<rect width="100" height="60" rx="4" fill="currentColor"/>',
    defaultSize: { width: 200, height: 120 },
    customizable: ['fill', 'stroke', 'strokeWidth', 'rx', 'ry']
  },
  {
    id: 'circle',
    name: 'Circle',
    category: 'basic',
    svg: '<circle cx="50" cy="50" r="45" fill="currentColor"/>',
    defaultSize: { width: 100, height: 100 },
    customizable: ['fill', 'stroke', 'strokeWidth']
  },
  {
    id: 'triangle',
    name: 'Triangle',
    category: 'basic',
    svg: '<polygon points="50,10 90,80 10,80" fill="currentColor"/>',
    defaultSize: { width: 100, height: 80 },
    customizable: ['fill', 'stroke', 'strokeWidth']
  },
  {
    id: 'diamond',
    name: 'Diamond',
    category: 'basic',
    svg: '<polygon points="50,10 90,50 50,90 10,50" fill="currentColor"/>',
    defaultSize: { width: 100, height: 100 },
    customizable: ['fill', 'stroke', 'strokeWidth']
  },
  {
    id: 'arrow-right',
    name: 'Arrow Right',
    category: 'arrows',
    svg: '<path d="M10,50 L70,50 M50,30 L70,50 L50,70" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    defaultSize: { width: 80, height: 60 },
    customizable: ['stroke', 'strokeWidth', 'fill']
  },
  {
    id: 'arrow-up',
    name: 'Arrow Up',
    category: 'arrows',
    svg: '<path d="M50,10 L50,70 M30,30 L50,10 L70,30" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    defaultSize: { width: 60, height: 80 },
    customizable: ['stroke', 'strokeWidth', 'fill']
  },
  {
    id: 'star',
    name: 'Star',
    category: 'decorative',
    svg: '<polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" fill="currentColor"/>',
    defaultSize: { width: 100, height: 100 },
    customizable: ['fill', 'stroke', 'strokeWidth']
  },
  {
    id: 'hexagon',
    name: 'Hexagon',
    category: 'polygons',
    svg: '<polygon points="30,5 70,5 90,43 70,80 30,80 10,43" fill="currentColor"/>',
    defaultSize: { width: 100, height: 85 },
    customizable: ['fill', 'stroke', 'strokeWidth']
  }
]

// Pre-made Element Templates
export const ELEMENT_TEMPLATES: ElementTemplate[] = [
  {
    id: 'title-slide',
    name: 'Title Slide',
    category: 'text',
    type: 'container',
    template: {
      type: 'container',
      elements: [
        {
          type: 'text',
          content: 'Your Title Here',
          style: { fontSize: 48, fontWeight: 'bold', textAlign: 'center' },
          position: { x: 0, y: 100 },
          size: { width: 800, height: 80 }
        },
        {
          type: 'text',
          content: 'Your Subtitle Here',
          style: { fontSize: 24, textAlign: 'center', opacity: 0.8 },
          position: { x: 0, y: 200 },
          size: { width: 800, height: 40 }
        }
      ]
    },
    thumbnail: '/templates/title-slide.png',
    customizable: ['fontSize', 'fontFamily', 'color', 'textAlign']
  },
  {
    id: 'bullet-points',
    name: 'Bullet Points',
    category: 'text',
    type: 'text',
    template: {
      type: 'text',
      content: '• Point one\n• Point two\n• Point three',
      style: { fontSize: 20, lineHeight: 1.6 },
      position: { x: 100, y: 150 },
      size: { width: 600, height: 200 }
    },
    thumbnail: '/templates/bullet-points.png',
    customizable: ['fontSize', 'fontFamily', 'color', 'lineHeight']
  },
  {
    id: 'quote-block',
    name: 'Quote Block',
    category: 'text',
    type: 'container',
    template: {
      type: 'container',
      elements: [
        {
          type: 'shape',
          shape: 'rectangle',
          style: { fill: 'rgba(59, 130, 246, 0.1)', stroke: '#3b82f6', strokeWidth: 2 },
          position: { x: 0, y: 0 },
          size: { width: 600, height: 150 }
        },
        {
          type: 'text',
          content: '"Your inspiring quote here"',
          style: { fontSize: 24, fontStyle: 'italic', textAlign: 'center' },
          position: { x: 50, y: 40 },
          size: { width: 500, height: 70 }
        }
      ]
    },
    thumbnail: '/templates/quote-block.png',
    customizable: ['fontSize', 'fontFamily', 'color', 'backgroundColor']
  },
  {
    id: 'stats-grid',
    name: 'Stats Grid',
    category: 'data',
    type: 'container',
    template: {
      type: 'container',
      elements: [
        {
          type: 'text',
          content: '75%',
          style: { fontSize: 48, fontWeight: 'bold', textAlign: 'center', color: '#3b82f6' },
          position: { x: 0, y: 0 },
          size: { width: 150, height: 60 }
        },
        {
          type: 'text',
          content: 'Growth Rate',
          style: { fontSize: 16, textAlign: 'center' },
          position: { x: 0, y: 70 },
          size: { width: 150, height: 30 }
        }
      ]
    },
    thumbnail: '/templates/stats-grid.png',
    customizable: ['fontSize', 'fontFamily', 'color', 'backgroundColor']
  }
]

// Chart Templates
export const CHART_TEMPLATES = [
  {
    id: 'line-chart-basic',
    name: 'Basic Line Chart',
    category: 'trends',
    type: 'line',
    template: {
      type: 'line',
      data: [
        { name: 'Jan', value: 100 },
        { name: 'Feb', value: 120 },
        { name: 'Mar', value: 140 },
        { name: 'Apr', value: 180 },
        { name: 'May', value: 160 },
        { name: 'Jun', value: 200 }
      ],
      config: {
        xAxisKey: 'name',
        yAxisKey: 'value',
        showAnimation: true,
        showLegend: true,
        colors: ['#3b82f6']
      }
    },
    thumbnail: '/charts/line-basic.png',
    customizable: ['colors', 'showLegend', 'showAnimation', 'strokeWidth']
  },
  {
    id: 'bar-chart-comparison',
    name: 'Comparison Bar Chart',
    category: 'comparison',
    type: 'bar',
    template: {
      type: 'bar',
      data: [
        { name: 'Q1', current: 120, previous: 100 },
        { name: 'Q2', current: 150, previous: 110 },
        { name: 'Q3', current: 180, previous: 130 },
        { name: 'Q4', current: 200, previous: 140 }
      ],
      config: {
        xAxisKey: 'name',
        yAxisKey: ['current', 'previous'],
        showAnimation: true,
        showLegend: true,
        colors: ['#3b82f6', '#ef4444']
      }
    },
    thumbnail: '/charts/bar-comparison.png',
    customizable: ['colors', 'showLegend', 'showAnimation', 'barSize']
  },
  {
    id: 'pie-chart-segments',
    name: 'Segment Pie Chart',
    category: 'distribution',
    type: 'pie',
    template: {
      type: 'pie',
      data: [
        { name: 'Mobile', value: 45 },
        { name: 'Desktop', value: 35 },
        { name: 'Tablet', value: 20 }
      ],
      config: {
        showAnimation: true,
        showLegend: true,
        colors: ['#3b82f6', '#ef4444', '#10b981']
      }
    },
    thumbnail: '/charts/pie-segments.png',
    customizable: ['colors', 'showLegend', 'showAnimation', 'innerRadius']
  }
]

// Design System Utilities
export class DesignSystem {
  static getColorPalette(id: string): ColorPalette | undefined {
    return COLOR_PALETTES.find(palette => palette.id === id)
  }

  static getFontFamily(id: string): FontFamily | undefined {
    return FONT_FAMILIES.find(font => font.id === id)
  }

  static getShapeTemplate(id: string): ShapeTemplate | undefined {
    return SHAPE_TEMPLATES.find(shape => shape.id === id)
  }

  static getElementTemplate(id: string): ElementTemplate | undefined {
    return ELEMENT_TEMPLATES.find(element => element.id === id)
  }

  static generateColorVariations(baseColor: string, count: number = 5): string[] {
    // Simple color variation generator (in a real app, use a proper color library)
    const variations = []
    for (let i = 0; i < count; i++) {
      variations.push(baseColor)
    }
    return variations
  }

  static validateDesignToken(token: DesignToken): boolean {
    return !!(token.id && token.name && token.value && token.category)
  }
}

export default DesignSystem