// Enhanced AI Brain with Recursive Analysis and User Interaction
import { DataPoint, DeckInsight, ProgressCallback } from './deck-brain'

export interface UserContext {
  businessGoals: string
  targetAudience: string
  keyQuestions: string[]
  constraints: string[]
  preferences: {
    chartStyle: 'minimal' | 'detailed' | 'interactive'
    narrativeStyle: 'executive' | 'analytical' | 'storytelling'
    focusAreas: string[]
  }
}

export interface AnalysisPhase {
  phase: 'initial_scan' | 'deep_dive' | 'pattern_discovery' | 'insight_generation' | 'narrative_crafting' | 'validation' | 'refinement'
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  insights: any[]
  userFeedback?: string
  requiresUserInput: boolean
  userPrompt?: string
}

export interface EnhancedInsight {
  id: string
  type: 'trend' | 'anomaly' | 'correlation' | 'causation' | 'opportunity' | 'risk' | 'novel'
  title: string
  description: string
  confidence: number
  novelty: number // 0-100, how novel this insight is
  impact: 'high' | 'medium' | 'low'
  dataEvidence: any[]
  drivers: string[]
  headwinds: string[]
  tailwinds: string[]
  why: string // The WHY behind the insight
  recommendations: string[]
  visualizationType: 'line' | 'bar' | 'area' | 'scatter' | 'heatmap' | 'composite'
  chartConfig: {
    data: any[]
    dimensions: string[]
    metrics: string[]
    filters: any[]
    annotations: any[]
  }
}

export interface NarrativeArc {
  hook: string
  context: string
  risingAction: EnhancedInsight[]
  climax: EnhancedInsight
  fallingAction: EnhancedInsight[]
  resolution: string
  callToAction: string
}

export class EnhancedBrain {
  private analysisPhases: AnalysisPhase[] = []
  private userContext: UserContext
  private data: any[]
  private insights: EnhancedInsight[] = []
  private narrativeArc: NarrativeArc | null = null
  private iterationCount = 0
  private maxIterations = 5

  constructor(data: any[], userContext: UserContext) {
    this.data = data
    this.userContext = userContext
    this.initializePhases()
  }

  private initializePhases() {
    this.analysisPhases = [
      {
        phase: 'initial_scan',
        status: 'pending',
        insights: [],
        requiresUserInput: false
      },
      {
        phase: 'deep_dive',
        status: 'pending',
        insights: [],
        requiresUserInput: true,
        userPrompt: 'What specific aspects of the data are most important to you?'
      },
      {
        phase: 'pattern_discovery',
        status: 'pending',
        insights: [],
        requiresUserInput: false
      },
      {
        phase: 'insight_generation',
        status: 'pending',
        insights: [],
        requiresUserInput: true,
        userPrompt: 'Which of these initial insights resonate most with your business goals?'
      },
      {
        phase: 'narrative_crafting',
        status: 'pending',
        insights: [],
        requiresUserInput: true,
        userPrompt: 'How would you like to frame this story for your audience?'
      },
      {
        phase: 'validation',
        status: 'pending',
        insights: [],
        requiresUserInput: false
      },
      {
        phase: 'refinement',
        status: 'pending',
        insights: [],
        requiresUserInput: true,
        userPrompt: 'What aspects would you like to refine or explore further?'
      }
    ]
  }

  async startAnalysis(progressCallback: ProgressCallback): Promise<{
    insights: EnhancedInsight[]
    narrativeArc: NarrativeArc
    phases: AnalysisPhase[]
  }> {
    progressCallback(0, '🧠 Enhanced Brain initializing recursive analysis...')
    
    for (let i = 0; i < this.analysisPhases.length; i++) {
      const phase = this.analysisPhases[i]
      phase.status = 'in_progress'
      
      progressCallback(
        (i / this.analysisPhases.length) * 80,
        `🔍 Brain in ${phase.phase.replace('_', ' ')} phase...`
      )

      try {
        await this.executePhase(phase, progressCallback)
        phase.status = 'completed'
      } catch (error) {
        console.error(`Phase ${phase.phase} failed:`, error)
        phase.status = 'failed'
      }
    }

    // Final recursive refinement
    await this.recursiveRefinement(progressCallback)
    
    progressCallback(100, '✅ Enhanced analysis complete!')
    
    return {
      insights: this.insights,
      narrativeArc: this.narrativeArc!,
      phases: this.analysisPhases
    }
  }

  private async executePhase(phase: AnalysisPhase, progressCallback: ProgressCallback) {
    switch (phase.phase) {
      case 'initial_scan':
        await this.initialDataScan(progressCallback)
        break
      case 'deep_dive':
        await this.deepDataDive(progressCallback)
        break
      case 'pattern_discovery':
        await this.discoverPatterns(progressCallback)
        break
      case 'insight_generation':
        await this.generateInsights(progressCallback)
        break
      case 'narrative_crafting':
        await this.craftNarrative(progressCallback)
        break
      case 'validation':
        await this.validateInsights(progressCallback)
        break
      case 'refinement':
        await this.refineAnalysis(progressCallback)
        break
    }
  }

  private async initialDataScan(progressCallback: ProgressCallback) {
    const response = await fetch('/api/openai/enhanced-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phase: 'initial_scan',
        data: this.data.slice(0, 20), // Sample for initial scan
        userContext: this.userContext,
        iteration: this.iterationCount
      })
    })

    const result = await response.json()
    if (result.success) {
      this.analysisPhases[0].insights = result.insights || []
      progressCallback(10, '📊 Initial data patterns identified')
    }
  }

  private async deepDataDive(progressCallback: ProgressCallback) {
    const response = await fetch('/api/openai/enhanced-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phase: 'deep_dive',
        data: this.data,
        userContext: this.userContext,
        previousInsights: this.analysisPhases[0].insights,
        iteration: this.iterationCount
      })
    })

    const result = await response.json()
    if (result.success) {
      this.analysisPhases[1].insights = result.insights || []
      progressCallback(25, '🔬 Deep analysis revealing hidden patterns')
    }
  }

  private async discoverPatterns(progressCallback: ProgressCallback) {
    const response = await fetch('/api/openai/enhanced-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phase: 'pattern_discovery',
        data: this.data,
        userContext: this.userContext,
        previousInsights: [
          ...this.analysisPhases[0].insights,
          ...this.analysisPhases[1].insights
        ],
        iteration: this.iterationCount
      })
    })

    const result = await response.json()
    if (result.success) {
      this.analysisPhases[2].insights = result.insights || []
      progressCallback(40, '🎯 Novel patterns and correlations discovered')
    }
  }

  private async generateInsights(progressCallback: ProgressCallback) {
    const response = await fetch('/api/openai/enhanced-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phase: 'insight_generation',
        data: this.data,
        userContext: this.userContext,
        allPreviousInsights: this.analysisPhases.slice(0, 3).flatMap(p => p.insights),
        iteration: this.iterationCount
      })
    })

    const result = await response.json()
    if (result.success) {
      this.insights = result.insights || []
      this.analysisPhases[3].insights = this.insights
      progressCallback(55, '💡 Generating actionable insights with drivers analysis')
    }
  }

  private async craftNarrative(progressCallback: ProgressCallback) {
    const response = await fetch('/api/openai/enhanced-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phase: 'narrative_crafting',
        insights: this.insights,
        userContext: this.userContext,
        data: this.data,
        iteration: this.iterationCount
      })
    })

    const result = await response.json()
    if (result.success) {
      this.narrativeArc = result.narrativeArc
      this.analysisPhases[4].insights = [this.narrativeArc]
      progressCallback(70, '📖 Crafting compelling narrative with data story')
    }
  }

  private async validateInsights(progressCallback: ProgressCallback) {
    const response = await fetch('/api/openai/enhanced-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phase: 'validation',
        insights: this.insights,
        narrativeArc: this.narrativeArc,
        data: this.data,
        userContext: this.userContext,
        iteration: this.iterationCount
      })
    })

    const result = await response.json()
    if (result.success) {
      this.insights = result.validatedInsights || this.insights
      this.analysisPhases[5].insights = result.validationResults || []
      progressCallback(85, '✅ Validating insights and narrative coherence')
    }
  }

  private async refineAnalysis(progressCallback: ProgressCallback) {
    const response = await fetch('/api/openai/enhanced-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phase: 'refinement',
        insights: this.insights,
        narrativeArc: this.narrativeArc,
        data: this.data,
        userContext: this.userContext,
        iteration: this.iterationCount
      })
    })

    const result = await response.json()
    if (result.success) {
      this.insights = result.refinedInsights || this.insights
      this.narrativeArc = result.refinedNarrative || this.narrativeArc
      this.analysisPhases[6].insights = result.refinements || []
      progressCallback(90, '🎨 Refining analysis for maximum impact')
    }
  }

  private async recursiveRefinement(progressCallback: ProgressCallback) {
    this.iterationCount++
    
    if (this.iterationCount >= this.maxIterations) {
      progressCallback(95, '🏁 Maximum refinement iterations reached')
      return
    }

    // Check if we need another iteration based on insight quality
    const averageNovelty = this.insights.reduce((sum, insight) => sum + insight.novelty, 0) / this.insights.length
    const averageConfidence = this.insights.reduce((sum, insight) => sum + insight.confidence, 0) / this.insights.length

    if (averageNovelty < 70 || averageConfidence < 80) {
      progressCallback(92, `🔄 Recursive refinement iteration ${this.iterationCount}...`)
      
      // Re-run insight generation with higher standards
      await this.generateInsights(progressCallback)
      await this.craftNarrative(progressCallback)
      
      // Continue recursion
      await this.recursiveRefinement(progressCallback)
    }
  }

  // User interaction methods
  async provideUserFeedback(phaseIndex: number, feedback: string): Promise<void> {
    if (phaseIndex < this.analysisPhases.length) {
      this.analysisPhases[phaseIndex].userFeedback = feedback
      
      // Re-run the phase with user feedback
      const phase = this.analysisPhases[phaseIndex]
      phase.status = 'in_progress'
      
      await this.executePhase(phase, () => {})
      phase.status = 'completed'
    }
  }

  async addUserContext(additionalContext: string): Promise<void> {
    this.userContext.businessGoals += `\n\nAdditional context: ${additionalContext}`
    
    // Re-run relevant phases with new context
    for (let i = 1; i < this.analysisPhases.length; i++) {
      this.analysisPhases[i].status = 'pending'
    }
  }

  getCurrentPhase(): AnalysisPhase | null {
    return this.analysisPhases.find(p => p.status === 'in_progress') || null
  }

  getInsightsByType(type: string): EnhancedInsight[] {
    return this.insights.filter(insight => insight.type === type)
  }

  getNovelInsights(): EnhancedInsight[] {
    return this.insights.filter(insight => insight.novelty > 70)
  }

  getHighImpactInsights(): EnhancedInsight[] {
    return this.insights.filter(insight => insight.impact === 'high')
  }
} 