// Universal Brain - Uses the AI Brain Controller for provider flexibility
// Replaces all existing brain implementations with a unified interface

import { AIBrainController, AIRequest, AIResponse } from './brain-controller'
import { BrainConfigManager } from './brain-config'
import { IntelligentDataSampler } from '@/lib/data/intelligent-data-sampler'
import { DeepInsightEngine } from './deep-insight-engine'

export interface UniversalBrainRequest {
  data: any[]
  context: {
    industry?: string
    businessContext?: string
    targetAudience?: string
    description?: string
    factors?: string[]
  }
  timeFrame?: {
    start?: string
    end?: string
    dataFrequency?: string
    analysisType?: string
    comparisons?: string[]
  }
  requirements?: {
    slidesCount?: number
    presentationDuration?: number
    focusAreas?: string[]
    style?: string
    includeCharts?: boolean
  }
  userFeedback?: string[]
  userId?: string
  preferredProvider?: string
}

export interface UniversalBrainResponse {
  insights: any[]
  narrative: any
  slideStructure: any[]
  metadata: {
    analysisDepth: string
    confidence: number
    noveltyScore: number
    businessImpact: string
    dataQuality: string
    provider: string
    model: string
    tokenUsage?: {
      input: number
      output: number
      total: number
    }
    processingTime: number
    dataSampling?: any
    deepInsights?: any
  }
}

export class UniversalBrain {
  private brainController!: AIBrainController
  private configManager: BrainConfigManager
  private deepInsightEngine: DeepInsightEngine | null = null

  constructor() {
    this.configManager = BrainConfigManager.getInstance()
    // Brain controller will be initialized per request with user config
  }

  async analyzeData(request: UniversalBrainRequest): Promise<UniversalBrainResponse> {
    const startTime = Date.now()
    
    console.log('🧠 Universal Brain - Starting analysis with provider flexibility...')
    
    // Get user-specific brain configuration
    const brainConfig = await this.configManager.getBrainConfig(request.userId)
    this.brainController = new AIBrainController(brainConfig)
    
    // Determine which provider to use
    const providerId = request.preferredProvider || brainConfig.defaultProvider
    console.log(`🧠 Using AI provider: ${providerId}`)
    
    // Initialize deep insight engine if needed
    if (brainConfig.userApiKeys.openai || process.env.OPENAI_API_KEY) {
      this.deepInsightEngine = new DeepInsightEngine(
        brainConfig.userApiKeys.openai || process.env.OPENAI_API_KEY!
      )
    }

    try {
      // Step 1: Apply intelligent data sampling
      console.log('🧠 Step 1: Intelligent data sampling...')
      const sizeAnalysis = IntelligentDataSampler.analyzeDatasetSize(request.data)
      let samplingResult = null
      let processedData = request.data

      if (sizeAnalysis.requiresSampling) {
        samplingResult = await IntelligentDataSampler.performIntelligentSampling(
          request.data, 
          sizeAnalysis.recommendedStrategy
        )
        processedData = samplingResult.sampledData
        console.log(`🧠 Data sampled: ${samplingResult.originalRowCount} → ${samplingResult.sampledRowCount} rows`)
      }

      // Step 2: Main AI analysis
      console.log('🧠 Step 2: Primary AI analysis...')
      const analysisResult = await this.performMainAnalysis(
        processedData, 
        request, 
        providerId
      )

      // Step 3: Deep insight analysis (if available)
      console.log('🧠 Step 3: Deep insight analysis...')
      let deepInsightResult = null
      if (this.deepInsightEngine) {
        try {
          const businessObjectives = request.requirements?.focusAreas || ['Business Performance Analysis']
          deepInsightResult = await this.deepInsightEngine.analyzeForDeepInsights(
            processedData,
            request.context,
            businessObjectives
          )
          console.log(`🧠 Deep insights: ${deepInsightResult.deepInsights.length} non-obvious patterns found`)
          
          // Add deep insight slides
          const deepInsightSlides = await this.deepInsightEngine.generateDeepInsightSlides(deepInsightResult)
          analysisResult.slideStructure.push(...deepInsightSlides)
        } catch (deepError) {
          console.warn('Deep insight analysis failed (non-fatal):', deepError)
        }
      }

      // Step 4: Compile final response
      const processingTime = Date.now() - startTime
      
      return {
        insights: analysisResult.insights || [],
        narrative: analysisResult.narrative || {},
        slideStructure: analysisResult.slideStructure || [],
        metadata: {
          analysisDepth: 'comprehensive',
          confidence: analysisResult.confidence || 0.85,
          noveltyScore: analysisResult.noveltyScore || 70,
          businessImpact: 'high',
          dataQuality: samplingResult?.dataQuality || 'excellent',
          provider: providerId,
          model: analysisResult.model || 'unknown',
          tokenUsage: analysisResult.tokenUsage,
          processingTime,
          dataSampling: samplingResult ? {
            originalRows: samplingResult.originalRowCount,
            sampledRows: samplingResult.sampledRowCount,
            compressionRatio: samplingResult.compressionRatio,
            samplingMethod: samplingResult.samplingMethod,
            dataQuality: samplingResult.dataQuality,
            confidence: samplingResult.confidence,
            userMessage: samplingResult.userMessage,
            preservedFeatures: samplingResult.preservedFeatures
          } : null,
          deepInsights: deepInsightResult ? {
            deepInsightsCount: deepInsightResult.deepInsights.length,
            hiddenDriversCount: deepInsightResult.hiddenDrivers.primary.length,
            nonObviousCorrelations: deepInsightResult.nonObviousCorrelations.length,
            emergingTrends: deepInsightResult.emergingTrends.length,
            anomaliesDetected: deepInsightResult.anomalyDetection.length,
            confidence: deepInsightResult.confidence,
            dataComplexity: deepInsightResult.dataComplexity
          } : null
        }
      }

    } catch (error) {
      console.error('🧠 Universal Brain analysis failed:', error)
      throw new Error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async performMainAnalysis(
    data: any[], 
    request: UniversalBrainRequest, 
    providerId: string
  ): Promise<any> {
    // Build comprehensive analysis prompt
    const prompt = this.buildAnalysisPrompt(data, request)
    
    // Create AI request
    const aiRequest: AIRequest = {
      messages: [
        {
          role: 'system',
          content: this.getSystemPrompt()
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      maxTokens: 4000,
      jsonMode: true
    }

    try {
      // Send request through brain controller
      const response: AIResponse = await this.brainController.sendRequest(aiRequest, providerId)
      
      // Parse and validate response
      const analysisResult = JSON.parse(response.content)
      
      return {
        ...analysisResult,
        model: response.model,
        tokenUsage: response.usage,
        confidence: analysisResult.confidence || 0.85,
        noveltyScore: analysisResult.noveltyScore || 70
      }

    } catch (error) {
      console.error(`Analysis with ${providerId} failed:`, error)
      throw error
    }
  }

  private getSystemPrompt(): string {
    return `You are an elite business intelligence analyst and data scientist specializing in creating executive-level presentations. Your expertise includes:

CORE CAPABILITIES:
1. Advanced statistical analysis and pattern recognition
2. Business intelligence and strategic insight generation
3. Executive communication and narrative development
4. Professional slide design and information architecture
5. Data visualization and chart selection
6. Trend analysis and predictive insights

ANALYSIS STANDARDS:
- Focus on actionable business insights with strategic value
- Identify both obvious and non-obvious patterns in data
- Provide confidence levels and statistical significance
- Create compelling narratives that drive decision-making
- Design slides optimized for executive consumption
- Include specific recommendations with implementation guidance

OUTPUT REQUIREMENTS:
- Generate insights with business impact assessment
- Create slide structures with clear value propositions
- Provide chart recommendations optimized for the audience
- Include executive summary and key takeaways
- Focus on insights that drive competitive advantage
- Maintain professional tone suitable for C-level presentations

QUALITY STANDARDS:
- High confidence levels (80%+) for key insights
- Clear attribution of data sources and methodology
- Balanced perspective including risks and opportunities
- Actionable recommendations with timeline guidance
- Professional formatting suitable for board presentations`
  }

  private buildAnalysisPrompt(data: any[], request: UniversalBrainRequest): string {
    const dataAnalysis = this.analyzeDataStructure(data)
    
    return `Perform comprehensive business intelligence analysis on this dataset to create an executive-level presentation.

DATASET OVERVIEW:
- Total rows: ${data.length}
- Columns: ${dataAnalysis.columns.join(', ')}
- Numeric fields: ${dataAnalysis.numericColumns.join(', ')}
- Date fields: ${dataAnalysis.dateColumns.join(', ')}
- Data quality: ${dataAnalysis.quality}

BUSINESS CONTEXT:
- Industry: ${request.context.industry || 'General Business'}
- Business context: ${request.context.businessContext || 'Performance Analysis'}
- Target audience: ${request.context.targetAudience || 'Executives'}
- Key factors: ${(request.context.factors || []).join(', ')}

ANALYSIS REQUIREMENTS:
- Slides needed: ${request.requirements?.slidesCount || 10}
- Presentation duration: ${request.requirements?.presentationDuration || 15} minutes
- Focus areas: ${(request.requirements?.focusAreas || ['Key Insights']).join(', ')}
- Style: ${request.requirements?.style || 'Professional'}

TIME FRAME ANALYSIS:
- Period: ${request.timeFrame?.start || 'Not specified'} to ${request.timeFrame?.end || 'Not specified'}
- Data frequency: ${request.timeFrame?.dataFrequency || 'Unknown'}
- Analysis type: ${request.timeFrame?.analysisType || 'Trend analysis'}
- Comparisons: ${(request.timeFrame?.comparisons || []).join(', ')}

SAMPLE DATA (First 3 rows):
${JSON.stringify(data.slice(0, 3), null, 2)}

STATISTICAL SUMMARY:
${this.generateStatisticalSummary(data, dataAnalysis.numericColumns)}

Please generate a comprehensive analysis with the following JSON structure:
{
  "insights": [
    {
      "id": "unique_id",
      "type": "trend|pattern|anomaly|correlation|prediction",
      "title": "Insight title",
      "description": "Detailed explanation",
      "confidence": 0.85,
      "businessImpact": "high|medium|low",
      "dataPoints": ["supporting evidence"],
      "visualization": {
        "type": "chart_type",
        "config": {},
        "recommended": true
      },
      "actionableInsights": ["specific recommendations"],
      "strategicImplications": ["business strategy impacts"]
    }
  ],
  "narrative": {
    "executiveSummary": "Key findings for executives",
    "mainStory": "Primary narrative thread",
    "keyMessages": ["message 1", "message 2"],
    "callToAction": "Recommended next steps"
  },
  "slideStructure": [
    {
      "id": "slide_id",
      "number": 1,
      "type": "title|content|chart|summary",
      "title": "Slide title",
      "content": {
        "summary": "Main content",
        "bulletPoints": ["point 1", "point 2"],
        "dataStory": "Data narrative"
      },
      "charts": [
        {
          "type": "bar|line|area|donut|scatter",
          "title": "Chart title",
          "data": [],
          "config": {
            "xAxisKey": "column_name",
            "yAxisKey": "value_column",
            "colors": ["#3b82f6", "#10b981"]
          },
          "insights": ["chart insight"],
          "source": "Data analysis"
        }
      ]
    }
  ],
  "confidence": 0.85,
  "noveltyScore": 75
}`
  }

  private analyzeDataStructure(data: any[]): {
    columns: string[]
    numericColumns: string[]
    dateColumns: string[]
    quality: string
  } {
    if (data.length === 0) {
      return { columns: [], numericColumns: [], dateColumns: [], quality: 'no_data' }
    }

    const firstRow = data[0]
    const columns = Object.keys(firstRow)
    
    const numericColumns = columns.filter(col => {
      const value = firstRow[col]
      return typeof value === 'number' || 
             (typeof value === 'string' && !isNaN(parseFloat(value)))
    })
    
    const dateColumns = columns.filter(col => {
      const value = firstRow[col]
      return value && !isNaN(Date.parse(value.toString()))
    })

    // Assess data quality
    const completeness = this.calculateCompleteness(data)
    let quality = 'excellent'
    if (completeness < 0.95) quality = 'good'
    if (completeness < 0.85) quality = 'fair'
    if (completeness < 0.70) quality = 'poor'

    return { columns, numericColumns, dateColumns, quality }
  }

  private generateStatisticalSummary(data: any[], numericColumns: string[]): string {
    if (numericColumns.length === 0) return 'No numeric columns for statistical analysis'

    const summary: string[] = []
    
    numericColumns.slice(0, 5).forEach(col => {
      const values = data
        .map(row => parseFloat(row[col]))
        .filter(val => !isNaN(val))
      
      if (values.length > 0) {
        const avg = values.reduce((a, b) => a + b, 0) / values.length
        const min = Math.min(...values)
        const max = Math.max(...values)
        const variance = values.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / values.length
        const stdDev = Math.sqrt(variance)
        
        summary.push(`${col}: avg=${avg.toFixed(2)}, range=${min}-${max}, std=${stdDev.toFixed(2)}`)
      }
    })
    
    return summary.join('\n')
  }

  private calculateCompleteness(data: any[]): number {
    if (data.length === 0) return 0

    const totalCells = data.length * Object.keys(data[0]).length
    const completeCells = data.reduce((count, row) => {
      return count + Object.values(row).filter(val => 
        val !== null && val !== undefined && val !== ''
      ).length
    }, 0)

    return completeCells / totalCells
  }

  // Public methods for configuration management
  async updateUserConfig(userId: string, config: any): Promise<void> {
    await this.configManager.saveUserPreferences({
      userId,
      defaultProvider: config.defaultProvider,
      customApiKeys: config.customApiKeys || {},
      customEndpoints: config.customEndpoints || {},
      modelPreferences: config.modelPreferences || {},
      privacySettings: config.privacySettings || {
        allowDataLogging: true,
        preferLocalModels: false,
        requireOnPremise: false
      }
    })
  }

  async getAvailableProviders(userId?: string): Promise<any[]> {
    const config = await this.configManager.getBrainConfig(userId)
    const controller = new AIBrainController(config)
    return controller.getAvailableProviders()
  }

  async checkProviderHealth(userId?: string): Promise<Record<string, boolean>> {
    return this.configManager.checkProviderHealth(userId)
  }

  async estimateUsageCost(
    userId: string, 
    requestsPerDay: number, 
    avgTokensPerRequest: number
  ): Promise<Record<string, number>> {
    return this.configManager.estimateUsageCost(userId, requestsPerDay, avgTokensPerRequest)
  }
}