import OpenAI from 'openai'
import { AdvancedAnalyticsEngine, StatisticalAnalysis, BusinessIntelligence } from './advanced-analytics-engine'
import { ParsedDataset } from '@/lib/data/file-parser'

export interface DataInsight {
  id: string
  type: 'trend' | 'pattern' | 'anomaly' | 'correlation' | 'prediction' | 'novel'
  title: string
  description: string
  confidence: number
  impact: 'high' | 'medium' | 'low'
  dataPoints: string[]
  visualization: {
    type: string
    config: any
    recommended: boolean
  }
  businessImplication: string
  actionableInsights: string[]
  supportingEvidence: string[]
  noveltyScore: number // 0-100, how novel/unique this insight is
}

export interface NarrativeArc {
  id: string
  title: string
  theme: string
  structure: {
    introduction: string
    risingAction: string[]
    climax: string
    fallingAction: string[]
    conclusion: string
  }
  keyMessages: string[]
  emotionalJourney: string[]
  callToAction: string
  audienceEngagement: string[]
}

export interface TimeFrameAnalysis {
  primaryPeriod: {
    start: string
    end: string
    label: string
  }
  comparisonPeriod?: {
    start: string
    end: string
    label: string
    type: 'quarter' | 'year' | 'month' | 'week' | 'custom'
  }
  analysisType: 'q/q' | 'y/y' | 'm/m' | 'w/w' | 'custom'
  includeTrends: boolean
  includeSeasonality: boolean
  includeOutliers: boolean
}

export interface DataContext {
  description: string
  factors: string[]
  industry: string
  businessContext: string
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor'
  dataSource: string
  collectionMethod: string
  lastUpdated: string
  confidence: number
}

export interface PresentationRequirements {
  slideCount: number
  targetDuration: number
  structure: 'ai_suggested' | 'user_defined' | 'template_based'
  keyPoints: string[]
  slideDescriptions: Array<{
    slideNumber: number
    description: string
    type: 'title' | 'content' | 'chart' | 'summary' | 'custom'
  }>
  audienceType: 'executive' | 'investor' | 'stakeholder' | 'team' | 'client' | 'custom'
  presentationStyle: 'formal' | 'casual' | 'technical' | 'storytelling' | 'persuasive'
  includeAppendix: boolean
  includeSources: boolean
}

export interface BrainAnalysisResult {
  insights: DataInsight[]
  narrative: NarrativeArc
  slideStructure: Array<{
    id: string
    number: number
    type: string
    title: string
    content: string
    charts: Array<{
      type: string
      data: any
      config: any
      insights: string[]
    }>
    keyTakeaways: string[]
  }>
  recommendations: {
    visualizations: string[]
    messaging: string[]
    structure: string[]
    audience: string[]
  }
  statisticalAnalysis?: StatisticalAnalysis[]
  businessIntelligence?: BusinessIntelligence
  metadata: {
    analysisDepth: number
    confidence: number
    noveltyScore: number
    businessImpact: number
    dataQuality: number
  }
}

export class EnhancedBrainV2 {
  private openai: OpenAI
  private maxIterations: number = 5
  private analysisDepth: number = 0

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey })
  }

  // Helper method to intelligently chunk data for OpenAI analysis
  private prepareDataForAnalysis(data: any, maxTokens: number = 25000): string {
    try {
      if (!data) return 'No data provided'
      
      // If it's a ParsedDataset, create intelligent summary
      if (this.isParsedDataset(data)) {
        const totalRows = data.rows.length
        const sampleSize = Math.min(totalRows, 50) // Sample up to 50 rows for analysis
        
        // Take a representative sample: first 25, middle 15, last 10
        const firstPart = data.rows.slice(0, 25)
        const middleStart = Math.floor(totalRows / 2) - 7
        const middlePart = totalRows > 50 ? data.rows.slice(middleStart, middleStart + 15) : []
        const lastPart = totalRows > 40 ? data.rows.slice(-10) : []
        
        const representativeSample = [...firstPart, ...middlePart, ...lastPart]
        
        return JSON.stringify({
          datasetInfo: {
            totalRows: totalRows,
            totalColumns: data.columns.length,
            samplingStrategy: `Representative sample of ${representativeSample.length} rows from ${totalRows} total records`,
            dataQuality: data.insights.dataQuality,
            completeness: data.insights.completeness
          },
          columnAnalysis: data.columns.map(col => ({
            name: col.name,
            type: col.type,
            uniqueCount: col.uniqueCount,
            nullCount: col.nullCount,
            samples: col.samples.slice(0, 3)
          })),
          statisticalSummary: data.summary,
          insights: data.insights,
          representativeData: representativeSample,
          dataPatterns: {
            numericColumns: data.summary.numericColumns,
            dateColumns: data.summary.dateColumns,
            categoryColumns: data.summary.categoryColumns,
            keyColumns: data.summary.keyColumns
          }
        }, null, 2)
      }
      
      // If it's an array, take representative sample
      if (Array.isArray(data)) {
        const totalRecords = data.length
        const sampleSize = Math.min(totalRecords, 50)
        
        let sample: any[]
        if (totalRecords <= 50) {
          sample = data
        } else {
          // Representative sampling: first 25, middle 15, last 10
          const firstPart = data.slice(0, 25)
          const middleStart = Math.floor(totalRecords / 2) - 7
          const middlePart = data.slice(middleStart, middleStart + 15)
          const lastPart = data.slice(-10)
          sample = [...firstPart, ...middlePart, ...lastPart]
        }
        
        return JSON.stringify({
          datasetInfo: {
            totalRecords: totalRecords,
            sampleSize: sample.length,
            samplingStrategy: totalRecords > 50 ? "Representative sample from beginning, middle, and end" : "Complete dataset",
            columns: data.length > 0 ? Object.keys(data[0]) : []
          },
          representativeData: sample
        }, null, 2)
      }
      
      // For other data types, try to limit size intelligently
      const stringified = JSON.stringify(data, null, 2)
      if (stringified.length > maxTokens * 3) { // Rough estimate: 1 token ≈ 3 characters
        return stringified.substring(0, maxTokens * 3) + '\n... (truncated for token limits)'
      }
      
      return stringified
    } catch (error) {
      return `Error processing data: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }

  // Helper method to parse JSON responses with markdown fallback
  private parseJsonResponse(content: string, fallback: any = {}): any {
    try {
      // First try direct JSON parse
      return JSON.parse(content)
    } catch (error) {
      console.log('🧠 EnhancedBrainV2: JSON parse failed, trying to extract from markdown...')
      
      try {
        // Try to extract JSON from markdown code blocks
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
        if (jsonMatch) {
          return JSON.parse(jsonMatch[1].trim())
        }
        
        // Try to find JSON object in the content
        const jsonObjectMatch = content.match(/\{[\s\S]*\}/)
        if (jsonObjectMatch) {
          return JSON.parse(jsonObjectMatch[0])
        }
        
        // Try to find JSON array in the content
        const jsonArrayMatch = content.match(/\[[\s\S]*\]/)
        if (jsonArrayMatch) {
          return JSON.parse(jsonArrayMatch[0])
        }
        
        console.log('🧠 EnhancedBrainV2: Could not extract JSON from markdown, using fallback')
        return fallback
      } catch (fallbackError) {
        console.log('🧠 EnhancedBrainV2: Fallback parsing also failed, using default fallback')
        return fallback
      }
    }
  }

  async analyzeData(
    data: any,
    context: DataContext,
    timeFrame: TimeFrameAnalysis,
    requirements: PresentationRequirements,
    userFeedback?: string[]
  ): Promise<BrainAnalysisResult> {
    try {
      console.log('🧠 EnhancedBrainV2: Starting analysis...');
      
      // Validate inputs
      if (!data) {
        throw new Error('No input data provided');
      }
      if (!context) {
        throw new Error('No context provided');
      }
      if (!timeFrame) {
        throw new Error('No timeFrame provided');
      }
      if (!requirements) {
        throw new Error('No requirements provided');
      }
      
      console.log('🧠 EnhancedBrainV2: Input validation passed');
      
      this.analysisDepth = 0
      
      // Phase 0: Advanced Statistical Analysis (if data is a ParsedDataset)
      let statisticalAnalysis: StatisticalAnalysis[] | undefined
      let businessIntelligence: BusinessIntelligence | undefined
      let enhancedInsights: DataInsight[] = []
      
      if (this.isParsedDataset(data)) {
        console.log('🧠 EnhancedBrainV2: Phase 0 - Advanced Statistical Analysis');
        statisticalAnalysis = AdvancedAnalyticsEngine.analyzeDataset(data)
        businessIntelligence = AdvancedAnalyticsEngine.generateBusinessIntelligence(data, statisticalAnalysis)
        enhancedInsights = AdvancedAnalyticsEngine.generateAdvancedInsights(data, statisticalAnalysis, businessIntelligence)
        console.log(`🧠 EnhancedBrainV2: Generated ${enhancedInsights.length} statistical insights`);
      }
      
      // Phase 1: Initial Data Scan
      console.log('🧠 EnhancedBrainV2: Phase 1 - Initial Data Scan');
      const initialScan = await this.performInitialScan(data, context, timeFrame)
      
      // Phase 2: Deep Pattern Analysis (enhanced with statistical analysis)
      console.log('🧠 EnhancedBrainV2: Phase 2 - Deep Pattern Analysis');
      const patternAnalysis = await this.analyzePatterns(data, context, timeFrame, initialScan, statisticalAnalysis)
      
      // Phase 3: Novel Insight Generation (enhanced with statistical insights)
      console.log('🧠 EnhancedBrainV2: Phase 3 - Novel Insight Generation');
      const novelInsights = await this.generateNovelInsights(data, context, timeFrame, patternAnalysis, enhancedInsights)
      
      // Phase 4: Narrative Development
      console.log('🧠 EnhancedBrainV2: Phase 4 - Narrative Development');
      const narrative = await this.developNarrative(context, requirements, novelInsights)
      
      // Phase 5: Slide Structure Creation
      console.log('🧠 EnhancedBrainV2: Phase 5 - Slide Structure Creation');
      const slideStructure = await this.createSlideStructure(requirements, narrative, novelInsights)
      
      // Phase 6: User Feedback Integration (if provided)
      let refinedResult = { insights: novelInsights, narrative, slideStructure }
      if (userFeedback && userFeedback.length > 0) {
        console.log('🧠 EnhancedBrainV2: Phase 6 - User Feedback Integration');
        refinedResult = await this.integrateUserFeedback(refinedResult, userFeedback, context, requirements)
      }
      
      // Phase 7: Final Validation and Recommendations
      console.log('🧠 EnhancedBrainV2: Phase 7 - Final Validation and Recommendations');
      const recommendations = await this.generateRecommendations(refinedResult, context, requirements)
      
      console.log('🧠 EnhancedBrainV2: Analysis completed successfully');
      
      return {
        ...refinedResult,
        recommendations,
        statisticalAnalysis,
        businessIntelligence,
        metadata: {
          analysisDepth: this.analysisDepth,
          confidence: this.calculateConfidence(refinedResult),
          noveltyScore: this.calculateNoveltyScore(refinedResult.insights),
          businessImpact: this.calculateBusinessImpact(refinedResult),
          dataQuality: this.assessDataQuality(data, context)
        }
      }
    } catch (error) {
      console.error('❌ EnhancedBrainV2.analyzeData Error:', error);
      console.error('Error name:', error instanceof Error ? error.name : 'Unknown');
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      throw error;
    }
  }

  private isParsedDataset(data: any): data is ParsedDataset {
    return data && typeof data === 'object' && 
           'rows' in data && 'columns' in data && 'summary' in data
  }

  private async performInitialScan(
    data: any,
    context: DataContext,
    timeFrame: TimeFrameAnalysis
  ): Promise<any> {
    try {
      console.log('🧠 EnhancedBrainV2: performInitialScan - Starting...');
      
      this.analysisDepth++
      
      const prompt = `You are an expert data analyst performing an initial scan of business data.

CONTEXT:
- Industry: ${context.industry}
- Business Context: ${context.businessContext}
- Data Description: ${context.description}
- Data Quality: ${context.dataQuality}
- Influencing Factors: ${context.factors.join(', ')}

TIME FRAME:
- Primary Period: ${timeFrame.primaryPeriod.start} to ${timeFrame.primaryPeriod.end}
- Analysis Type: ${timeFrame.analysisType}
- Include Trends: ${timeFrame.includeTrends}
- Include Seasonality: ${timeFrame.includeSeasonality}
- Include Outliers: ${timeFrame.includeOutliers}

DATA:
${this.prepareDataForAnalysis(data)}

TASK: Perform an initial comprehensive scan of this data and identify:
1. Data structure and key variables
2. Obvious trends and patterns
3. Potential anomalies or outliers
4. Data quality issues
5. Initial business implications
6. Questions that need deeper analysis

Respond with a JSON object containing:
{
  "dataStructure": {
    "variables": ["list of key variables"],
    "dataTypes": {"variable": "type"},
    "completeness": "assessment"
  },
  "initialTrends": [
    {
      "variable": "name",
      "trend": "description",
      "confidence": 0-100,
      "businessImplication": "description"
    }
  ],
  "anomalies": [
    {
      "type": "outlier|missing|inconsistent",
      "description": "details",
      "impact": "high|medium|low"
    }
  ],
  "qualityIssues": ["list of issues"],
  "businessQuestions": ["list of questions for deeper analysis"],
  "nextSteps": ["recommended analysis steps"]
}`

      console.log('🧠 EnhancedBrainV2: performInitialScan - Making OpenAI API call...');
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 2000
      })

      console.log('🧠 EnhancedBrainV2: performInitialScan - OpenAI response received');
      
      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('OpenAI returned empty response');
      }

      console.log('🧠 EnhancedBrainV2: performInitialScan - Parsing JSON response...');
      
      const parsedResponse = this.parseJsonResponse(content);

      console.log('🧠 EnhancedBrainV2: performInitialScan - Completed successfully');
      return parsedResponse;
      
    } catch (error) {
      console.error('❌ EnhancedBrainV2: performInitialScan Error:', error);
      console.error('Error name:', error instanceof Error ? error.name : 'Unknown');
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  private async analyzePatterns(
    data: any,
    context: DataContext,
    timeFrame: TimeFrameAnalysis,
    initialScan: any,
    statisticalAnalysis?: StatisticalAnalysis[]
  ): Promise<any> {
    this.analysisDepth++
    
    const prompt = `You are an expert data scientist performing deep pattern analysis.

CONTEXT:
- Industry: ${context.industry}
- Business Context: ${context.businessContext}
- Initial Scan Results: ${JSON.stringify(initialScan, null, 2)}

TIME FRAME ANALYSIS:
- Primary Period: ${timeFrame.primaryPeriod.start} to ${timeFrame.primaryPeriod.end}
- Analysis Type: ${timeFrame.analysisType}
- Comparison Period: ${timeFrame.comparisonPeriod ? JSON.stringify(timeFrame.comparisonPeriod) : 'None'}

${statisticalAnalysis ? `ADVANCED STATISTICAL ANALYSIS:
${JSON.stringify(statisticalAnalysis, null, 2)}` : ''}

DATA:
${this.prepareDataForAnalysis(data)}

TASK: Perform deep pattern analysis focusing on:
1. Temporal patterns (seasonality, trends, cycles)
2. Correlations between variables
3. Segment analysis (if applicable)
4. Predictive patterns
5. Comparative analysis (if comparison period exists)
6. Statistical significance of findings
${statisticalAnalysis ? '7. Integration with advanced statistical analysis findings' : ''}

For each pattern found, provide:
- Pattern description
- Statistical confidence
- Business significance
- Supporting evidence
- Potential causes
- Future implications
${statisticalAnalysis ? '- How it relates to the statistical analysis findings' : ''}

Respond with a JSON object containing:
{
  "temporalPatterns": [
    {
      "type": "trend|seasonal|cyclical",
      "description": "detailed description",
      "confidence": 0-100,
      "statisticalSignificance": "p-value or confidence interval",
      "businessSignificance": "impact on business",
      "supportingEvidence": ["data points"],
      "causes": ["potential causes"],
      "futureImplications": ["predictions"]
    }
  ],
  "correlations": [
    {
      "variables": ["var1", "var2"],
      "strength": "strong|moderate|weak",
      "direction": "positive|negative",
      "significance": "statistical significance",
      "businessImplication": "what this means"
    }
  ],
  "segments": [
    {
      "segmentType": "customer|product|region|time",
      "segments": [
        {
          "name": "segment name",
          "characteristics": "description",
          "performance": "how this segment performs",
          "opportunities": ["business opportunities"]
        }
      ]
    }
  ],
  "comparativeAnalysis": {
    "periodComparison": "comparison results",
    "keyDifferences": ["list of differences"],
    "improvements": ["areas of improvement"],
    "concerns": ["areas of concern"]
  }
}`

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 3000
    })

    return this.parseJsonResponse(response.choices[0].message.content || '{}')
  }

  private async generateNovelInsights(
    data: any,
    context: DataContext,
    timeFrame: TimeFrameAnalysis,
    patternAnalysis: any,
    enhancedInsights?: DataInsight[]
  ): Promise<DataInsight[]> {
    this.analysisDepth++
    
    const prompt = `You are an expert business strategist and data scientist tasked with generating NOVEL and ACTIONABLE insights.

CONTEXT:
- Industry: ${context.industry}
- Business Context: ${context.businessContext}
- Data Quality: ${context.dataQuality}
- Influencing Factors: ${context.factors.join(', ')}

PATTERN ANALYSIS:
${JSON.stringify(patternAnalysis, null, 2)}

${enhancedInsights && enhancedInsights.length > 0 ? `STATISTICAL INSIGHTS FOUNDATION:
${JSON.stringify(enhancedInsights, null, 2)}` : ''}

TASK: Generate NOVEL insights that go beyond obvious patterns${enhancedInsights && enhancedInsights.length > 0 ? ' and build upon the statistical analysis foundation' : ''}. Focus on:
1. UNEXPECTED correlations or relationships
2. COUNTER-INTUITIVE findings
3. HIDDEN opportunities or risks
4. EMERGING trends before they become obvious
5. UNIQUE business implications
6. ACTIONABLE recommendations

For each insight, ensure it is:
- NOVEL (not obvious from surface-level analysis)
- ACTIONABLE (leads to specific business actions)
- EVIDENCE-BASED (supported by data)
- BUSINESS-RELEVANT (impacts business outcomes)
- TIMELY (relevant to current business context)

Respond with a JSON array of insights:
[
  {
    "id": "unique_id",
    "type": "trend|pattern|anomaly|correlation|prediction|novel",
    "title": "compelling title",
    "description": "detailed description of the insight",
    "confidence": 0-100,
    "impact": "high|medium|low",
    "dataPoints": ["specific data points that support this insight"],
    "visualization": {
      "type": "chart type",
      "config": "chart configuration",
      "recommended": true/false
    },
    "businessImplication": "what this means for the business",
    "actionableInsights": ["specific actions to take"],
    "supportingEvidence": ["additional evidence"],
    "noveltyScore": 0-100
  }
]

Focus on insights that would surprise and excite business stakeholders. Look for the "WHY" behind the data and novel ways to leverage this information.`

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4000
    })

    const insights = this.parseJsonResponse(response.choices[0].message.content || '[]', [])
    const aiGeneratedInsights = insights.map((insight: any) => ({
      ...insight,
      id: insight.id || `insight_${Date.now()}_${Math.random()}`
    }))

    // Combine AI-generated insights with statistical insights
    const combinedInsights = [
      ...(enhancedInsights || []),
      ...aiGeneratedInsights
    ]

    // Sort by novelty score and impact, then take top insights
    return combinedInsights
      .sort((a, b) => (b.noveltyScore + (b.impact === 'high' ? 30 : b.impact === 'medium' ? 15 : 0)) - 
                      (a.noveltyScore + (a.impact === 'high' ? 30 : a.impact === 'medium' ? 15 : 0)))
      .slice(0, 12) // Return top 12 insights
  }

  private async developNarrative(
    context: DataContext,
    requirements: PresentationRequirements,
    insights: DataInsight[]
  ): Promise<NarrativeArc> {
    this.analysisDepth++
    
    const prompt = `You are an expert storyteller and presentation strategist creating a compelling narrative arc.

CONTEXT:
- Industry: ${context.industry}
- Business Context: ${context.businessContext}
- Audience: ${requirements.audienceType}
- Style: ${requirements.presentationStyle}
- Duration: ${requirements.targetDuration} minutes
- Key Points: ${requirements.keyPoints.join(', ')}

INSIGHTS:
${JSON.stringify(insights, null, 2)}

TASK: Create a compelling narrative arc that:
1. Captures attention immediately
2. Builds tension and interest
3. Delivers key insights at the right moments
4. Creates emotional engagement
5. Drives action
6. Is appropriate for the audience and style

The narrative should:
- Start with a hook that relates to the audience's pain points
- Build through rising action with increasingly compelling insights
- Reach a climax with the most impactful finding
- Provide resolution with clear next steps
- Include emotional journey mapping
- Be tailored to the presentation style (formal, casual, technical, etc.)

Respond with a JSON object:
{
  "id": "narrative_id",
  "title": "compelling title",
  "theme": "central theme or message",
  "structure": {
    "introduction": "hook and setup",
    "risingAction": ["progressive insights that build tension"],
    "climax": "most impactful insight or revelation",
    "fallingAction": ["supporting insights and context"],
    "conclusion": "call to action and next steps"
  },
  "keyMessages": ["core messages to convey"],
  "emotionalJourney": ["emotional states to evoke"],
  "callToAction": "specific action to take",
  "audienceEngagement": ["ways to engage this specific audience"]
}`

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      max_tokens: 3000
    })

    const narrative = this.parseJsonResponse(response.choices[0].message.content || '{}')
    return {
      ...narrative,
      id: narrative.id || `narrative_${Date.now()}_${Math.random()}`
    }
  }

  private async createSlideStructure(
    requirements: PresentationRequirements,
    narrative: NarrativeArc,
    insights: DataInsight[]
  ): Promise<BrainAnalysisResult['slideStructure']> {
    this.analysisDepth++
    
    const prompt = `You are an expert presentation designer creating slide structure.

REQUIREMENTS:
- Slide Count: ${requirements.slideCount}
- Duration: ${requirements.targetDuration} minutes
- Structure: ${requirements.structure}
- Audience: ${requirements.audienceType}
- Style: ${requirements.presentationStyle}
- User Descriptions: ${JSON.stringify(requirements.slideDescriptions, null, 2)}

NARRATIVE:
${JSON.stringify(narrative, null, 2)}

INSIGHTS:
${JSON.stringify(insights, null, 2)}

TASK: Create a detailed slide structure that:
1. Follows the narrative arc
2. Incorporates key insights at appropriate moments
3. Balances content and visual elements
4. Maintains audience engagement
5. Achieves presentation objectives
6. Respects user preferences and descriptions

Each slide should have:
- Clear purpose and message
- Appropriate content type
- Recommended visualizations
- Key takeaways
- Timing considerations

Respond with a JSON array of slides:
[
  {
    "id": "slide_id",
    "number": 1,
    "type": "title|content|chart|summary|custom",
    "title": "slide title",
    "content": "detailed content description",
    "charts": [
      {
        "type": "chart type",
        "data": "data requirements",
        "config": "chart configuration",
        "insights": ["insights to highlight"]
      }
    ],
    "keyTakeaways": ["main points to remember"],
    "timing": "estimated time for this slide"
  }
]`

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 4000
    })

    const slides = this.parseJsonResponse(response.choices[0].message.content || '[]', [])
    return slides.map((slide: any) => ({
      ...slide,
      id: slide.id || `slide_${Date.now()}_${Math.random()}`
    }))
  }

  private async integrateUserFeedback(
    result: { insights: DataInsight[], narrative: NarrativeArc, slideStructure: any[] },
    feedback: string[],
    context: DataContext,
    requirements: PresentationRequirements
  ): Promise<{ insights: DataInsight[], narrative: NarrativeArc, slideStructure: any[] }> {
    this.analysisDepth++
    
    const prompt = `You are integrating user feedback to refine the analysis and presentation.

ORIGINAL RESULTS:
${JSON.stringify(result, null, 2)}

USER FEEDBACK:
${feedback.join('\n')}

CONTEXT:
- Industry: ${context.industry}
- Business Context: ${context.businessContext}
- Requirements: ${JSON.stringify(requirements, null, 2)}

TASK: Refine the analysis and presentation based on user feedback:
1. Address specific concerns or requests
2. Enhance insights based on feedback
3. Adjust narrative to better align with user preferences
4. Modify slide structure as needed
5. Maintain coherence and quality
6. Ensure all feedback is addressed

Respond with the refined JSON object containing insights, narrative, and slideStructure.`

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 4000
    })

    return this.parseJsonResponse(response.choices[0].message.content || '{}')
  }

  private async generateRecommendations(
    result: { insights: DataInsight[], narrative: NarrativeArc, slideStructure: any[] },
    context: DataContext,
    requirements: PresentationRequirements
  ): Promise<BrainAnalysisResult['recommendations']> {
    this.analysisDepth++
    
    const prompt = `You are providing strategic recommendations for the presentation.

ANALYSIS RESULTS:
${JSON.stringify(result, null, 2)}

CONTEXT:
- Industry: ${context.industry}
- Business Context: ${context.businessContext}
- Requirements: ${JSON.stringify(requirements, null, 2)}

TASK: Provide strategic recommendations for:
1. Visualizations: Best chart types and visual approaches
2. Messaging: How to communicate key points effectively
3. Structure: Presentation flow and organization
4. Audience: How to engage this specific audience

Focus on actionable, specific recommendations that will enhance the presentation's impact.

Respond with a JSON object:
{
  "visualizations": ["specific visualization recommendations"],
  "messaging": ["messaging strategy recommendations"],
  "structure": ["structure and flow recommendations"],
  "audience": ["audience engagement recommendations"]
}`

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 2000
    })

    return this.parseJsonResponse(response.choices[0].message.content || '{}')
  }

  private calculateConfidence(result: any): number {
    // Calculate overall confidence based on insight confidence levels
    const insights = result.insights || []
    if (insights.length === 0) return 0
    
    const avgConfidence = insights.reduce((sum: number, insight: DataInsight) => 
      sum + insight.confidence, 0) / insights.length
    
    return Math.round(avgConfidence)
  }

  private calculateNoveltyScore(insights: DataInsight[]): number {
    if (insights.length === 0) return 0
    
    const avgNovelty = insights.reduce((sum: number, insight: DataInsight) => 
      sum + insight.noveltyScore, 0) / insights.length
    
    return Math.round(avgNovelty)
  }

  private calculateBusinessImpact(result: any): number {
    // Calculate business impact based on insight impact levels and narrative strength
    const insights = result.insights || []
    const highImpactCount = insights.filter((i: DataInsight) => i.impact === 'high').length
    const totalInsights = insights.length
    
    if (totalInsights === 0) return 0
    
    const impactScore = (highImpactCount / totalInsights) * 100
    return Math.round(impactScore)
  }

  private assessDataQuality(data: any, context: DataContext): number {
    // Assess data quality based on context and data characteristics
    const qualityScores = {
      'excellent': 90,
      'good': 75,
      'fair': 60,
      'poor': 40
    }
    
    return qualityScores[context.dataQuality] || 50
  }
} 