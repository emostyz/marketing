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

  // Simple method to get a safe, small data sample  
  private getTruncatedDataSample(data: any): string {
    try {
      console.log('🧠 DEBUG: getTruncatedDataSample called with data type:', typeof data);
      
      // If it's an array, just take first 3 items
      if (Array.isArray(data)) {
        const sample = data.slice(0, 3);
        const result = JSON.stringify(sample, null, 2);
        console.log('🧠 DEBUG: Array sample length:', result.length);
        return result;
      }
      
      // If it's a ParsedDataset, take very small sample
      if (this.isParsedDataset(data)) {
        const sampleRows = data.rows.slice(0, 3);
        const sampleData = {
          summary: {
            totalRows: data.rows.length,
            totalColumns: data.columns.length,
            dataTypes: data.columns.slice(0, 5).map(col => ({ name: col.name, type: col.type }))
          },
          sampleRows: sampleRows
        };
        const result = JSON.stringify(sampleData, null, 2);
        console.log('🧠 DEBUG: ParsedDataset sample length:', result.length);
        return result;
      }
      
      // For any other object, stringify and aggressively truncate
      const stringified = JSON.stringify(data, null, 2);
      if (stringified.length > 5000) {
        const truncated = stringified.substring(0, 5000) + '\n... (truncated)';
        console.log('🧠 DEBUG: Object truncated to 5000 chars');
        return truncated;
      }
      
      console.log('🧠 DEBUG: Object sample length:', stringified.length);
      return stringified;
    } catch (error) {
      console.log('🧠 DEBUG: Error in getTruncatedDataSample:', error);
      return 'Error processing data sample';
    }
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
      return 'Error processing data: ' + (error instanceof Error ? error.message : 'Unknown error')
    }
  }

  // Helper method to parse JSON responses with markdown fallback
  private parseJsonResponse(content: string, fallback: any = {}): any {
    try {
      // First try direct JSON parse
      return JSON.parse(content)
    } catch (error) {
      console.log('🧠 EnhancedBrainV2: JSON parse failed, trying to extract from markdown...')
      console.log('🧠 DEBUG: Raw content preview:', content.substring(0, 200))
      
      try {
        // Try to extract JSON from markdown code blocks
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
        if (jsonMatch) {
          return JSON.parse(jsonMatch[1].trim())
        }
        
        // Try to find JSON object in the content
        const jsonObjectMatch = content.match(/\{[\s\S]*\}/)
        if (jsonObjectMatch) {
          // Clean up the match - remove any trailing text after the JSON
          const cleanJson = jsonObjectMatch[0].trim()
          return JSON.parse(cleanJson)
        }
        
        // Try to find JSON array in the content
        const jsonArrayMatch = content.match(/\[[\s\S]*\]/)
        if (jsonArrayMatch) {
          // Clean up the match - remove any trailing text after the JSON
          const cleanJson = jsonArrayMatch[0].trim()
          return JSON.parse(cleanJson)
        }
        
        console.log('🧠 EnhancedBrainV2: Could not extract JSON from content')
        console.log('🧠 DEBUG: Full content:', content)
        return fallback
      } catch (fallbackError) {
        console.log('🧠 EnhancedBrainV2: Fallback parsing also failed:', fallbackError)
        console.log('🧠 DEBUG: Content that failed to parse:', content)
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
- Influencing Factors: ${context.factors ? context.factors.join(', ') : 'None specified'}

TIME FRAME:
- Primary Period: ${timeFrame.primaryPeriod.start} to ${timeFrame.primaryPeriod.end}
- Analysis Type: ${timeFrame.analysisType}
- Include Trends: ${timeFrame.includeTrends}
- Include Seasonality: ${timeFrame.includeSeasonality}
- Include Outliers: ${timeFrame.includeOutliers}

DATA SAMPLE (truncated for token limits):
[Limited sample due to OpenAI token constraints - Full analysis will be performed on complete dataset]

TASK: Perform an initial comprehensive scan of this data and identify:
1. Data structure and key variables
2. Obvious trends and patterns
3. Potential anomalies or outliers
4. Data quality issues
5. Initial business implications
6. Questions that need deeper analysis

Respond ONLY with a valid JSON object (no markdown, no explanation, just JSON) containing:
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
        max_tokens: 2000,
        response_format: { type: "json_object" }
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
    
    const prompt = `You are an ELITE data scientist with PhD-level expertise combining advanced analytics with deep ${context.industry} industry knowledge. Perform BREAKTHROUGH pattern analysis that would impress McKinsey's advanced analytics team.

🎯 BUSINESS INTELLIGENCE BRIEF:
Industry: ${context.industry} | Context: ${context.businessContext}
Analysis Period: ${timeFrame.primaryPeriod.start} to ${timeFrame.primaryPeriod.end}
Comparison: ${timeFrame.comparisonPeriod ? JSON.stringify(timeFrame.comparisonPeriod) : 'None'}

📊 INITIAL FINDINGS:
${JSON.stringify(initialScan, null, 2)}

${statisticalAnalysis ? `🔬 STATISTICAL FOUNDATION:
${JSON.stringify(statisticalAnalysis, null, 2)}` : ''}

🧠 ADVANCED PATTERN ANALYSIS MANDATE:
Apply cutting-edge analytical techniques to uncover patterns that drive competitive advantage in ${context.industry}:

🔍 ANALYTICAL FRAMEWORKS TO APPLY:
1. **COHORT ANALYSIS**: Track performance groups over time to identify success patterns
2. **REGRESSION DISCONTINUITY**: Find inflection points that indicate strategy changes  
3. **CAUSAL INFERENCE**: Distinguish correlation from causation using difference-in-differences
4. **ANOMALY DETECTION**: Identify outliers that signal opportunities or threats
5. **ELASTICITY ANALYSIS**: Understand how key variables respond to changes
6. **SEGMENTATION DYNAMICS**: Uncover hidden customer/product/market segments
7. **PREDICTIVE MODELING**: Forecast future performance with confidence intervals
8. **COMPETITIVE BENCHMARKING**: Compare against industry standards and best practices

💡 PATTERN CATEGORIES TO EXPLORE:
A) **GROWTH ACCELERATORS**: What drives exponential vs. linear growth?
B) **EFFICIENCY MULTIPLIERS**: Where small changes create massive impact?
C) **RISK INDICATORS**: Early warning signals for potential problems?
D) **MARKET TIMING**: Optimal windows for strategic moves?
E) **CUSTOMER LIFECYCLE**: Patterns in acquisition, retention, and expansion?
F) **OPERATIONAL EXCELLENCE**: Hidden inefficiencies and optimization opportunities?
G) **COMPETITIVE DYNAMICS**: How market forces affect performance?

🎯 STRATEGIC DRIVER ANALYSIS:
- PERFORMANCE DRIVERS: Root causes behind performance variations
- TAILWINDS: Market/operational forces creating positive momentum  
- HEADWINDS: Challenges/risks that could limit performance
- LEVERAGE POINTS: Small changes that create massive business impact
- COMPETITIVE ADVANTAGES: Unique patterns that create market differentiation
- QUANTIFIED IMPACT: Revenue/cost implications with statistical confidence
- ACTIONABLE INSIGHTS: Specific steps for next 30/90/365 days

Respond ONLY with a valid JSON object (no markdown, no explanation, just JSON) containing:
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
  },
  "strategicDrivers": {
    "primaryDrivers": [
      {
        "driver": "root cause factor",
        "impact": "quantified impact",
        "evidence": ["supporting data points"],
        "leverage": "how to optimize this driver"
      }
    ],
    "tailwinds": [
      {
        "force": "positive momentum factor",
        "strength": "strong|moderate|emerging",
        "duration": "expected timeframe",
        "capitalizeStrategy": "how to leverage this tailwind"
      }
    ],
    "headwinds": [
      {
        "challenge": "resistance factor",
        "severity": "high|medium|low",
        "timeframe": "when this will impact",
        "mitigationStrategy": "how to overcome this headwind"
      }
    ],
    "leveragePoints": [
      {
        "lever": "small change with big impact",
        "effort": "low|medium|high",
        "potential": "quantified business impact",
        "implementationPlan": "specific steps to execute"
      }
    ]
  }
}`

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 3000,
      response_format: { type: "json_object" }
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
    
    const prompt = `You are a WORLD-CLASS business strategist combining McKinsey partner-level strategic thinking with elite data scientist capabilities. Your mission: generate BREAKTHROUGH insights that will revolutionize how this business operates.

EXECUTIVE BRIEFING:
Industry: ${context.industry} | Business Context: ${context.businessContext}
Data Quality: ${context.dataQuality} | Key Factors: ${context.factors.join(', ')}

ANALYTICAL FOUNDATION:
${JSON.stringify(patternAnalysis, null, 2)}

${enhancedInsights && enhancedInsights.length > 0 ? `STATISTICAL INTELLIGENCE:
${JSON.stringify(enhancedInsights, null, 2)}` : ''}

STRATEGIC DIRECTIVE: Generate 6-8 GAME-CHANGING insights using the McKinsey MECE framework. Each insight must be:

🎯 STRATEGIC IMPACT CRITERIA:
1. PARADIGM-SHIFTING: Challenges conventional wisdom in ${context.industry}
2. PROFIT-DRIVING: Direct path to revenue growth, cost reduction, or competitive advantage  
3. DATA-POWERED: Supported by concrete evidence from the dataset
4. ACTION-ORIENTED: Includes specific, implementable recommendations
5. TIME-SENSITIVE: Urgent opportunity that requires immediate attention
6. RISK-AWARE: Identifies both opportunities AND potential threats

🧠 INSIGHT GENERATION METHODOLOGY:
- Apply 80/20 principle to identify highest-impact opportunities
- Use hypothesis-driven approach: What would surprise the C-suite?
- Think like a McKinsey partner: What would you present to Fortune 500 CEOs?
- Consider market dynamics, competitive positioning, and operational excellence
- Look for inflection points that indicate major shifts
- Identify white space opportunities competitors are missing

💡 INSIGHT CATEGORIES TO EXPLORE:
A) MARKET DISRUPTION SIGNALS: Early indicators of industry transformation
B) OPERATIONAL EXCELLENCE GAPS: Hidden inefficiencies costing millions
C) CUSTOMER BEHAVIOR SHIFTS: Emerging patterns affecting lifetime value
D) COMPETITIVE BLIND SPOTS: Advantages others haven't discovered
E) FINANCIAL OPTIMIZATION: Capital allocation and margin improvement opportunities
F) STRATEGIC PIVOTS: When to double-down vs. when to divest
G) TECHNOLOGY LEVERAGE: AI, automation, and digital transformation opportunities

Respond ONLY with a valid JSON object (no markdown, no explanation, just JSON) containing an 'insights' array:
{
  "insights": [
    {
      "id": "unique_id",
      "type": "market_disruption|operational_excellence|customer_behavior|competitive_advantage|financial_optimization|strategic_pivot|technology_leverage",
      "title": "Compelling executive-level headline",
      "description": "Detailed strategic analysis with specific implications",
      "confidence": 85-95,
      "impact": "transformational|high|medium",
      "urgency": "immediate|30_days|90_days|strategic",
      "dataPoints": ["Specific metrics and evidence from the dataset"],
      "businessCase": {
        "opportunity": "Quantified revenue/cost impact",
        "investment": "Required resources and timeline",
        "roi": "Expected return on investment",
        "risks": ["Key risks and mitigation strategies"]
      },
      "visualization": {
        "type": "executive_chart|trend_analysis|comparison|waterfall|heatmap",
        "priority": "slide_1|slide_2|slide_3|appendix",
        "message": "Key takeaway for executives"
      },
      "strategicDrivers": {
        "primaryDrivers": ["Root causes behind this insight"],
        "tailwinds": [
          {
            "factor": "positive force supporting this insight",
            "strength": "strong|moderate|emerging",
            "leverageStrategy": "how to capitalize on this tailwind"
          }
        ],
        "headwinds": [
          {
            "factor": "challenge that could limit this insight",
            "severity": "high|medium|low", 
            "mitigationStrategy": "how to overcome this headwind"
          }
        ]
      },
      "actionPlan": {
        "immediate": ["Actions for next 30 days"],
        "shortTerm": ["Actions for next 90 days"],
        "longTerm": ["Strategic initiatives"],
        "owners": ["Department/role responsible"]
      },
      "competitiveAngle": "How this creates sustainable competitive advantage",
      "kpis": ["Metrics to track success"],
      "noveltyScore": 80-100,
      "mckinsey_framework": "MECE category this insight belongs to"
    }
  ]
}

DELIVER INSIGHTS THAT WOULD MAKE A FORTUNE 500 CEO SAY "THIS IS EXACTLY WHAT WE NEED TO WIN IN THE MARKET."

Focus on breakthrough thinking that transforms ${context.industry} businesses. Think bigger than incremental improvements - identify game-changing opportunities.`

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" }
    })

    const parsedResponse = this.parseJsonResponse(response.choices[0].message.content || '{"insights": []}', { insights: [] })
    const insights = parsedResponse.insights || []
    const aiGeneratedInsights = insights.map((insight: any) => ({
      ...insight,
      id: insight.id || 'insight_' + Date.now() + '_' + Math.random()
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

Respond ONLY with a valid JSON object (no markdown, no explanation, just JSON):
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
      max_tokens: 3000,
      response_format: { type: "json_object" }
    })

    const narrative = this.parseJsonResponse(response.choices[0].message.content || '{}')
    return {
      ...narrative,
      id: narrative.id || 'narrative_' + Date.now() + '_' + Math.random()
    }
  }

  private async createSlideStructure(
    requirements: PresentationRequirements,
    narrative: NarrativeArc,
    insights: DataInsight[]
  ): Promise<BrainAnalysisResult['slideStructure']> {
    this.analysisDepth++
    
    const prompt = `You are a WORLD-CLASS presentation architect designing the ultimate ${requirements.audienceType} presentation - the kind that wins billion-dollar deals and transforms companies.

EXECUTIVE CONTEXT:
🎯 Target: ${requirements.audienceType} | Duration: ${requirements.targetDuration} min | Slides: ${requirements.slideCount}
📊 Style: ${requirements.presentationStyle} | Structure: ${requirements.structure}

STRATEGIC NARRATIVE:
${JSON.stringify(narrative, null, 2)}

BREAKTHROUGH INSIGHTS:
${JSON.stringify(insights, null, 2)}

PRESENTATION DESIGN MANDATE:
Create a MCKINSEY-QUALITY slide deck that follows the "Situation-Complication-Question-Answer" framework. Every slide must have a PURPOSE and drive toward a DECISION.

🏗️ SLIDE ARCHITECTURE PRINCIPLES:
1. PYRAMID PRINCIPLE: Start with conclusion, then support with evidence
2. MECE FRAMEWORK: Mutually exclusive, collectively exhaustive arguments
3. SO WHAT TEST: Every slide must answer "So what does this mean for our business?"
4. ACTION ORIENTATION: Clear next steps and decision points
5. EXECUTIVE PRESENCE: Bold headlines that grab C-suite attention

📈 SLIDE FLOW METHODOLOGY:
- Slide 1: HOOK + KEY MESSAGE (Grab attention with the biggest insight)
- Slides 2-3: SITUATION ANALYSIS (Current state with data-driven evidence)
- Slides 4-6: BREAKTHROUGH INSIGHTS (Game-changing discoveries)
- Slides 7-8: STRATEGIC RECOMMENDATIONS (Specific actions and business case)
- Final Slide: CALL TO ACTION (What happens next)

💡 CONTENT EXCELLENCE STANDARDS:
- Headlines are CONCLUSIONS, not topics ("Revenue can grow 40%" not "Revenue Analysis")
- Charts tell ONE story with clear message
- Each slide builds logically to the next
- Insights are QUANTIFIED with business impact
- Recommendations include timeline, resources, and success metrics

Respond ONLY with a valid JSON object (no markdown, no explanation, just JSON) containing a 'slides' array:
{
  "slides": [
    {
      "id": "slide_id",
      "number": 1,
      "type": "hook|situation|insight|recommendation|action",
      "headline": "Bold conclusion-based headline that grabs attention",
      "subtitle": "Supporting statement that reinforces the headline",
      "narrative": "The story this slide tells in the overall presentation flow",
      "purpose": "Why this slide exists and what decision it supports",
      "soWhat": "Specific business implication and impact",
      "content": {
        "summary": "Executive summary for slide content",
        "bulletPoints": ["3-5 key supporting points"],
        "dataStory": "How the data supports the conclusion",
        "evidence": ["Specific metrics and proof points"]
      },
      "charts": [
        {
          "type": "executive_dashboard|dual_axis_trend|performance_matrix|waterfall|cohort_heatmap|scatter_correlation|multi_series_comparison|strategic_quadrant",
          "tableauStyle": {
            "visualType": "tableau_professional",
            "colorPalette": "executive_blues|strategic_grays|performance_gradient|diverging_spectrum",
            "chartComplexity": "sophisticated|multi_dimensional",
            "interactivity": "hover_insights|drill_down|filter_controls",
            "annotations": ["key_inflection_points", "performance_thresholds", "strategic_zones"]
          },
          "message": "Single clear strategic message this chart conveys",
          "dataStory": "Complete narrative this visualization tells",
          "dataSource": "Which specific data powers this visualization",
          "callout": "Most important strategic insight to highlight",
          "driversAnalysis": {
            "primaryDrivers": ["key factors driving the trend"],
            "tailwinds": ["positive forces supporting performance"],
            "headwinds": ["challenges limiting performance"]
          },
          "chartSpecification": {
            "xAxis": "primary dimension",
            "yAxis": "primary metric", 
            "secondaryAxis": "additional metric if dual-axis",
            "colorEncoding": "categorical or continuous encoding",
            "sizeEncoding": "if bubble chart or proportional",
            "filterDimensions": ["interactive filter options"],
            "tooltipData": ["additional context on hover"]
          },
          "executiveHighlight": "The one number that matters most for decision-making"
        }
      ],
      "executiveAction": {
        "decision": "What decision this slide informs",
        "nextSteps": ["Immediate actions required"],
        "owner": "Who is responsible for action",
        "timeline": "When action must be taken"
      },
      "speakerNotes": "Talking points for presenter to maximize impact",
      "transitionToNext": "How this slide connects to the following slide",
      "timing": "2-3 minutes per slide for executive presentation"
    }
  ]
}

DESIGN EACH SLIDE TO BE PRESENTATION-READY FOR A FORTUNE 500 BOARDROOM. Every element should drive toward clear business decisions and actions.`

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 4000,
      response_format: { type: "json_object" }
    })

    const parsedResponse = this.parseJsonResponse(response.choices[0].message.content || '{"slides": []}', { slides: [] })
    const slides = parsedResponse.slides || []
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

` +
      'TASK: Refine the analysis and presentation based on user feedback:\n' +
      '1. Address specific concerns or requests\n' +
      '2. Enhance insights based on feedback\n' +
      '3. Adjust narrative to better align with user preferences\n' +
      '4. Modify slide structure as needed\n' +
      '5. Maintain coherence and quality\n' +
      '6. Ensure all feedback is addressed\n\n' +
      'Respond with the refined JSON object containing insights, narrative, and slideStructure.'

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 4000,
      response_format: { type: "json_object" }
    })

    return this.parseJsonResponse(response.choices[0].message.content || '{}')
  }

  private async generateRecommendations(
    result: { insights: DataInsight[], narrative: NarrativeArc, slideStructure: any[] },
    context: DataContext,
    requirements: PresentationRequirements
  ): Promise<BrainAnalysisResult['recommendations']> {
    this.analysisDepth++
    
    const prompt = 'You are providing strategic recommendations for the presentation.\n\n' +
      'ANALYSIS RESULTS:\n' +
      JSON.stringify(result, null, 2) + '\n\n' +
      'CONTEXT:\n' +
      '- Industry: ' + context.industry + '\n' +
      '- Business Context: ' + context.businessContext + '\n' +
      '- Requirements: ' + JSON.stringify(requirements, null, 2) + '\n\n' +
      'TASK: Provide strategic recommendations for:\n' +
      '1. Visualizations: Best chart types and visual approaches\n' +
      '2. Messaging: How to communicate key points effectively\n' +
      '3. Structure: Presentation flow and organization\n' +
      '4. Audience: How to engage this specific audience\n\n' +
      'Focus on actionable, specific recommendations that will enhance the presentation\'s impact.\n\n' +
      'Respond ONLY with a valid JSON object (no markdown, no explanation, just JSON):\n' +
      '{\n' +
      '  "visualizations": ["specific visualization recommendations"],\n' +
      '  "messaging": ["messaging strategy recommendations"],\n' +
      '  "structure": ["structure and flow recommendations"],\n' +
      '  "audience": ["audience engagement recommendations"]\n' +
      '}'

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 2000,
      response_format: { type: "json_object" }
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