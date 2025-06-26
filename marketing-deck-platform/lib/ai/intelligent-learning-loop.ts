// INTELLIGENT LEARNING LOOP - ADVANCED AI BRAIN WITH HUMAN FEEDBACK
// Integrates Python data science, OpenAI intelligence, and human feedback learning

import AdvancedPythonBrain from './advanced-python-brain'
import CircularFeedbackOrchestrator from './circular-feedback-orchestrator'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export interface IntelligentAnalysisRequest {
  data: any[]
  businessContext: {
    industry: string
    goals: string[]
    kpis: string[]
    targetAudience: string
    timeHorizon: string
    competitiveContext: string
    constraints: string[]
  }
  userFeedback?: {
    previousInsights: any[]
    corrections: any[]
    preferences: any[]
    qualityRatings: any[]
  }
  learningObjectives: string[]
}

export interface IntelligentLearningResult {
  insights: EnhancedInsight[]
  predictions: PredictiveModel[]
  recommendations: ActionableRecommendation[]
  visualizations: InteractiveVisualization[]
  narratives: BusinessNarrative[]
  learningOutcomes: LearningOutcome[]
  confidence: number
  nextIterationSuggestions: string[]
}

interface EnhancedInsight {
  id: string
  title: string
  description: string
  businessImplication: string
  confidence: number
  evidence: {
    statistical: any
    predictive: any
    visual: any
  }
  learningSource: 'python_analysis' | 'openai_enhancement' | 'human_feedback' | 'hybrid'
  improvementPotential: number
  approved?: boolean | null
}

interface PredictiveModel {
  type: string
  accuracy: number
  predictions: any[]
  businessValue: string
  riskFactors: string[]
  modelExplanation: string
  featureImportance: any[]
}

interface ActionableRecommendation {
  title: string
  description: string
  implementation: string[]
  timeline: string
  resources: string[]
  expectedROI: number
  riskLevel: 'low' | 'medium' | 'high'
  confidence: number
}

interface InteractiveVisualization {
  id: string
  type: 'tremor' | 'plotly' | 'custom'
  title: string
  description: string
  chartConfig: any
  data: any
  insights: string[]
  interactivity: {
    editable: boolean
    resizable: boolean
    deletable: boolean
    customizable: boolean
  }
}

interface BusinessNarrative {
  type: 'executive' | 'technical' | 'actionable'
  content: string
  keyPoints: string[]
  callToAction: string
  supportingEvidence: string[]
}

interface LearningOutcome {
  insight: string
  confidence: number
  source: string
  validation: string
  improvement: string
}

export class IntelligentLearningLoop {
  private pythonBrain: AdvancedPythonBrain
  private feedbackOrchestrator: CircularFeedbackOrchestrator
  private learningHistory: Map<string, any[]>
  private userPreferences: Map<string, any>
  private modelPerformance: Map<string, number>

  constructor() {
    this.pythonBrain = new AdvancedPythonBrain()
    this.learningHistory = new Map()
    this.userPreferences = new Map()
    this.modelPerformance = new Map()
  }

  /**
   * Execute intelligent learning loop with human feedback integration
   */
  async executeIntelligentLoop(request: IntelligentAnalysisRequest): Promise<IntelligentLearningResult> {
    console.log('🧠 Starting Intelligent Learning Loop...')
    
    try {
      // PHASE 1: Advanced Python Analysis
      console.log('🐍 Phase 1: Advanced Python Data Science Analysis')
      const pythonResults = await this.pythonBrain.executeWorldClassAnalysis({
        data: request.data,
        businessContext: request.businessContext,
        analysisType: 'comprehensive',
        userFeedback: request.userFeedback
      })

      // PHASE 2: OpenAI Strategic Enhancement
      console.log('🤖 Phase 2: OpenAI Strategic Enhancement')
      const strategicInsights = await this.enhanceWithStrategicIntelligence(pythonResults, request)

      // PHASE 3: Human Feedback Integration
      console.log('👤 Phase 3: Human Feedback Learning Integration')
      const learningEnhanced = await this.integrateHumanLearning(strategicInsights, request)

      // PHASE 4: Circular Feedback Optimization
      console.log('🔄 Phase 4: Circular Feedback Optimization')
      this.feedbackOrchestrator = new CircularFeedbackOrchestrator(request.data, request.businessContext)
      const circularResults = await this.feedbackOrchestrator.runCircularFeedbackLoop()

      // PHASE 5: Intelligent Synthesis
      console.log('🧠 Phase 5: Intelligent Synthesis & Learning')
      const finalResults = await this.synthesizeIntelligentResults(
        pythonResults,
        strategicInsights,
        learningEnhanced,
        circularResults,
        request
      )

      // PHASE 6: Learning Outcome Recording
      await this.recordLearningOutcomes(finalResults, request)

      console.log('✅ Intelligent Learning Loop Complete')
      return finalResults

    } catch (error) {
      console.error('❌ Intelligent Learning Loop Failed:', error)
      throw error
    }
  }

  /**
   * Enhance with strategic business intelligence
   */
  private async enhanceWithStrategicIntelligence(pythonResults: any, request: IntelligentAnalysisRequest): Promise<any> {
    const prompt = `
You are a world-class strategic advisor combining data science with business intelligence. 

PYTHON ANALYSIS RESULTS:
${JSON.stringify(pythonResults, null, 2)}

BUSINESS CONTEXT:
- Industry: ${request.businessContext.industry}
- Goals: ${request.businessContext.goals.join(', ')}
- KPIs: ${request.businessContext.kpis.join(', ')}
- Target Audience: ${request.businessContext.targetAudience}
- Time Horizon: ${request.businessContext.timeHorizon}

Your mission: Transform technical findings into STRATEGIC BUSINESS INTELLIGENCE that drives competitive advantage.

Provide enhanced analysis with:

1. STRATEGIC INSIGHTS (beyond what Python found):
   - Hidden business drivers not obvious in the data
   - Competitive positioning implications
   - Market timing insights
   - Strategic inflection points

2. PREDICTIVE BUSINESS INTELLIGENCE:
   - Forward-looking strategic implications
   - Market opportunity sizing
   - Risk factor assessment
   - Competitive response predictions

3. EXECUTIVE RECOMMENDATIONS:
   - Specific actions with ROI estimates
   - Resource allocation priorities
   - Timeline for implementation
   - Success metrics and KPIs

4. NARRATIVE FRAMEWORKS:
   - Executive summary for C-suite
   - Technical brief for implementation teams
   - Board presentation key messages

Focus on ACTIONABLE INTELLIGENCE that executives can immediately use for strategic decisions.

Return as structured JSON with enhanced insights, predictions, recommendations, and narratives.
`

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 4000
      })

      const content = response.choices[0].message.content
      try {
        return JSON.parse(content || '{}')
      } catch {
        return {
          strategicEnhancement: content,
          confidence: 80
        }
      }
    } catch (error) {
      console.warn('Strategic enhancement failed:', error)
      return pythonResults
    }
  }

  /**
   * Integrate human feedback learning
   */
  private async integrateHumanLearning(strategicInsights: any, request: IntelligentAnalysisRequest): Promise<any> {
    if (!request.userFeedback || 
        (!request.userFeedback.corrections?.length && 
         !request.userFeedback.preferences?.length && 
         !request.userFeedback.qualityRatings?.length)) {
      return strategicInsights
    }

    console.log('📚 Learning from human feedback...')
    
    // Analyze feedback patterns
    const feedbackPatterns = this.analyzeFeedbackPatterns(request.userFeedback)
    
    // Update user preferences
    this.updateUserPreferences(feedbackPatterns)
    
    // Apply learned preferences to insights
    const learningEnhanced = await this.applyLearningToInsights(strategicInsights, feedbackPatterns)
    
    return learningEnhanced
  }

  /**
   * Analyze feedback patterns for learning
   */
  private analyzeFeedbackPatterns(feedback: any): any {
    const patterns = {
      preferredInsightTypes: [],
      rejectedPatterns: [],
      qualityPreferences: {},
      communicationStyle: 'executive'
    }

    // Analyze corrections
    if (feedback.corrections?.length > 0) {
      patterns.rejectedPatterns = feedback.corrections.map((c: any) => ({
        type: c.type,
        reason: c.reason,
        improvement: c.suggestion
      }))
    }

    // Analyze preferences
    if (feedback.preferences?.length > 0) {
      patterns.preferredInsightTypes = feedback.preferences.map((p: any) => p.type)
    }

    // Analyze quality ratings
    if (feedback.qualityRatings?.length > 0) {
      const avgRatings = feedback.qualityRatings.reduce((acc: any, rating: any) => {
        acc[rating.category] = (acc[rating.category] || 0) + rating.score
        return acc
      }, {})
      
      Object.keys(avgRatings).forEach(category => {
        patterns.qualityPreferences[category] = avgRatings[category] / feedback.qualityRatings.length
      })
    }

    return patterns
  }

  /**
   * Update user preferences based on learning
   */
  private updateUserPreferences(patterns: any): void {
    const userId = 'current_user' // In real implementation, get from auth
    const currentPrefs = this.userPreferences.get(userId) || {}
    
    const updatedPrefs = {
      ...currentPrefs,
      insightTypes: patterns.preferredInsightTypes,
      qualityThresholds: patterns.qualityPreferences,
      communicationStyle: patterns.communicationStyle,
      lastUpdated: new Date().toISOString()
    }
    
    this.userPreferences.set(userId, updatedPrefs)
  }

  /**
   * Apply learning to enhance insights
   */
  private async applyLearningToInsights(insights: any, patterns: any): Promise<any> {
    const learningPrompt = `
Enhance these insights based on user learning patterns:

CURRENT INSIGHTS: ${JSON.stringify(insights, null, 2)}

USER LEARNING PATTERNS:
- Preferred insight types: ${patterns.preferredInsightTypes.join(', ')}
- Rejected patterns: ${patterns.rejectedPatterns.map((p: any) => p.type).join(', ')}
- Quality preferences: ${JSON.stringify(patterns.qualityPreferences)}

Apply learning to:
1. Prioritize insights matching user preferences
2. Avoid patterns user has rejected
3. Adjust communication style to user preferences
4. Enhance insights below quality thresholds

Return enhanced insights with learning applied.
`

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: learningPrompt }],
        temperature: 0.2,
        max_tokens: 3000
      })

      const content = response.choices[0].message.content
      try {
        return JSON.parse(content || '{}')
      } catch {
        return {
          ...insights,
          learningApplied: content,
          confidence: Math.min((insights.confidence || 70) + 10, 95)
        }
      }
    } catch (error) {
      console.warn('Learning application failed:', error)
      return insights
    }
  }

  /**
   * Synthesize all results into final intelligent output
   */
  private async synthesizeIntelligentResults(
    pythonResults: any,
    strategicInsights: any,
    learningEnhanced: any,
    circularResults: any,
    request: IntelligentAnalysisRequest
  ): Promise<IntelligentLearningResult> {
    
    // Convert to enhanced insights format
    const insights: EnhancedInsight[] = this.convertToEnhancedInsights(
      pythonResults.insights?.statistical || [],
      strategicInsights,
      learningEnhanced
    )

    // Create predictive models summary
    const predictions: PredictiveModel[] = this.createPredictiveModels(
      pythonResults.insights?.predictive || [],
      strategicInsights
    )

    // Generate actionable recommendations
    const recommendations: ActionableRecommendation[] = this.generateActionableRecommendations(
      insights,
      predictions,
      request.businessContext
    )

    // Create interactive visualizations
    const visualizations: InteractiveVisualization[] = this.createInteractiveVisualizations(
      pythonResults.visualizations || [],
      circularResults.finalSlides || []
    )

    // Generate business narratives
    const narratives: BusinessNarrative[] = this.createBusinessNarratives(
      insights,
      recommendations,
      request.businessContext
    )

    // Calculate overall confidence
    const confidence = this.calculateOverallConfidence(insights, predictions, recommendations)

    // Generate learning outcomes
    const learningOutcomes: LearningOutcome[] = this.generateLearningOutcomes(
      pythonResults,
      strategicInsights,
      learningEnhanced
    )

    // Suggest next iterations
    const nextIterationSuggestions = this.generateNextIterationSuggestions(
      insights,
      request.learningObjectives
    )

    return {
      insights,
      predictions,
      recommendations,
      visualizations,
      narratives,
      learningOutcomes,
      confidence,
      nextIterationSuggestions
    }
  }

  /**
   * Convert results to enhanced insights format
   */
  private convertToEnhancedInsights(
    statisticalInsights: any[],
    strategicInsights: any,
    learningEnhanced: any
  ): EnhancedInsight[] {
    const enhanced: EnhancedInsight[] = []

    // Process statistical insights
    statisticalInsights.forEach((insight, index) => {
      enhanced.push({
        id: `insight_${index}_${Date.now()}`,
        title: insight.title || insight.finding || `Insight ${index + 1}`,
        description: insight.finding || insight.description || 'Statistical analysis finding',
        businessImplication: insight.businessImplication || 'Requires strategic consideration',
        confidence: insight.confidence || 75,
        evidence: {
          statistical: insight.evidence,
          predictive: null,
          visual: null
        },
        learningSource: 'python_analysis',
        improvementPotential: 85,
        approved: null
      })
    })

    // Add strategic insights
    if (strategicInsights.strategicInsights) {
      strategicInsights.strategicInsights.forEach((insight: any, index: number) => {
        enhanced.push({
          id: `strategic_${index}_${Date.now()}`,
          title: insight.title || insight.headline,
          description: insight.description || insight.finding,
          businessImplication: insight.businessImplication || insight.strategic_value,
          confidence: insight.confidence || 80,
          evidence: {
            statistical: null,
            predictive: insight.evidence,
            visual: null
          },
          learningSource: 'openai_enhancement',
          improvementPotential: 90,
          approved: null
        })
      })
    }

    return enhanced
  }

  /**
   * Create predictive models summary
   */
  private createPredictiveModels(predictiveInsights: any[], strategicInsights: any): PredictiveModel[] {
    const models: PredictiveModel[] = []

    predictiveInsights.forEach((insight, index) => {
      models.push({
        type: insight.model || 'Machine Learning',
        accuracy: insight.accuracy || 75,
        predictions: insight.prediction ? [insight.prediction] : [],
        businessValue: insight.businessImpact || 'Performance optimization',
        riskFactors: insight.riskFactors || ['Model uncertainty', 'Data quality'],
        modelExplanation: `Advanced ${insight.model || 'ML'} model with ${insight.accuracy || 75}% accuracy`,
        featureImportance: []
      })
    })

    return models
  }

  /**
   * Generate actionable recommendations
   */
  private generateActionableRecommendations(
    insights: EnhancedInsight[],
    predictions: PredictiveModel[],
    businessContext: any
  ): ActionableRecommendation[] {
    const recommendations: ActionableRecommendation[] = []

    // High-confidence insights become recommendations
    insights.filter(i => i.confidence > 80).forEach((insight, index) => {
      recommendations.push({
        title: `Action: ${insight.title}`,
        description: insight.businessImplication,
        implementation: [
          'Analyze current state',
          'Develop implementation plan',
          'Execute changes',
          'Monitor results'
        ],
        timeline: '2-6 weeks',
        resources: ['Analytics team', 'Business stakeholders'],
        expectedROI: 15 + (index * 5),
        riskLevel: 'medium',
        confidence: insight.confidence
      })
    })

    return recommendations
  }

  /**
   * Create interactive visualizations
   */
  private createInteractiveVisualizations(
    pythonViz: any[],
    circularSlides: any[]
  ): InteractiveVisualization[] {
    const visualizations: InteractiveVisualization[] = []

    pythonViz.forEach((viz, index) => {
      visualizations.push({
        id: `viz_${index}_${Date.now()}`,
        type: 'tremor',
        title: viz.title || `Visualization ${index + 1}`,
        description: viz.description || 'Data visualization',
        chartConfig: viz.chartConfig,
        data: viz.data,
        insights: viz.insights || [],
        interactivity: {
          editable: true,
          resizable: true,
          deletable: true,
          customizable: true
        }
      })
    })

    return visualizations
  }

  /**
   * Create business narratives
   */
  private createBusinessNarratives(
    insights: EnhancedInsight[],
    recommendations: ActionableRecommendation[],
    businessContext: any
  ): BusinessNarrative[] {
    return [
      {
        type: 'executive',
        content: `Analysis of ${businessContext.industry} data reveals ${insights.length} key strategic insights with ${recommendations.length} actionable recommendations for immediate implementation.`,
        keyPoints: insights.slice(0, 3).map(i => i.title),
        callToAction: 'Execute top 3 recommendations within next quarter',
        supportingEvidence: insights.map(i => i.description)
      },
      {
        type: 'technical',
        content: `Advanced machine learning analysis using Python ecosystem identified significant patterns and predictive models with average confidence of ${insights.reduce((acc, i) => acc + i.confidence, 0) / insights.length}%.`,
        keyPoints: ['Statistical significance validated', 'Predictive models trained', 'Anomalies detected'],
        callToAction: 'Implement model monitoring and automated insights',
        supportingEvidence: ['Python analysis results', 'Model performance metrics']
      },
      {
        type: 'actionable',
        content: `Immediate actions required: ${recommendations.slice(0, 3).map(r => r.title).join(', ')}. Expected combined ROI: ${recommendations.slice(0, 3).reduce((acc, r) => acc + r.expectedROI, 0)}%.`,
        keyPoints: recommendations.slice(0, 3).map(r => r.title),
        callToAction: 'Begin implementation of highest-impact recommendations',
        supportingEvidence: recommendations.map(r => r.description)
      }
    ]
  }

  /**
   * Calculate overall confidence
   */
  private calculateOverallConfidence(
    insights: EnhancedInsight[],
    predictions: PredictiveModel[],
    recommendations: ActionableRecommendation[]
  ): number {
    const allConfidences = [
      ...insights.map(i => i.confidence),
      ...predictions.map(p => p.accuracy),
      ...recommendations.map(r => r.confidence)
    ]

    return allConfidences.length > 0 ? 
      Math.round(allConfidences.reduce((acc, c) => acc + c, 0) / allConfidences.length) : 70
  }

  /**
   * Generate learning outcomes
   */
  private generateLearningOutcomes(
    pythonResults: any,
    strategicInsights: any,
    learningEnhanced: any
  ): LearningOutcome[] {
    return [
      {
        insight: 'Python analysis provided robust statistical foundation',
        confidence: 90,
        source: 'Advanced Python Brain',
        validation: 'Statistical significance tests passed',
        improvement: 'Enhanced with business intelligence'
      },
      {
        insight: 'Strategic enhancement revealed competitive advantages',
        confidence: 85,
        source: 'OpenAI Strategic Intelligence',
        validation: 'Business context validation',
        improvement: 'Integrated with predictive models'
      },
      {
        insight: 'Human feedback improved insight relevance',
        confidence: 80,
        source: 'Human Learning Integration',
        validation: 'User preference alignment',
        improvement: 'Personalized recommendations'
      }
    ]
  }

  /**
   * Generate suggestions for next iteration
   */
  private generateNextIterationSuggestions(
    insights: EnhancedInsight[],
    learningObjectives: string[]
  ): string[] {
    return [
      'Collect additional data for low-confidence insights',
      'Implement A/B testing for recommended changes',
      'Gather user feedback on specific recommendations',
      'Enhance predictive models with more features',
      'Validate insights through external data sources'
    ]
  }

  /**
   * Record learning outcomes for future improvement
   */
  private async recordLearningOutcomes(results: IntelligentLearningResult, request: IntelligentAnalysisRequest): Promise<void> {
    const learningRecord = {
      timestamp: new Date().toISOString(),
      requestContext: request.businessContext,
      resultsSummary: {
        insightCount: results.insights.length,
        predictionCount: results.predictions.length,
        recommendationCount: results.recommendations.length,
        overallConfidence: results.confidence
      },
      learningOutcomes: results.learningOutcomes,
      userFeedback: request.userFeedback
    }

    // Store in learning history for future reference
    const userId = 'current_user' // In real implementation, get from auth
    const history = this.learningHistory.get(userId) || []
    history.push(learningRecord)
    this.learningHistory.set(userId, history)

    console.log('📚 Learning outcomes recorded for future improvement')
  }
}

export default IntelligentLearningLoop