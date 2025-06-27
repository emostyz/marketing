// Smart Narrative Generation Engine
// Creates compelling data stories that captivate audiences

import { OpenAI } from 'openai'
import { AIReadyData } from './data-preparation'
import { Insight } from './insight-generation'
import { ChartRecommendation } from './chart-recommendations'

export interface DataStory {
  id: string
  title: string
  theme: string
  narrative: {
    opening: string
    development: string
    climax: string
    resolution: string
    callToAction: string
  }
  keyMessages: string[]
  emotionalTone: 'urgent' | 'confident' | 'optimistic' | 'analytical' | 'inspiring' | 'dramatic'
  audience: string
  structure: StoryStructure
  visualFlow: VisualNarrative[]
}

export interface StoryStructure {
  acts: {
    setup: SlideNarrative[]
    conflict: SlideNarrative[]
    resolution: SlideNarrative[]
  }
  pacing: 'fast' | 'medium' | 'slow'
  tension: 'low' | 'medium' | 'high'
  payoff: string
}

export interface SlideNarrative {
  slideNumber: number
  role: 'setup' | 'build' | 'reveal' | 'climax' | 'resolve' | 'inspire'
  title: string
  subtitle?: string
  narrative: string
  purpose: string
  transition: string
  visualFocus: string
  emotionalNote: string
}

export interface VisualNarrative {
  slideNumber: number
  visualType: string
  narrative: string
  emphasis: string[]
  connections: string[]
  impact: 'subtle' | 'moderate' | 'dramatic'
}

export interface NarrativeGenerationResult {
  story: DataStory
  executiveSummary: string
  keyNarratives: string[]
  storyboardOutline: string[]
  metadata: {
    storyComplexity: number
    engagementScore: number
    narrativeCoherence: number
    visualAlignment: number
  }
}

export class NarrativeGenerationEngine {
  private openai: OpenAI
  
  constructor(apiKey?: string) {
    this.openai = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY
    })
  }

  /**
   * Generate compelling narrative from data insights and visualizations
   */
  async generateDataStory(
    data: AIReadyData, 
    insights: Insight[], 
    charts: ChartRecommendation[], 
    context: any
  ): Promise<NarrativeGenerationResult> {
    console.log('📖 Generating compelling data story...', {
      insights: insights.length,
      charts: charts.length,
      audience: context?.audience
    })

    try {
      // Analyze narrative potential
      const narrativePotential = this.analyzeNarrativePotential(data, insights, charts)
      
      // Generate story structure
      const storyStructure = await this.generateStoryStructure(insights, context, narrativePotential)
      
      // Create narrative flow
      const narrativeFlow = await this.createNarrativeFlow(storyStructure, insights, charts, context)
      
      // Generate visual narrative
      const visualNarrative = this.generateVisualNarrative(charts, narrativeFlow)
      
      // Create complete story
      const story = await this.assembleCompleteStory(narrativeFlow, visualNarrative, context)
      
      // Generate supporting content
      const executiveSummary = await this.generateExecutiveSummary(story, insights)
      const keyNarratives = this.extractKeyNarratives(story)
      const storyboardOutline = this.createStoryboardOutline(story)

      return {
        story,
        executiveSummary,
        keyNarratives,
        storyboardOutline,
        metadata: {
          storyComplexity: this.calculateStoryComplexity(story),
          engagementScore: this.calculateEngagementScore(story),
          narrativeCoherence: this.calculateNarrativeCoherence(story),
          visualAlignment: this.calculateVisualAlignment(story, charts)
        }
      }

    } catch (error) {
      console.error('❌ Narrative generation failed:', error)
      if (error instanceof Error) {
        throw new Error(`Narrative generation failed: ${error.message}`);
      } else {
        throw new Error('Narrative generation failed: Unknown error');
      }
    }
  }

  /**
   * Analyze the narrative potential of the data
   */
  private analyzeNarrativePotential(data: AIReadyData, insights: Insight[], charts: ChartRecommendation[]) {
    const potential = {
      tension: 0,
      surprise: 0,
      conflict: 0,
      resolution: 0,
      transformation: 0
    }

    // Analyze insights for narrative elements
    insights.forEach(insight => {
      if (insight.type === 'anomaly') potential.surprise += 20
      if (insight.type === 'trend' && insight.impact === 'high') potential.tension += 15
      if (insight.type === 'opportunity') potential.resolution += 25
      if (insight.type === 'risk') potential.conflict += 20
    })

    // Analyze data patterns
    if (data.summary.timeRange) potential.transformation += 30
    if (data.summary.numericalSummary.correlations.length > 2) potential.surprise += 15
    if (data.summary.numericalSummary.outliers.length > 0) potential.conflict += 10

    // Analyze chart storytelling potential
    charts.forEach(chart => {
      if ((chart.visualInnovation?.noveltyScore ?? 0) > 80) potential.transformation += 10
      if (chart.chartType === 'timeline') potential.transformation += 20
      if (chart.chartType === 'funnel') potential.tension += 15
    })

    return potential
  }

  /**
   * Generate story structure using AI
   */
  private async generateStoryStructure(insights: Insight[], context: any, potential: any): Promise<StoryStructure> {
    const prompt = `Create a compelling 3-act story structure for a business presentation.

Context:
- Audience: ${context?.audience || 'executives'}
- Industry: ${context?.industry || 'business'}
- Goal: ${context?.goal || 'inform and persuade'}

Key Insights:
${insights.slice(0, 5).map((insight, i) => `${i + 1}. ${insight.title}: ${insight.description}`).join('\n')}

Narrative Potential:
- Tension Level: ${potential.tension}/100
- Surprise Factor: ${potential.surprise}/100
- Conflict Elements: ${potential.conflict}/100

Create a story structure with:
1. Setup (2-3 slides): Establish context and build tension
2. Conflict (3-4 slides): Reveal challenges and build to climax
3. Resolution (2-3 slides): Present solutions and inspire action

Each act should have clear narrative purpose and emotional progression.
Return JSON format with acts, pacing, and key story elements.`

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a master storyteller who creates compelling business narratives. Return JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })

      const result = JSON.parse(response.choices[0].message.content || '{}')
      
      return {
        acts: {
          setup: result.setup || [],
          conflict: result.conflict || [],
          resolution: result.resolution || []
        },
        pacing: result.pacing || 'medium',
        tension: result.tension || 'medium',
        payoff: result.payoff || 'Actionable insights with clear next steps'
      }

    } catch (error) {
      console.warn('AI story structure generation failed:', error)
      
      // Fallback structure
      return this.generateFallbackStoryStructure(insights, potential)
    }
  }

  /**
   * Create narrative flow for each slide
   */
  private async createNarrativeFlow(
    structure: StoryStructure, 
    insights: Insight[], 
    charts: ChartRecommendation[], 
    context: any
  ): Promise<SlideNarrative[]> {
    const narrativeFlow: SlideNarrative[] = []
    let slideNumber = 1

    // Setup act
    structure.acts.setup.forEach((slide: any) => {
      narrativeFlow.push({
        slideNumber: slideNumber++,
        role: 'setup',
        title: slide.title || `Setting the Stage`,
        subtitle: slide.subtitle,
        narrative: slide.narrative || 'Establishing context and building audience engagement',
        purpose: 'Orient audience and create interest',
        transition: 'Smooth introduction to core themes',
        visualFocus: 'Context-setting visualizations',
        emotionalNote: 'Building anticipation'
      })
    })

    // Conflict act
    structure.acts.conflict.forEach((slide: any, index: number) => {
      const isClimax = index === structure.acts.conflict.length - 1
      
      narrativeFlow.push({
        slideNumber: slideNumber++,
        role: isClimax ? 'climax' : 'build',
        title: slide.title || `${isClimax ? 'The Critical Moment' : 'Building Tension'}`,
        subtitle: slide.subtitle,
        narrative: slide.narrative || 'Revealing challenges and building to key insight',
        purpose: isClimax ? 'Deliver the most important revelation' : 'Build understanding and tension',
        transition: isClimax ? 'Dramatic reveal' : 'Escalating discovery',
        visualFocus: isClimax ? 'Most impactful visualization' : 'Supporting evidence',
        emotionalNote: isClimax ? 'Peak engagement' : 'Growing concern/interest'
      })
    })

    // Resolution act
    structure.acts.resolution.forEach((slide: any, index: number) => {
      const isInspire = index === structure.acts.resolution.length - 1
      
      narrativeFlow.push({
        slideNumber: slideNumber++,
        role: isInspire ? 'inspire' : 'resolve',
        title: slide.title || `${isInspire ? 'The Path Forward' : 'Solutions Emerge'}`,
        subtitle: slide.subtitle,
        narrative: slide.narrative || 'Presenting clear solutions and next steps',
        purpose: isInspire ? 'Motivate action and commitment' : 'Provide concrete solutions',
        transition: isInspire ? 'Inspiring conclusion' : 'Natural progression to action',
        visualFocus: isInspire ? 'Future-focused visuals' : 'Solution-oriented charts',
        emotionalNote: isInspire ? 'Optimism and determination' : 'Confidence and clarity'
      })
    })

    return narrativeFlow
  }

  /**
   * Generate visual narrative alignment
   */
  private generateVisualNarrative(charts: ChartRecommendation[], narrativeFlow: SlideNarrative[]): VisualNarrative[] {
    return narrativeFlow.map((slide, index) => {
      const relevantChart = charts[index % charts.length] // Cycle through available charts
      
      return {
        slideNumber: slide.slideNumber,
        visualType: relevantChart?.chartType || 'data visualization',
        narrative: this.generateVisualNarrativeText(slide, relevantChart),
        emphasis: this.determineVisualEmphasis(slide.role),
        connections: this.generateVisualConnections(slide, index, narrativeFlow),
        impact: this.determineVisualImpact(slide.role)
      }
    })
  }

  /**
   * Generate visual narrative text
   */
  private generateVisualNarrativeText(slide: SlideNarrative, chart?: ChartRecommendation): string {
    const roleNarratives = {
      setup: 'Visual establishes baseline understanding and context',
      build: 'Chart reveals emerging patterns and builds tension',
      reveal: 'Visualization uncovers hidden insights and surprises',
      climax: 'Most dramatic chart delivers the key revelation',
      resolve: 'Clear visualization shows the solution path',
      inspire: 'Future-focused visual motivates action and commitment'
    }

    const baseNarrative = roleNarratives[slide.role] || 'Supporting visualization'
    
    if (chart?.visualInnovation?.storytelling) {
      return `${baseNarrative}. ${chart.visualInnovation.storytelling}`
    }
    
    return baseNarrative
  }

  /**
   * Determine visual emphasis points
   */
  private determineVisualEmphasis(role: string): string[] {
    const emphasisMap: { [key: string]: string[] } = {
      setup: ['context', 'baseline', 'orientation'],
      build: ['patterns', 'trends', 'evidence'],
      reveal: ['anomalies', 'surprises', 'discoveries'],
      climax: ['key-insight', 'dramatic-data', 'turning-point'],
      resolve: ['solutions', 'pathways', 'improvements'],
      inspire: ['future-state', 'potential', 'vision']
    }

    return emphasisMap[role] || ['data-focus']
  }

  /**
   * Generate visual connections between slides
   */
  private generateVisualConnections(slide: SlideNarrative, index: number, flow: SlideNarrative[]): string[] {
    const connections = []
    
    if (index > 0) {
      connections.push(`Builds on ${flow[index - 1].visualFocus}`)
    }
    
    if (index < flow.length - 1) {
      connections.push(`Leads to ${flow[index + 1].visualFocus}`)
    }
    
    return connections
  }

  /**
   * Determine visual impact level
   */
  private determineVisualImpact(role: string): 'subtle' | 'moderate' | 'dramatic' {
    const impactMap: { [key: string]: string } = {
      setup: 'subtle',
      build: 'moderate',
      reveal: 'dramatic',
      climax: 'dramatic',
      resolve: 'moderate',
      inspire: 'dramatic'
    }

    const allowed: Array<'subtle' | 'moderate' | 'dramatic'> = ['subtle', 'moderate', 'dramatic'];
    const value = impactMap[role];
    return allowed.includes(value as any) ? (value as 'subtle' | 'moderate' | 'dramatic') : 'moderate';
  }

  /**
   * Assemble complete story
   */
  private async assembleCompleteStory(
    narrativeFlow: SlideNarrative[], 
    visualNarrative: VisualNarrative[], 
    context: any
  ): Promise<DataStory> {
    // Generate overarching story elements using AI
    const themePrompt = `Based on this narrative flow, create a compelling story theme and key messages:

Narrative Flow:
${narrativeFlow.map(slide => `${slide.slideNumber}. ${slide.title} (${slide.role}): ${slide.narrative}`).join('\n')}

Generate:
1. A compelling story title
2. Central theme
3. 3-5 key messages
4. Emotional tone
5. Opening hook
6. Development narrative
7. Climactic moment
8. Resolution message
9. Call to action

Return JSON format.`

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a master storyteller creating compelling business narratives. Return JSON format."
          },
          {
            role: "user",
            content: themePrompt
          }
        ],
        temperature: 0.8,
        response_format: { type: "json_object" }
      })

      const storyElements = JSON.parse(response.choices[0].message.content || '{}')

      return {
        id: `story_${Date.now()}`,
        title: storyElements.title || 'Data-Driven Insights Story',
        theme: storyElements.theme || 'Transformational business insights',
        narrative: {
          opening: storyElements.opening || 'Setting the stage for discovery',
          development: storyElements.development || 'Building understanding through data',
          climax: storyElements.climax || 'The crucial insight revealed',
          resolution: storyElements.resolution || 'Clear path forward',
          callToAction: storyElements.callToAction || 'Take action on insights'
        },
        keyMessages: storyElements.keyMessages || [
          'Data reveals important patterns',
          'Strategic opportunities identified',
          'Clear action plan available'
        ],
        emotionalTone: storyElements.emotionalTone || 'confident',
        audience: context?.audience || 'executives',
        structure: {
          acts: {
            setup: narrativeFlow.filter(s => s.role === 'setup'),
            conflict: narrativeFlow.filter(s => ['build', 'reveal', 'climax'].includes(s.role)),
            resolution: narrativeFlow.filter(s => ['resolve', 'inspire'].includes(s.role))
          },
          pacing: 'medium',
          tension: 'medium',
          payoff: 'Actionable insights with clear impact'
        },
        visualFlow: visualNarrative
      }

    } catch (error) {
      console.warn('AI story assembly failed:', error)
      
      // Fallback story
      return this.generateFallbackStory(narrativeFlow, visualNarrative, context)
    }
  }

  /**
   * Generate fallback story structure
   */
  private generateFallbackStoryStructure(insights: Insight[], potential: any): StoryStructure {
    return {
      acts: {
        setup: [
          { slideNumber: 1, role: 'setup', title: 'Current State Analysis', narrative: 'Understanding where we are today', purpose: 'Establish context', transition: 'Intro to KPIs', visualFocus: 'Overview', emotionalNote: 'Curiosity' },
          { slideNumber: 2, role: 'build', title: 'Key Performance Indicators', narrative: 'Measuring what matters most', purpose: 'Highlight KPIs', transition: 'To challenges', visualFocus: 'KPIs', emotionalNote: 'Interest' },
          { slideNumber: 3, role: 'reveal', title: 'Challenges Identified', narrative: 'Critical issues requiring attention', purpose: 'Expose challenges', transition: 'To opportunities', visualFocus: 'Problems', emotionalNote: 'Concern' },
          { slideNumber: 4, role: 'build', title: 'Opportunity Analysis', narrative: 'Hidden potential in the data', purpose: 'Show opportunities', transition: 'To turning point', visualFocus: 'Opportunities', emotionalNote: 'Hope' },
          { slideNumber: 5, role: 'climax', title: 'The Turning Point', narrative: 'Key insight that changes everything', purpose: 'Deliver insight', transition: 'To solutions', visualFocus: 'Insight', emotionalNote: 'Excitement' },
          { slideNumber: 6, role: 'resolve', title: 'Strategic Solutions', narrative: 'Clear path to improvement', purpose: 'Present solutions', transition: 'To next steps', visualFocus: 'Solutions', emotionalNote: 'Confidence' },
          { slideNumber: 7, role: 'inspire', title: 'Next Steps', narrative: 'Actionable recommendations', purpose: 'Motivate action', transition: 'Conclusion', visualFocus: 'Action', emotionalNote: 'Motivation' },
          { slideNumber: 8, role: 'build', title: 'Challenge Deep Dive', narrative: 'Exploring the root causes', purpose: 'Analyze challenges', transition: 'To recommendations', visualFocus: 'Root causes', emotionalNote: 'Seriousness' },
          { slideNumber: 9, role: 'resolve', title: 'Strategic Recommendations', narrative: 'Proposed solutions and next steps', purpose: 'Present recommendations', transition: 'To outcomes', visualFocus: 'Recommendations', emotionalNote: 'Optimism' },
          { slideNumber: 10, role: 'inspire', title: 'Expected Outcomes', narrative: 'Anticipated results and impact', purpose: 'Show outcomes', transition: 'To closing', visualFocus: 'Outcomes', emotionalNote: 'Excitement' },
          { slideNumber: 11, role: 'inspire', title: 'Closing Thoughts', narrative: 'Final remarks and call to action', purpose: 'Conclude', transition: 'To Q&A', visualFocus: 'Conclusion', emotionalNote: 'Closure' },
          { slideNumber: 12, role: 'inspire', title: 'Q&A', narrative: 'Open floor for questions', purpose: 'Engage audience', transition: 'End', visualFocus: 'Q&A', emotionalNote: 'Engagement' }
        ],
        conflict: [
          { slideNumber: 13, role: 'build', title: 'Conflict Slide 1', narrative: 'Conflict narrative 1', purpose: 'Describe conflict 1', transition: 'To next conflict', visualFocus: 'Conflict 1', emotionalNote: 'Tension' },
          { slideNumber: 14, role: 'build', title: 'Conflict Slide 2', narrative: 'Conflict narrative 2', purpose: 'Describe conflict 2', transition: 'To next conflict', visualFocus: 'Conflict 2', emotionalNote: 'Tension' },
          { slideNumber: 15, role: 'climax', title: 'Conflict Slide 3', narrative: 'Conflict narrative 3', purpose: 'Describe climax', transition: 'To resolution', visualFocus: 'Climax', emotionalNote: 'Peak tension' },
        ],
        resolution: [
          { slideNumber: 16, role: 'resolve', title: 'Resolution Slide 1', narrative: 'Resolution narrative 1', purpose: 'Describe resolution 1', transition: 'To next resolution', visualFocus: 'Resolution 1', emotionalNote: 'Relief' },
          { slideNumber: 17, role: 'inspire', title: 'Resolution Slide 2', narrative: 'Resolution narrative 2', purpose: 'Describe final inspiration', transition: 'End', visualFocus: 'Resolution 2', emotionalNote: 'Inspiration' }
        ]
      },
      pacing: 'medium',
      tension: potential.tension > 50 ? 'high' : 'medium',
      payoff: 'Clear insights with actionable next steps'
    }
  }

  /**
   * Generate fallback story
   */
  private generateFallbackStory(
    narrativeFlow: SlideNarrative[], 
    visualNarrative: VisualNarrative[], 
    context: any
  ): DataStory {
    return {
      id: `story_${Date.now()}`,
      title: 'Data-Driven Business Insights',
      theme: 'Transforming data into strategic advantage',
      narrative: {
        opening: 'Our analysis reveals important patterns in the business data',
        development: 'Deep dive into key metrics and performance indicators',
        climax: 'Critical insight that changes our understanding',
        resolution: 'Strategic recommendations based on data analysis',
        callToAction: 'Implement recommendations for measurable impact'
      },
      keyMessages: [
        'Data reveals significant business opportunities',
        'Clear patterns indicate strategic directions',
        'Actionable insights available for immediate implementation'
      ],
      emotionalTone: 'confident',
      audience: context?.audience || 'executives',
      structure: {
        acts: {
          setup: narrativeFlow.filter(s => s.role === 'setup'),
          conflict: narrativeFlow.filter(s => ['build', 'reveal', 'climax'].includes(s.role)),
          resolution: narrativeFlow.filter(s => ['resolve', 'inspire'].includes(s.role))
        },
        pacing: 'medium',
        tension: 'medium',
        payoff: 'Clear strategic direction with measurable outcomes'
      },
      visualFlow: visualNarrative
    }
  }

  /**
   * Generate executive summary
   */
  private async generateExecutiveSummary(story: DataStory, insights: Insight[]): Promise<string> {
    const topInsights = insights.filter(i => i.impact === 'high').slice(0, 3)
    
    return `${story.title}: ${story.theme}. Key findings include ${topInsights.map(i => i.title.toLowerCase()).join(', ')}. ${story.narrative.callToAction}`
  }

  /**
   * Extract key narratives
   */
  private extractKeyNarratives(story: DataStory): string[] {
    return [
      story.narrative.opening,
      story.narrative.climax,
      story.narrative.callToAction
    ]
  }

  /**
   * Create storyboard outline
   */
  private createStoryboardOutline(story: DataStory): string[] {
    return story.visualFlow.map(visual => 
      `Slide ${visual.slideNumber}: ${visual.visualType} - ${visual.narrative}`
    )
  }

  /**
   * Calculate story complexity
   */
  private calculateStoryComplexity(story: DataStory): number {
    const factors = [
      story.structure.acts.setup.length,
      story.structure.acts.conflict.length,
      story.structure.acts.resolution.length,
      story.keyMessages.length,
      story.visualFlow.length
    ]
    
    return Math.min(100, factors.reduce((sum, factor) => sum + factor * 10, 0))
  }

  /**
   * Calculate engagement score
   */
  private calculateEngagementScore(story: DataStory): number {
    let score = 50 // Base score
    
    if (story.emotionalTone === 'dramatic' || story.emotionalTone === 'inspiring') score += 20
    if (story.structure.tension === 'high') score += 15
    if (story.visualFlow.filter(v => v.impact === 'dramatic').length > 2) score += 15
    
    return Math.min(100, score)
  }

  /**
   * Calculate narrative coherence
   */
  private calculateNarrativeCoherence(story: DataStory): number {
    // Simplified coherence calculation
    const hasCompleteActs = story.structure.acts.setup.length > 0 && 
                           story.structure.acts.conflict.length > 0 && 
                           story.structure.acts.resolution.length > 0
    
    const hasKeyElements = story.narrative.opening && 
                          story.narrative.climax && 
                          story.narrative.callToAction
    
    return (hasCompleteActs && hasKeyElements) ? 85 : 65
  }

  /**
   * Calculate visual alignment
   */
  private calculateVisualAlignment(story: DataStory, charts: ChartRecommendation[]): number {
    const alignmentScore = story.visualFlow.reduce((score, visual) => {
      const matchingChart = charts.find(c => c.chartType === visual.visualType)
      return score + (matchingChart ? 10 : 5)
    }, 0)
    
    return Math.min(100, alignmentScore)
  }
}