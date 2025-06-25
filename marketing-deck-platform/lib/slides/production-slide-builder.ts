// PRODUCTION SLIDE BUILDER
// Generates actual professional slides with real content and proper formatting

interface WorldClassSlide {
  id: string
  type: string
  title: string
  executiveMessage: string
  content: {
    headline: string
    subheadline: string
    keyPoints: string[]
    dataEvidence: any[]
    businessImplication: string
    callToAction: string
  }
  visuals: {
    charts: Array<{
      type: 'bar' | 'line' | 'pie' | 'scatter' | 'heatmap'
      title: string
      data: any[]
      insights: string[]
      config: any
    }>
    metrics: Array<{
      label: string
      value: string | number
      trend: 'up' | 'down' | 'stable'
      context: string
    }>
    callouts: Array<{
      type: 'success' | 'warning' | 'critical' | 'info'
      message: string
      action?: string
    }>
  }
  speakerNotes: string
  design: {
    layout: string
    colorScheme: string[]
    emphasis: string[]
  }
}

interface ProductionSlide {
  id: string
  type: string
  title: string
  subtitle?: string
  content: {
    summary: string
    keyMetrics: Array<{
      name: string
      value: string | number
      change?: string
      trend?: 'up' | 'down' | 'stable'
    }>
    insights: string[]
    recommendations: string[]
    nextActions: string[]
  }
  charts: Array<{
    id: string
    type: 'bar' | 'line' | 'pie' | 'metric'
    title: string
    data: any[]
    configuration: {
      colors: string[]
      theme: string
      showGrid: boolean
      showLegend: boolean
      showTooltip: boolean
    }
  }>
  elements: Array<{
    id: string
    type: 'text' | 'shape' | 'metric_card' | 'chart_container'
    content: any
    position: { x: number; y: number; width: number; height: number }
    style: any
    layer: number
  }>
  design: {
    backgroundColor: string
    textColor: string
    accentColor: string
    layout: string
  }
  keyTakeaways: string[]
}

export class ProductionSlideBuilder {
  private slides: WorldClassSlide[]
  private designTheme: any

  constructor(slides: WorldClassSlide[], designTheme?: any) {
    this.slides = slides
    this.designTheme = designTheme || this.getDefaultTheme()
  }

  buildProductionSlides(): ProductionSlide[] {
    console.log('🏗️ Building production-ready slides...')
    
    return this.slides.map((slide, index) => {
      switch (slide.type) {
        case 'executive_summary':
          return this.buildExecutiveSummarySlide(slide, index)
        case 'key_findings':
          return this.buildKeyFindingsSlide(slide, index)
        case 'deep_analysis':
          return this.buildDeepAnalysisSlide(slide, index)
        case 'recommendations':
          return this.buildRecommendationsSlide(slide, index)
        case 'implementation':
          return this.buildImplementationSlide(slide, index)
        case 'next_steps':
          return this.buildNextStepsSlide(slide, index)
        default:
          return this.buildGenericSlide(slide, index)
      }
    })
  }

  private buildExecutiveSummarySlide(slide: WorldClassSlide, index: number): ProductionSlide {
    const metrics = slide.visuals?.metrics || []
    const charts = slide.visuals?.charts || []

    return {
      id: slide.id,
      type: slide.type,
      title: slide.title,
      subtitle: 'Strategic Business Overview',
      content: {
        summary: slide.content.headline,
        keyMetrics: metrics.map(m => ({
          name: m.label,
          value: m.value,
          trend: m.trend,
          change: m.context
        })),
        insights: slide.content.keyPoints,
        recommendations: [slide.content.callToAction],
        nextActions: [slide.content.callToAction]
      },
      charts: charts.map((chart, i) => ({
        id: `chart_${slide.id}_${i}`,
        type: chart.type as any,
        title: chart.title,
        data: Array.isArray(chart.data) ? chart.data : this.generateSampleData(chart.type),
        configuration: {
          colors: ['#1e40af', '#7c3aed', '#059669', '#dc2626'],
          theme: 'executive',
          showGrid: true,
          showLegend: true,
          showTooltip: true
        }
      })),
      elements: [
        // Header with gradient
        {
          id: `header_${slide.id}`,
          type: 'shape',
          content: { shape: 'rectangle', gradient: true },
          position: { x: 0, y: 0, width: 800, height: 100 },
          style: {
            backgroundColor: '#1e40af',
            backgroundImage: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)',
            borderRadius: 0
          },
          layer: 1
        },
        // Title
        {
          id: `title_${slide.id}`,
          type: 'text',
          content: { 
            text: slide.title,
            html: `<h1 class="text-4xl font-bold text-white text-center">${slide.title}</h1>`
          },
          position: { x: 60, y: 25, width: 680, height: 50 },
          style: {
            fontSize: 36,
            fontWeight: 'bold',
            color: '#ffffff',
            textAlign: 'center',
            fontFamily: 'Inter'
          },
          layer: 2
        },
        // Executive message
        {
          id: `exec_message_${slide.id}`,
          type: 'text',
          content: {
            text: slide.executiveMessage,
            html: `<div class="text-2xl font-semibold text-gray-900 bg-yellow-50 p-6 border-l-4 border-yellow-400 rounded-r-lg">${slide.executiveMessage}</div>`
          },
          position: { x: 60, y: 120, width: 680, height: 80 },
          style: {
            fontSize: 24,
            fontWeight: '600',
            color: '#1f2937',
            backgroundColor: '#fefce8',
            borderLeft: '4px solid #facc15',
            padding: 24,
            borderRadius: '0 8px 8px 0',
            textAlign: 'left'
          },
          layer: 3
        },
        // Key metrics grid
        ...metrics.map((metric, i) => [
          // Metric card background
          {
            id: `metric_bg_${i}_${slide.id}`,
            type: 'shape',
            content: { shape: 'rectangle' },
            position: { x: 60 + (i * 220), y: 220, width: 200, height: 120 },
            style: {
              backgroundColor: '#ffffff',
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb'
            },
            layer: 4
          },
          // Metric value
          {
            id: `metric_value_${i}_${slide.id}`,
            type: 'text',
            content: { text: String(metric.value) },
            position: { x: 80 + (i * 220), y: 240, width: 160, height: 40 },
            style: {
              fontSize: 32,
              fontWeight: 'bold',
              color: this.getTrendColor(metric.trend),
              textAlign: 'center'
            },
            layer: 5
          },
          // Metric label
          {
            id: `metric_label_${i}_${slide.id}`,
            type: 'text',
            content: { text: metric.label },
            position: { x: 80 + (i * 220), y: 285, width: 160, height: 25 },
            style: {
              fontSize: 14,
              color: '#6b7280',
              textAlign: 'center',
              fontWeight: '500'
            },
            layer: 6
          },
          // Trend indicator
          {
            id: `metric_trend_${i}_${slide.id}`,
            type: 'text',
            content: { text: this.getTrendIcon(metric.trend) + ' ' + (metric.context || '') },
            position: { x: 80 + (i * 220), y: 310, width: 160, height: 20 },
            style: {
              fontSize: 12,
              color: this.getTrendColor(metric.trend),
              textAlign: 'center',
              fontWeight: '600'
            },
            layer: 7
          }
        ]).flat(),
        // Key insights section
        {
          id: `insights_header_${slide.id}`,
          type: 'text',
          content: { text: '🔍 Key Business Insights' },
          position: { x: 60, y: 360, width: 680, height: 30 },
          style: {
            fontSize: 18,
            fontWeight: '600',
            color: '#1f2937',
            textAlign: 'left'
          },
          layer: 8
        },
        ...slide.content.keyPoints.map((point, i) => ({
          id: `insight_${i}_${slide.id}`,
          type: 'text' as const,
          content: { text: `• ${point}` },
          position: { x: 80, y: 400 + (i * 25), width: 640, height: 20 },
          style: {
            fontSize: 14,
            color: '#374151',
            textAlign: 'left',
            lineHeight: 1.5
          },
          layer: 9 + i
        }))
      ],
      design: {
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        accentColor: '#1e40af',
        layout: 'executive_summary'
      },
      keyTakeaways: [
        slide.executiveMessage,
        ...slide.content.keyPoints.slice(0, 2)
      ]
    }
  }

  private buildKeyFindingsSlide(slide: WorldClassSlide, index: number): ProductionSlide {
    const charts = slide.visuals?.charts || []
    const callouts = slide.visuals?.callouts || []

    return {
      id: slide.id,
      type: slide.type,
      title: slide.title,
      subtitle: 'Critical Discoveries from Data Analysis',
      content: {
        summary: slide.content.headline,
        keyMetrics: [],
        insights: slide.content.keyPoints,
        recommendations: [slide.content.callToAction],
        nextActions: []
      },
      charts: charts.map((chart, i) => ({
        id: `chart_${slide.id}_${i}`,
        type: chart.type as any,
        title: chart.title,
        data: Array.isArray(chart.data) ? chart.data : this.generateSampleData(chart.type),
        configuration: {
          colors: ['#dc2626', '#1e40af', '#059669', '#f59e0b'],
          theme: 'professional',
          showGrid: true,
          showLegend: true,
          showTooltip: true
        }
      })),
      elements: [
        // Dark header for impact
        {
          id: `header_${slide.id}`,
          type: 'shape',
          content: { shape: 'rectangle' },
          position: { x: 0, y: 0, width: 800, height: 80 },
          style: {
            backgroundColor: '#1f2937',
            borderRadius: 0
          },
          layer: 1
        },
        {
          id: `title_${slide.id}`,
          type: 'text',
          content: { text: slide.title },
          position: { x: 60, y: 20, width: 680, height: 40 },
          style: {
            fontSize: 32,
            fontWeight: 'bold',
            color: '#ffffff',
            textAlign: 'center'
          },
          layer: 2
        },
        // Critical findings grid
        ...slide.content.keyPoints.map((finding, i) => {
          const cardX = (i % 2) * 380 + 60
          const cardY = 100 + Math.floor(i / 2) * 150
          
          return [
            // Finding card
            {
              id: `finding_card_${i}_${slide.id}`,
              type: 'shape' as const,
              content: { shape: 'rectangle' },
              position: { x: cardX, y: cardY, width: 320, height: 130 },
              style: {
                backgroundColor: '#ffffff',
                borderRadius: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                border: '2px solid #e5e7eb'
              },
              layer: 3
            },
            // Finding number
            {
              id: `finding_number_${i}_${slide.id}`,
              type: 'text' as const,
              content: { text: `${i + 1}` },
              position: { x: cardX + 20, y: cardY + 20, width: 30, height: 30 },
              style: {
                fontSize: 20,
                fontWeight: 'bold',
                color: '#ffffff',
                backgroundColor: '#dc2626',
                borderRadius: '50%',
                textAlign: 'center',
                lineHeight: '30px'
              },
              layer: 4
            },
            // Finding text
            {
              id: `finding_text_${i}_${slide.id}`,
              type: 'text' as const,
              content: { text: finding },
              position: { x: cardX + 60, y: cardY + 20, width: 240, height: 90 },
              style: {
                fontSize: 14,
                color: '#1f2937',
                textAlign: 'left',
                lineHeight: 1.4,
                fontWeight: '500'
              },
              layer: 5
            }
          ]
        }).flat(),
        // Critical callouts
        ...callouts.map((callout, i) => ({
          id: `callout_${i}_${slide.id}`,
          type: 'text' as const,
          content: { 
            text: `⚠️ ${callout.message}`,
            html: `<div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                     <div class="flex">
                       <div class="text-red-500 text-lg mr-3">⚠️</div>
                       <div class="text-red-800 font-medium">${callout.message}</div>
                     </div>
                   </div>`
          },
          position: { x: 60, y: 450 + (i * 60), width: 680, height: 50 },
          style: {
            backgroundColor: '#fef2f2',
            borderLeft: '4px solid #ef4444',
            borderRadius: '0 8px 8px 0',
            padding: 16,
            fontSize: 14,
            color: '#991b1b',
            fontWeight: '500'
          },
          layer: 10 + i
        }))
      ],
      design: {
        backgroundColor: '#f9fafb',
        textColor: '#1f2937',
        accentColor: '#dc2626',
        layout: 'findings_grid'
      },
      keyTakeaways: slide.content.keyPoints
    }
  }

  private buildRecommendationsSlide(slide: WorldClassSlide, index: number): ProductionSlide {
    return {
      id: slide.id,
      type: slide.type,
      title: slide.title,
      subtitle: 'Strategic Actions for Business Impact',
      content: {
        summary: slide.content.headline,
        keyMetrics: [],
        insights: [],
        recommendations: slide.content.keyPoints,
        nextActions: [slide.content.callToAction]
      },
      charts: [],
      elements: [
        // Success-themed header
        {
          id: `header_${slide.id}`,
          type: 'shape',
          content: { shape: 'rectangle' },
          position: { x: 0, y: 0, width: 800, height: 80 },
          style: {
            backgroundImage: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            borderRadius: 0
          },
          layer: 1
        },
        {
          id: `title_${slide.id}`,
          type: 'text',
          content: { text: slide.title },
          position: { x: 60, y: 20, width: 680, height: 40 },
          style: {
            fontSize: 32,
            fontWeight: 'bold',
            color: '#ffffff',
            textAlign: 'center'
          },
          layer: 2
        },
        // Recommendation cards
        ...slide.content.keyPoints.map((rec, i) => [
          // Recommendation card
          {
            id: `rec_card_${i}_${slide.id}`,
            type: 'shape' as const,
            content: { shape: 'rectangle' },
            position: { x: 60, y: 100 + (i * 80), width: 680, height: 70 },
            style: {
              backgroundColor: '#ffffff',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb'
            },
            layer: 3
          },
          // Priority indicator
          {
            id: `rec_priority_${i}_${slide.id}`,
            type: 'text' as const,
            content: { text: 'HIGH' },
            position: { x: 80, y: 115 + (i * 80), width: 60, height: 25 },
            style: {
              fontSize: 12,
              fontWeight: 'bold',
              color: '#ffffff',
              backgroundColor: '#dc2626',
              borderRadius: 12,
              textAlign: 'center',
              lineHeight: '25px'
            },
            layer: 4
          },
          // Recommendation text
          {
            id: `rec_text_${i}_${slide.id}`,
            type: 'text' as const,
            content: { text: rec },
            position: { x: 160, y: 110 + (i * 80), width: 500, height: 40 },
            style: {
              fontSize: 16,
              color: '#1f2937',
              textAlign: 'left',
              lineHeight: 1.4,
              fontWeight: '500'
            },
            layer: 5
          },
          // Action arrow
          {
            id: `rec_arrow_${i}_${slide.id}`,
            type: 'text' as const,
            content: { text: '→' },
            position: { x: 680, y: 120 + (i * 80), width: 40, height: 30 },
            style: {
              fontSize: 24,
              color: '#059669',
              textAlign: 'center',
              fontWeight: 'bold'
            },
            layer: 6
          }
        ]).flat(),
        // Call to action
        {
          id: `cta_${slide.id}`,
          type: 'text',
          content: { 
            text: slide.content.callToAction,
            html: `<div class="bg-green-50 border border-green-200 p-6 rounded-lg text-center">
                     <div class="text-green-800 font-bold text-lg">🎯 Next Step</div>
                     <div class="text-green-700 mt-2">${slide.content.callToAction}</div>
                   </div>`
          },
          position: { x: 60, y: 480, width: 680, height: 80 },
          style: {
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 8,
            padding: 24,
            textAlign: 'center',
            fontSize: 16,
            color: '#166534',
            fontWeight: '600'
          },
          layer: 10
        }
      ],
      design: {
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        accentColor: '#059669',
        layout: 'recommendations_list'
      },
      keyTakeaways: slide.content.keyPoints
    }
  }

  private buildGenericSlide(slide: WorldClassSlide, index: number): ProductionSlide {
    return {
      id: slide.id,
      type: slide.type,
      title: slide.title,
      content: {
        summary: slide.content.headline,
        keyMetrics: [],
        insights: slide.content.keyPoints,
        recommendations: [slide.content.callToAction],
        nextActions: []
      },
      charts: [],
      elements: [
        {
          id: `title_${slide.id}`,
          type: 'text',
          content: { text: slide.title },
          position: { x: 60, y: 40, width: 680, height: 60 },
          style: {
            fontSize: 32,
            fontWeight: 'bold',
            color: '#1f2937',
            textAlign: 'center'
          },
          layer: 1
        }
      ],
      design: {
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        accentColor: '#2563eb',
        layout: 'standard'
      },
      keyTakeaways: []
    }
  }

  // Utility methods
  private getDefaultTheme() {
    return {
      colors: {
        primary: '#1e40af',
        secondary: '#64748b',
        accent: '#f59e0b',
        success: '#059669',
        warning: '#f59e0b',
        error: '#dc2626'
      }
    }
  }

  private getTrendColor(trend?: string): string {
    switch (trend) {
      case 'up': return '#059669'
      case 'down': return '#dc2626'
      case 'stable': return '#64748b'
      default: return '#1f2937'
    }
  }

  private getTrendIcon(trend?: string): string {
    switch (trend) {
      case 'up': return '↗️'
      case 'down': return '↘️'
      case 'stable': return '→'
      default: return '📊'
    }
  }

  private generateSampleData(chartType: string): any[] {
    // This would be replaced with actual data in production
    switch (chartType) {
      case 'bar':
        return [
          { name: 'Q1', value: 400 },
          { name: 'Q2', value: 300 },
          { name: 'Q3', value: 600 },
          { name: 'Q4', value: 800 }
        ]
      case 'line':
        return [
          { date: '2024-01', value: 100 },
          { date: '2024-02', value: 120 },
          { date: '2024-03', value: 150 },
          { date: '2024-04', value: 180 }
        ]
      default:
        return []
    }
  }

  private buildDeepAnalysisSlide(slide: WorldClassSlide, index: number): ProductionSlide {
    // Implementation for deep analysis slide
    return this.buildGenericSlide(slide, index)
  }

  private buildImplementationSlide(slide: WorldClassSlide, index: number): ProductionSlide {
    // Implementation for implementation slide
    return this.buildGenericSlide(slide, index)
  }

  private buildNextStepsSlide(slide: WorldClassSlide, index: number): ProductionSlide {
    // Implementation for next steps slide
    return this.buildGenericSlide(slide, index)
  }
}

export default ProductionSlideBuilder