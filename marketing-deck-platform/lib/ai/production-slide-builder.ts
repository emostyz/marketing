// PRODUCTION SLIDE BUILDER
// Enterprise-grade slide generation and layout engine

import { z } from 'zod'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Slide schema definitions
const SlideElementSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'chart', 'image', 'metric', 'table', 'callout', 'divider']),
  position: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number()
  }),
  content: z.any(),
  styling: z.object({
    fontSize: z.number().optional(),
    fontWeight: z.string().optional(),
    color: z.string().optional(),
    backgroundColor: z.string().optional(),
    alignment: z.enum(['left', 'center', 'right']).optional(),
    padding: z.number().optional(),
    border: z.string().optional()
  }).optional(),
  animation: z.object({
    type: z.enum(['fade', 'slide', 'zoom', 'none']),
    duration: z.number(),
    delay: z.number()
  }).optional()
})

const SlideSchema = z.object({
  id: z.string(),
  type: z.enum(['title', 'executive_summary', 'analysis', 'insights', 'recommendations', 'conclusion']),
  title: z.string(),
  subtitle: z.string().optional(),
  layout: z.enum(['title_only', 'title_content', 'two_column', 'three_column', 'full_visual', 'dashboard']),
  elements: z.array(SlideElementSchema),
  metadata: z.object({
    businessImpact: z.string(),
    executiveMessage: z.string(),
    speakerNotes: z.string(),
    estimatedDuration: z.number(),
    complexity: z.enum(['simple', 'moderate', 'complex'])
  }),
  theme: z.object({
    primaryColor: z.string(),
    secondaryColor: z.string(),
    backgroundColor: z.string(),
    fontFamily: z.string(),
    template: z.string()
  })
})

export type SlideElement = z.infer<typeof SlideElementSchema>
export type Slide = z.infer<typeof SlideSchema>

export interface SlideGenerationRequest {
  analysisResults: any
  businessContext: {
    industry: string
    audience: string
    goals: string[]
    urgency: 'low' | 'medium' | 'high' | 'critical'
    duration: number // presentation duration in minutes
    format: 'executive' | 'detailed' | 'technical'
  }
  branding: {
    colors: string[]
    logoUrl?: string
    fontFamily?: string
    template?: string
  }
  slideCount: number
  requirements: string[]
}

export interface PresentationStructure {
  totalSlides: number
  estimatedDuration: number
  slideSummary: Array<{
    slideNumber: number
    title: string
    purpose: string
    keyMessage: string
    duration: number
  }>
  narrativeFlow: string
  executiveTakeaways: string[]
}

export class ProductionSlideBuilder {
  private openai: OpenAI
  private layoutTemplates: Map<string, any> = new Map()
  private colorPalettes: Map<string, string[]> = new Map()

  constructor() {
    this.openai = openai
    this.initializeTemplates()
    this.initializeColorPalettes()
  }

  /**
   * Generate complete presentation with production-ready slides
   */
  async generatePresentation(request: SlideGenerationRequest): Promise<{
    slides: Slide[]
    structure: PresentationStructure
    metadata: {
      confidence: number
      businessAlignment: number
      designQuality: number
      dataIntegrity: number
    }
  }> {
    console.log('🏗️ Building production presentation...')

    // Step 1: Plan presentation structure
    const structure = await this.planPresentationStructure(request)
    
    // Step 2: Generate slides
    const slides = await this.generateSlides(request, structure)
    
    // Step 3: Apply consistent design and branding
    const brandedSlides = await this.applyBrandingAndDesign(slides, request.branding)
    
    // Step 4: Optimize layouts and flow
    const optimizedSlides = await this.optimizeSlideLayouts(brandedSlides)
    
    // Step 5: Quality assessment
    const metadata = await this.assessPresentationQuality(optimizedSlides, request)

    return {
      slides: optimizedSlides,
      structure,
      metadata
    }
  }

  /**
   * Plan the overall presentation structure and narrative flow
   */
  private async planPresentationStructure(request: SlideGenerationRequest): Promise<PresentationStructure> {
    const prompt = `Plan an executive presentation structure for ${request.businessContext.industry} industry.

CONTEXT:
- Audience: ${request.businessContext.audience}
- Duration: ${request.businessContext.duration} minutes
- Format: ${request.businessContext.format}
- Urgency: ${request.businessContext.urgency}
- Target slides: ${request.slideCount}
- Goals: ${request.businessContext.goals.join(', ')}

ANALYSIS SUMMARY:
${JSON.stringify(request.analysisResults, null, 2)}

Create a presentation structure that maximizes business impact. Return JSON:
{
  "totalSlides": ${request.slideCount},
  "estimatedDuration": ${request.businessContext.duration},
  "slideSummary": [
    {
      "slideNumber": 1,
      "title": "Compelling slide title",
      "purpose": "Why this slide exists",
      "keyMessage": "Main takeaway for executives",
      "duration": 2
    }
  ],
  "narrativeFlow": "How the story flows from slide to slide",
  "executiveTakeaways": ["Key business insights executives will remember"]
}`

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_tokens: 2000
      })

      return JSON.parse(response.choices[0].message.content || '{}')
    } catch (error) {
      console.error('Structure planning error:', error)
      return this.createFallbackStructure(request)
    }
  }

  /**
   * Generate individual slides based on structure
   */
  private async generateSlides(request: SlideGenerationRequest, structure: PresentationStructure): Promise<Slide[]> {
    const slides: Slide[] = []

    for (const slideInfo of structure.slideSummary) {
      const slide = await this.generateSingleSlide(slideInfo, request)
      if (slide) {
        slides.push(slide)
      }
    }

    return slides
  }

  /**
   * Generate a single slide with all elements
   */
  private async generateSingleSlide(slideInfo: any, request: SlideGenerationRequest): Promise<Slide | null> {
    const prompt = `Generate a production-ready slide for ${slideInfo.title}.

SLIDE REQUIREMENTS:
- Title: ${slideInfo.title}
- Purpose: ${slideInfo.purpose}
- Key Message: ${slideInfo.keyMessage}
- Duration: ${slideInfo.duration} minutes

BUSINESS CONTEXT:
- Industry: ${request.businessContext.industry}
- Audience: ${request.businessContext.audience}
- Format: ${request.businessContext.format}

ANALYSIS DATA:
${JSON.stringify(request.analysisResults, null, 2)}

Create a slide with professional layout and compelling content. Return JSON:
{
  "id": "slide_${slideInfo.slideNumber}",
  "type": "analysis|insights|recommendations|executive_summary",
  "title": "${slideInfo.title}",
  "subtitle": "Supporting subtitle if needed",
  "layout": "title_content|two_column|dashboard",
  "elements": [
    {
      "id": "element_1",
      "type": "text|chart|metric|callout",
      "position": {"x": 50, "y": 100, "width": 600, "height": 80},
      "content": "Actual content with real data",
      "styling": {
        "fontSize": 24,
        "fontWeight": "bold",
        "color": "#1a1a1a",
        "alignment": "left"
      }
    }
  ],
  "metadata": {
    "businessImpact": "What business decision this slide enables",
    "executiveMessage": "The one thing executives should remember",
    "speakerNotes": "What the presenter should emphasize",
    "estimatedDuration": ${slideInfo.duration},
    "complexity": "simple|moderate|complex"
  }
}`

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 2000
      })

      const slideData = JSON.parse(response.choices[0].message.content || '{}')
      
      // Enhance with real data from analysis
      const enhancedSlide = await this.enhanceSlideWithRealData(slideData, request.analysisResults)
      
      return SlideSchema.parse({
        ...enhancedSlide,
        theme: this.getDefaultTheme()
      })
    } catch (error) {
      console.error(`Error generating slide ${slideInfo.slideNumber}:`, error)
      return null
    }
  }

  /**
   * Enhance slides with actual data from analysis results
   */
  private async enhanceSlideWithRealData(slide: any, analysisResults: any): Promise<any> {
    // Replace placeholder content with real data
    if (slide.elements) {
      slide.elements = slide.elements.map((element: any) => {
        if (element.type === 'metric' && analysisResults.insights) {
          element.content = this.extractRelevantMetric(analysisResults)
        }
        
        if (element.type === 'chart' && analysisResults.visualizations) {
          element.content = this.extractChartData(analysisResults)
        }
        
        if (element.type === 'text' && element.content.includes('placeholder')) {
          element.content = this.extractInsightText(analysisResults)
        }

        return element
      })
    }

    return slide
  }

  /**
   * Apply consistent branding and design across slides
   */
  private async applyBrandingAndDesign(slides: Slide[], branding: any): Promise<Slide[]> {
    const colorPalette = branding.colors?.length > 0 
      ? branding.colors 
      : this.colorPalettes.get('professional') || ['#1e40af', '#64748b', '#f59e0b']

    return slides.map(slide => ({
      ...slide,
      theme: {
        primaryColor: colorPalette[0],
        secondaryColor: colorPalette[1],
        backgroundColor: '#ffffff',
        fontFamily: branding.fontFamily || 'Inter, system-ui, sans-serif',
        template: branding.template || 'executive'
      },
      elements: slide.elements.map(element => ({
        ...element,
        styling: {
          ...element.styling,
          color: element.styling?.color || colorPalette[0],
          fontFamily: branding.fontFamily || 'Inter, system-ui, sans-serif'
        }
      }))
    }))
  }

  /**
   * Optimize slide layouts for readability and impact
   */
  private async optimizeSlideLayouts(slides: Slide[]): Promise<Slide[]> {
    return slides.map(slide => {
      // Apply layout optimizations based on content type
      const optimizedElements = this.optimizeElementPositions(slide.elements, slide.layout)
      
      // Add visual hierarchy
      const hierarchyElements = this.applyVisualHierarchy(optimizedElements)
      
      // Ensure accessibility
      const accessibleElements = this.ensureAccessibility(hierarchyElements)

      return {
        ...slide,
        elements: accessibleElements
      }
    })
  }

  /**
   * Assess presentation quality and provide metrics
   */
  private async assessPresentationQuality(slides: Slide[], request: SlideGenerationRequest): Promise<any> {
    let qualityScore = 70 // Base score

    // Content quality assessment
    const hasExecutiveSummary = slides.some(s => s.type === 'executive_summary')
    const hasRecommendations = slides.some(s => s.type === 'recommendations')
    const hasDataVisualization = slides.some(s => s.elements.some(e => e.type === 'chart'))
    
    if (hasExecutiveSummary) qualityScore += 10
    if (hasRecommendations) qualityScore += 10
    if (hasDataVisualization) qualityScore += 5

    // Design consistency
    const consistentThemes = this.checkThemeConsistency(slides)
    if (consistentThemes) qualityScore += 5

    // Business alignment
    const businessAlignment = this.assessBusinessAlignment(slides, request)
    qualityScore += Math.round(businessAlignment * 0.2)

    // Data integrity
    const dataIntegrity = this.assessDataIntegrity(slides, request.analysisResults)

    return {
      confidence: Math.min(qualityScore, 95),
      businessAlignment,
      designQuality: this.assessDesignQuality(slides),
      dataIntegrity
    }
  }

  // Helper methods
  private extractRelevantMetric(analysisResults: any): any {
    if (analysisResults.insights && analysisResults.insights.length > 0) {
      const insight = analysisResults.insights[0]
      return {
        label: insight.title || 'Key Metric',
        value: insight.confidence || 85,
        trend: 'up',
        context: 'vs. previous period'
      }
    }
    return { label: 'Performance', value: 'N/A', trend: 'stable', context: '' }
  }

  private extractChartData(analysisResults: any): any {
    if (analysisResults.visualizations && analysisResults.visualizations.length > 0) {
      return analysisResults.visualizations[0]
    }
    return {
      type: 'bar',
      title: 'Analysis Results',
      data: [],
      config: { colors: ['#1e40af'] }
    }
  }

  private extractInsightText(analysisResults: any): string {
    if (analysisResults.insights && analysisResults.insights.length > 0) {
      return analysisResults.insights[0].description || 'Key business insight from analysis'
    }
    return 'Analysis reveals important business opportunities'
  }

  private optimizeElementPositions(elements: SlideElement[], layout: string): SlideElement[] {
    const template = this.layoutTemplates.get(layout) || this.layoutTemplates.get('title_content')
    
    if (!template) return elements

    return elements.map((element, index) => {
      const templatePosition = template.positions[index] || template.positions[0]
      return {
        ...element,
        position: {
          ...element.position,
          ...templatePosition
        }
      }
    })
  }

  private applyVisualHierarchy(elements: SlideElement[]): SlideElement[] {
    return elements.map((element, index) => {
      let fontSize = element.styling?.fontSize || 16
      
      // Apply hierarchy: title > subtitle > content > details
      if (element.type === 'text' && index === 0) fontSize = 28 // Title
      else if (element.type === 'text' && index === 1) fontSize = 20 // Subtitle
      else if (element.type === 'metric') fontSize = 32 // Metrics stand out
      
      return {
        ...element,
        styling: {
          ...element.styling,
          fontSize
        }
      }
    })
  }

  private ensureAccessibility(elements: SlideElement[]): SlideElement[] {
    return elements.map(element => ({
      ...element,
      styling: {
        ...element.styling,
        // Ensure sufficient contrast
        color: this.ensureContrast(element.styling?.color || '#000000'),
        // Minimum font size for readability
        fontSize: Math.max(element.styling?.fontSize || 16, 14)
      }
    }))
  }

  private checkThemeConsistency(slides: Slide[]): boolean {
    if (slides.length === 0) return true
    
    const firstTheme = slides[0].theme
    return slides.every(slide => 
      slide.theme.primaryColor === firstTheme.primaryColor &&
      slide.theme.fontFamily === firstTheme.fontFamily
    )
  }

  private assessBusinessAlignment(slides: Slide[], request: SlideGenerationRequest): number {
    let score = 70

    // Check if goals are addressed
    const goalKeywords = request.businessContext.goals.join(' ').toLowerCase()
    const slideContent = slides.map(s => s.title + ' ' + s.metadata.businessImpact).join(' ').toLowerCase()
    
    if (goalKeywords.split(' ').some(word => slideContent.includes(word))) {
      score += 20
    }

    // Check urgency alignment
    if (request.businessContext.urgency === 'critical' && slides.length <= 5) {
      score += 10
    }

    return Math.min(score, 100)
  }

  private assessDesignQuality(slides: Slide[]): number {
    let score = 70

    // Check for visual variety
    const elementTypes = new Set(slides.flatMap(s => s.elements.map(e => e.type)))
    score += Math.min(elementTypes.size * 5, 20)

    // Check layout variety
    const layouts = new Set(slides.map(s => s.layout))
    score += Math.min(layouts.size * 3, 10)

    return Math.min(score, 100)
  }

  private assessDataIntegrity(slides: Slide[], analysisResults: any): number {
    // Check if slides reference actual data
    const hasRealData = slides.some(slide => 
      slide.elements.some(element => 
        element.content && typeof element.content === 'object'
      )
    )

    return hasRealData ? 85 : 60
  }

  private ensureContrast(color: string): string {
    // Simple contrast check - in production would use proper contrast calculations
    const lightColors = ['#ffffff', '#f0f0f0', '#e0e0e0']
    return lightColors.includes(color.toLowerCase()) ? '#1a1a1a' : color
  }

  private createFallbackStructure(request: SlideGenerationRequest): PresentationStructure {
    return {
      totalSlides: request.slideCount,
      estimatedDuration: request.businessContext.duration,
      slideSummary: [
        {
          slideNumber: 1,
          title: 'Executive Summary',
          purpose: 'Present key findings',
          keyMessage: 'Critical business insights',
          duration: 3
        },
        {
          slideNumber: 2,
          title: 'Analysis Overview',
          purpose: 'Show methodology',
          keyMessage: 'Data-driven approach',
          duration: 2
        },
        {
          slideNumber: 3,
          title: 'Key Insights',
          purpose: 'Highlight discoveries',
          keyMessage: 'Actionable insights',
          duration: 3
        },
        {
          slideNumber: 4,
          title: 'Recommendations',
          purpose: 'Provide next steps',
          keyMessage: 'Strategic actions',
          duration: 3
        }
      ],
      narrativeFlow: 'Problem → Analysis → Insights → Action',
      executiveTakeaways: ['Data-driven insights', 'Clear recommendations', 'Business impact']
    }
  }

  private getDefaultTheme(): any {
    return {
      primaryColor: '#1e40af',
      secondaryColor: '#64748b',
      backgroundColor: '#ffffff',
      fontFamily: 'Inter, system-ui, sans-serif',
      template: 'executive'
    }
  }

  private initializeTemplates(): void {
    this.layoutTemplates.set('title_content', {
      positions: [
        { x: 50, y: 50, width: 700, height: 80 },   // Title
        { x: 50, y: 150, width: 700, height: 400 }  // Content
      ]
    })

    this.layoutTemplates.set('two_column', {
      positions: [
        { x: 50, y: 50, width: 700, height: 60 },   // Title
        { x: 50, y: 130, width: 340, height: 350 }, // Left column
        { x: 410, y: 130, width: 340, height: 350 } // Right column
      ]
    })

    this.layoutTemplates.set('dashboard', {
      positions: [
        { x: 50, y: 50, width: 700, height: 60 },   // Title
        { x: 50, y: 130, width: 200, height: 100 }, // Metric 1
        { x: 275, y: 130, width: 200, height: 100 }, // Metric 2
        { x: 500, y: 130, width: 200, height: 100 }, // Metric 3
        { x: 50, y: 250, width: 650, height: 230 }  // Chart
      ]
    })
  }

  private initializeColorPalettes(): void {
    this.colorPalettes.set('professional', ['#1e40af', '#64748b', '#f59e0b', '#059669'])
    this.colorPalettes.set('corporate', ['#1f2937', '#6b7280', '#3b82f6', '#10b981'])
    this.colorPalettes.set('modern', ['#7c3aed', '#ec4899', '#f59e0b', '#06b6d4'])
  }
}

export default ProductionSlideBuilder