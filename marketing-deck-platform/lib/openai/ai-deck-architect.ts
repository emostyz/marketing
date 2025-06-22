// AI Deck Architect - Complete Control Over Deck Generation
import { EnhancedInsight, NarrativeArc } from './enhanced-brain'

export interface DeckContext {
  data: any[]
  businessGoals: string
  targetAudience: string
  keyQuestions: string[]
  constraints: string[]
  industry: string
  presentationType: 'executive' | 'investor' | 'stakeholder' | 'team' | 'client'
  timeLimit: number // minutes
  slideCount: number
  brandGuidelines?: {
    primaryColor: string
    secondaryColor: string
    fontFamily: string
    logo?: string
  }
  userPreferences: {
    chartStyle: 'minimal' | 'detailed' | 'interactive'
    narrativeStyle: 'executive' | 'analytical' | 'storytelling' | 'persuasive'
    focusAreas: string[]
    avoidTopics: string[]
  }
}

export interface SlideType {
  id: string
  type: 'title' | 'agenda' | 'content' | 'chart' | 'comparison' | 'timeline' | 'process' | 'quote' | 'stats' | 'call-to-action' | 'summary' | 'custom'
  title: string
  subtitle?: string
  content: {
    body?: string
    bulletPoints?: string[]
    narrative?: string[]
    insights?: string[]
    data?: any[]
    chartConfig?: any
    image?: string
    quote?: string
    author?: string
  }
  layout: {
    template: 'standard' | 'split' | 'grid' | 'hero' | 'minimal' | 'detailed'
    alignment: 'left' | 'center' | 'right'
    spacing: 'tight' | 'normal' | 'loose'
    background: 'solid' | 'gradient' | 'image' | 'pattern'
  }
  styling: {
    theme: 'professional' | 'modern' | 'creative' | 'minimal' | 'bold'
    colorScheme: string[]
    fontFamily: string
    fontSize: number
    emphasis: 'subtle' | 'moderate' | 'strong'
  }
  interactions: {
    animations: boolean
    clickable: boolean
    drillDown: boolean
    tooltips: boolean
  }
  metadata: {
    importance: 'critical' | 'important' | 'supporting'
    timeEstimate: number // seconds
    audienceFocus: string[]
    keyMessage: string
  }
}

export interface DeckStructure {
  id: string
  title: string
  subtitle?: string
  theme: {
    name: string
    primaryColor: string
    secondaryColor: string
    accentColor: string
    backgroundColor: string
    fontFamily: string
    fontSizes: {
      title: number
      subtitle: number
      body: number
      caption: number
    }
  }
  slides: SlideType[]
  narrative: {
    hook: string
    problem: string
    solution: string
    evidence: string[]
    callToAction: string
  }
  metadata: {
    totalSlides: number
    estimatedDuration: number
    complexity: 'simple' | 'moderate' | 'complex'
    targetAudience: string[]
    keyInsights: string[]
    recommendations: string[]
    riskLevel: 'low' | 'medium' | 'high'
    workAppropriate: boolean
    contentWarnings?: string[]
  }
}

export class AIDeckArchitect {
  private context: DeckContext
  private insights: EnhancedInsight[]
  private narrativeArc: NarrativeArc | null = null

  constructor(context: DeckContext, insights: EnhancedInsight[], narrativeArc: NarrativeArc | null) {
    this.context = context
    this.insights = insights
    this.narrativeArc = narrativeArc
  }

  async designCompleteDeck(): Promise<DeckStructure> {
    console.log('🏗️ AI Deck Architect designing complete deck...')

    // Step 1: Analyze context and determine optimal structure
    const structureAnalysis = await this.analyzeStructure()
    
    // Step 2: Check for inappropriate content
    const contentCheck = await this.checkContentAppropriateness()
    if (!contentCheck.appropriate) {
      throw new Error(`Content inappropriate: ${contentCheck.reasons.join(', ')}`)
    }

    // Step 3: Design theme and styling
    const theme = await this.designTheme()

    // Step 4: Generate slide sequence
    const slides = await this.generateSlideSequence()

    // Step 5: Create narrative flow
    const narrative = await this.createNarrativeFlow()

    // Step 6: Calculate metadata
    const metadata = await this.calculateMetadata(slides)

    const deck: DeckStructure = {
      id: `deck_${Date.now()}`,
      title: structureAnalysis.title,
      subtitle: structureAnalysis.subtitle,
      theme,
      slides,
      narrative,
      metadata
    }

    console.log(`✅ AI Deck Architect completed: ${slides.length} slides, ${metadata.estimatedDuration}min`)
    return deck
  }

  private async analyzeStructure() {
    const response = await fetch('/api/openai/deck-structure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        context: this.context,
        insights: this.insights,
        narrativeArc: this.narrativeArc
      })
    })

    const result = await response.json()
    if (result.success) {
      return result.structure
    }
    
    throw new Error('Failed to analyze deck structure')
  }

  private async checkContentAppropriateness() {
    const response = await fetch('/api/openai/content-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        context: this.context,
        insights: this.insights,
        narrativeArc: this.narrativeArc
      })
    })

    const result = await response.json()
    return result.check
  }

  private async designTheme() {
    const response = await fetch('/api/openai/deck-theme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        context: this.context,
        presentationType: this.context.presentationType,
        brandGuidelines: this.context.brandGuidelines
      })
    })

    const result = await response.json()
    if (result.success) {
      return result.theme
    }
    
    // Fallback theme
    return {
      name: 'Professional',
      primaryColor: '#1f77b4',
      secondaryColor: '#ff7f0e',
      accentColor: '#2ca02c',
      backgroundColor: '#ffffff',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSizes: {
        title: 32,
        subtitle: 24,
        body: 16,
        caption: 12
      }
    }
  }

  private async generateSlideSequence() {
    const response = await fetch('/api/openai/slide-sequence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        context: this.context,
        insights: this.insights,
        narrativeArc: this.narrativeArc
      })
    })

    const result = await response.json()
    if (result.success) {
      return result.slides
    }
    
    throw new Error('Failed to generate slide sequence')
  }

  private async createNarrativeFlow() {
    if (this.narrativeArc) {
      return {
        hook: this.narrativeArc.hook,
        problem: this.narrativeArc.risingAction.map(a => a.title).join(', '),
        solution: this.narrativeArc.fallingAction.map(a => a.title).join(', '),
        evidence: this.insights.map(i => i.title),
        callToAction: this.narrativeArc.callToAction
      }
    }

    // Generate narrative from insights
    const response = await fetch('/api/openai/narrative-flow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        context: this.context,
        insights: this.insights
      })
    })

    const result = await response.json()
    if (result.success) {
      return result.narrative
    }
    
    throw new Error('Failed to create narrative flow')
  }

  private async calculateMetadata(slides: SlideType[]) {
    const totalSlides = slides.length
    const estimatedDuration = slides.reduce((sum, slide) => sum + slide.metadata.timeEstimate, 0)
    const complexity = this.calculateComplexity(slides)
    const keyInsights = this.insights.map(i => i.title)
    const recommendations = this.insights.flatMap(i => i.recommendations)
    const riskLevel = this.calculateRiskLevel()

    return {
      totalSlides,
      estimatedDuration: Math.ceil(estimatedDuration / 60), // Convert to minutes
      complexity,
      targetAudience: [this.context.targetAudience],
      keyInsights,
      recommendations,
      riskLevel,
      workAppropriate: true,
      contentWarnings: []
    }
  }

  private calculateComplexity(slides: SlideType[]): 'simple' | 'moderate' | 'complex' {
    const chartSlides = slides.filter(s => s.type === 'chart').length
    const dataSlides = slides.filter(s => s.content.data && s.content.data.length > 0).length
    
    if (chartSlides > 5 || dataSlides > 8 || slides.length > 15) return 'complex'
    if (chartSlides > 2 || dataSlides > 4 || slides.length > 10) return 'moderate'
    return 'simple'
  }

  private calculateRiskLevel(): 'low' | 'medium' | 'high' {
    const highImpactInsights = this.insights.filter(i => i.impact === 'high')
    const riskInsights = this.insights.filter(i => i.type === 'risk')
    
    if (highImpactInsights.length > 3 || riskInsights.length > 2) return 'high'
    if (highImpactInsights.length > 1 || riskInsights.length > 0) return 'medium'
    return 'low'
  }

  // User customization methods
  async customizeSlide(slideId: string, customizations: Partial<SlideType>) {
    const response = await fetch('/api/openai/customize-slide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slideId,
        customizations,
        context: this.context
      })
    })

    const result = await response.json()
    if (result.success) {
      return result.slide
    }
    
    throw new Error('Failed to customize slide')
  }

  async addSlide(slideType: string, position?: number) {
    const response = await fetch('/api/openai/add-slide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slideType,
        position,
        context: this.context,
        insights: this.insights
      })
    })

    const result = await response.json()
    if (result.success) {
      return result.slide
    }
    
    throw new Error('Failed to add slide')
  }

  async reorderSlides(slideIds: string[]) {
    const response = await fetch('/api/openai/reorder-slides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slideIds,
        context: this.context
      })
    })

    const result = await response.json()
    if (result.success) {
      return result.slides
    }
    
    throw new Error('Failed to reorder slides')
  }

  async updateTheme(themeUpdates: Partial<DeckStructure['theme']>) {
    const response = await fetch('/api/openai/update-theme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        themeUpdates,
        context: this.context
      })
    })

    const result = await response.json()
    if (result.success) {
      return result.theme
    }
    
    throw new Error('Failed to update theme')
  }
} 