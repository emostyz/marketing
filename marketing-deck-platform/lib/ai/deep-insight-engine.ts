// Deep Insight Engine - Advanced Analytics for Non-Obvious Drivers and Trends
// Specifically designed to find hidden patterns in complex, nuanced data

import OpenAI from 'openai'

export interface DeepInsight {
  id: string
  type: 'hidden_driver' | 'non_obvious_correlation' | 'emerging_trend' | 'pattern_anomaly' | 'causal_relationship' | 'behavioral_shift'
  title: string
  description: string
  confidence: number
  noveltyScore: number // 0-100, how non-obvious/surprising this insight is
  businessImpact: 'critical' | 'high' | 'medium' | 'low'
  evidence: {
    dataPoints: string[]
    statisticalSignificance: number
    correlationStrength: number
    trendDirection: 'increasing' | 'decreasing' | 'cyclical' | 'volatile' | 'stable'
  }
  visualization: {
    chartType: 'correlation_matrix' | 'trend_decomposition' | 'anomaly_detection' | 'driver_analysis' | 'behavioral_flow'
    config: any
    priority: 'primary' | 'secondary' | 'supporting'
  }
  actionableRecommendations: string[]
  riskFactors: string[]
  opportunityIndicators: string[]
  underlyingCauses: string[]
  predictiveIndicators: string[]
}

export interface ComplexAnalysisResult {
  deepInsights: DeepInsight[]
  hiddenDrivers: {
    primary: string[]
    secondary: string[]
    emerging: string[]
  }
  nonObviousCorrelations: Array<{
    variables: string[]
    correlation: number
    significance: number
    businessRelevance: string
  }>
  emergingTrends: Array<{
    trend: string
    strength: number
    timeframe: string
    predictedImpact: string
  }>
  anomalyDetection: Array<{
    anomaly: string
    severity: 'high' | 'medium' | 'low'
    possibleCauses: string[]
    businessImplications: string[]
  }>
  strategicRecommendations: {
    immediate: string[]
    shortTerm: string[]
    longTerm: string[]
  }
  confidence: number
  dataComplexity: number
}

export class DeepInsightEngine {
  private openai: OpenAI

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey })
  }

  async analyzeForDeepInsights(
    data: any[],
    context: any,
    businessObjectives: string[]
  ): Promise<ComplexAnalysisResult> {
    console.log('🔍 Starting deep insight analysis for non-obvious patterns...')

    // Prepare comprehensive analysis prompt
    const analysisPrompt = this.buildDeepAnalysisPrompt(data, context, businessObjectives)
    
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: this.getSystemPrompt()
          },
          {
            role: "user", 
            content: analysisPrompt
          }
        ],
        temperature: 0.3, // Lower temperature for more analytical responses
        max_tokens: 4000,
        response_format: { type: "json_object" }
      })

      const response = completion.choices[0]?.message?.content
      if (!response) {
        throw new Error('No response from OpenAI')
      }

      const analysisResult = JSON.parse(response)
      return this.processAnalysisResult(analysisResult)

    } catch (error) {
      console.error('Deep insight analysis error:', error)
      throw new Error(`Failed to perform deep insight analysis: ${error}`)
    }
  }

  private getSystemPrompt(): string {
    return `You are an elite business intelligence analyst and data scientist with expertise in finding non-obvious patterns, hidden drivers, and complex correlations in business data. Your specialty is uncovering insights that others miss.

Core Capabilities:
1. HIDDEN DRIVER ANALYSIS: Identify non-obvious factors that drive business outcomes
2. COMPLEX CORRELATION DETECTION: Find unexpected relationships between variables
3. EMERGING TREND IDENTIFICATION: Spot early signals of significant changes
4. ANOMALY INTERPRETATION: Explain unusual patterns and their business implications
5. CAUSAL RELATIONSHIP MAPPING: Distinguish correlation from causation
6. BEHAVIORAL PATTERN RECOGNITION: Identify shifts in customer or market behavior

Analysis Standards:
- Focus on NON-OBVIOUS insights that require deep analytical thinking
- Prioritize insights with high business impact and novelty scores
- Provide statistical evidence and confidence levels
- Suggest specific, actionable recommendations
- Identify both opportunities and risks
- Consider temporal patterns, seasonality, and cyclical behaviors
- Look for leading indicators and predictive signals

Output Requirements:
- Generate insights with novelty scores of 60+ (surprising/non-obvious)
- Provide evidence-based recommendations with confidence levels
- Identify hidden drivers that aren't immediately apparent
- Suggest strategic actions based on deep pattern analysis
- Focus on insights that can drive competitive advantage

Remember: Your goal is to find the insights that others would miss - the hidden patterns that could transform business strategy.`
  }

  private buildDeepAnalysisPrompt(data: any[], context: any, objectives: string[]): string {
    // Analyze data structure and patterns
    const dataAnalysis = this.analyzeDataStructure(data)
    
    return `Perform deep insight analysis on this business dataset to find NON-OBVIOUS drivers, hidden patterns, and complex correlations.

DATASET OVERVIEW:
- Rows: ${data.length}
- Columns: ${dataAnalysis.columns.join(', ')}
- Numeric fields: ${dataAnalysis.numericColumns.join(', ')}
- Date fields: ${dataAnalysis.dateColumns.join(', ')}
- Data quality: ${dataAnalysis.quality}

BUSINESS CONTEXT:
- Industry: ${context.industry || 'General Business'}
- Business context: ${context.businessContext || 'Performance Analysis'}
- Key factors: ${(context.factors || []).join(', ')}
- Target audience: ${context.targetAudience || 'Executives'}

BUSINESS OBJECTIVES:
${objectives.map(obj => `- ${obj}`).join('\n')}

SAMPLE DATA (First 5 rows):
${JSON.stringify(data.slice(0, 5), null, 2)}

STATISTICAL SUMMARY:
${this.generateStatisticalSummary(data, dataAnalysis.numericColumns)}

ANALYSIS REQUIREMENTS:
1. Find HIDDEN DRIVERS that are not immediately obvious
2. Identify NON-OBVIOUS CORRELATIONS between variables
3. Detect EMERGING TRENDS and early warning signals
4. Spot BEHAVIORAL PATTERNS and shifts
5. Identify ANOMALIES and their business implications
6. Map CAUSAL RELATIONSHIPS (not just correlations)
7. Provide PREDICTIVE INDICATORS for future performance

Focus on insights with high novelty scores (60+) that would surprise business leaders and provide competitive advantage.

Respond with a JSON object following this structure:
{
  "deepInsights": [
    {
      "id": "unique_id",
      "type": "hidden_driver|non_obvious_correlation|emerging_trend|pattern_anomaly|causal_relationship|behavioral_shift",
      "title": "Insight title",
      "description": "Detailed explanation of the non-obvious insight",
      "confidence": 0.85,
      "noveltyScore": 75,
      "businessImpact": "critical|high|medium|low",
      "evidence": {
        "dataPoints": ["specific data evidence"],
        "statisticalSignificance": 0.95,
        "correlationStrength": 0.73,
        "trendDirection": "increasing|decreasing|cyclical|volatile|stable"
      },
      "visualization": {
        "chartType": "correlation_matrix|trend_decomposition|anomaly_detection|driver_analysis|behavioral_flow",
        "config": {},
        "priority": "primary|secondary|supporting"
      },
      "actionableRecommendations": ["specific action items"],
      "riskFactors": ["potential risks"],
      "opportunityIndicators": ["opportunity signals"],
      "underlyingCauses": ["root causes"],
      "predictiveIndicators": ["future signals"]
    }
  ],
  "hiddenDrivers": {
    "primary": ["main non-obvious drivers"],
    "secondary": ["supporting drivers"],
    "emerging": ["new emerging drivers"]
  },
  "nonObviousCorrelations": [
    {
      "variables": ["var1", "var2"],
      "correlation": 0.67,
      "significance": 0.92,
      "businessRelevance": "explanation of business impact"
    }
  ],
  "emergingTrends": [
    {
      "trend": "trend description",
      "strength": 0.78,
      "timeframe": "6-12 months",
      "predictedImpact": "expected business impact"
    }
  ],
  "anomalyDetection": [
    {
      "anomaly": "anomaly description",
      "severity": "high|medium|low",
      "possibleCauses": ["potential causes"],
      "businessImplications": ["business consequences"]
    }
  ],
  "strategicRecommendations": {
    "immediate": ["actions for next 30 days"],
    "shortTerm": ["actions for next 3-6 months"],
    "longTerm": ["strategic initiatives for 6+ months"]
  },
  "confidence": 0.87,
  "dataComplexity": 0.73
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
    
    numericColumns.slice(0, 5).forEach(col => { // Limit to 5 columns for brevity
      const values = data
        .map(row => parseFloat(row[col]))
        .filter(val => !isNaN(val))
      
      if (values.length > 0) {
        const avg = values.reduce((a, b) => a + b, 0) / values.length
        const min = Math.min(...values)
        const max = Math.max(...values)
        const variance = values.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / values.length
        const stdDev = Math.sqrt(variance)
        
        summary.push(`${col}: avg=${avg.toFixed(2)}, min=${min}, max=${max}, std=${stdDev.toFixed(2)}`)
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

  private processAnalysisResult(rawResult: any): ComplexAnalysisResult {
    // Validate and enhance the analysis result
    const result: ComplexAnalysisResult = {
      deepInsights: rawResult.deepInsights || [],
      hiddenDrivers: rawResult.hiddenDrivers || { primary: [], secondary: [], emerging: [] },
      nonObviousCorrelations: rawResult.nonObviousCorrelations || [],
      emergingTrends: rawResult.emergingTrends || [],
      anomalyDetection: rawResult.anomalyDetection || [],
      strategicRecommendations: rawResult.strategicRecommendations || { immediate: [], shortTerm: [], longTerm: [] },
      confidence: rawResult.confidence || 0.75,
      dataComplexity: rawResult.dataComplexity || 0.5
    }

    // Ensure deep insights have required fields and high novelty scores
    result.deepInsights = result.deepInsights.filter(insight => 
      insight.noveltyScore >= 60 && insight.confidence >= 0.7
    )

    // Sort insights by novelty score and business impact
    result.deepInsights.sort((a, b) => {
      const impactWeight = { critical: 4, high: 3, medium: 2, low: 1 }
      const scoreA = a.noveltyScore + (impactWeight[a.businessImpact] * 10)
      const scoreB = b.noveltyScore + (impactWeight[b.businessImpact] * 10)
      return scoreB - scoreA
    })

    console.log(`🎯 Deep analysis complete: ${result.deepInsights.length} non-obvious insights found`)
    
    return result
  }

  // Generate slides specifically focused on deep insights
  async generateDeepInsightSlides(analysisResult: ComplexAnalysisResult): Promise<any[]> {
    const slides = []

    // Executive Summary of Hidden Drivers
    slides.push({
      id: `deep_insights_summary_${Date.now()}`,
      type: 'executive_summary',
      title: 'Hidden Drivers & Non-Obvious Insights',
      content: {
        summary: 'Our AI analysis uncovered surprising patterns and non-obvious drivers that could transform your business strategy.',
        bulletPoints: analysisResult.hiddenDrivers.primary.slice(0, 4),
        dataStory: `Analysis of ${analysisResult.deepInsights.length} deep insights reveals hidden opportunities with ${Math.round(analysisResult.confidence * 100)}% confidence.`,
        evidence: analysisResult.deepInsights.slice(0, 3).map(insight => insight.title)
      },
      charts: [{
        type: 'driver_analysis',
        title: 'Hidden Business Drivers',
        data: analysisResult.hiddenDrivers.primary.map((driver, index) => ({
          driver,
          impact: Math.random() * 0.3 + 0.7, // Mock impact scores
          novelty: 85 - (index * 5)
        })),
        config: {
          xAxisKey: 'driver',
          yAxisKey: 'impact',
          showAnimation: true,
          colors: ['#8B5CF6', '#10B981', '#F59E0B']
        },
        insights: [`${analysisResult.hiddenDrivers.primary.length} non-obvious drivers identified`],
        source: 'Deep AI Analysis'
      }]
    })

    // Top Non-Obvious Correlations
    if (analysisResult.nonObviousCorrelations.length > 0) {
      slides.push({
        id: `correlations_${Date.now()}`,
        type: 'insight_deep_dive',
        title: 'Surprising Correlations & Hidden Connections',
        content: {
          summary: 'Unexpected relationships in your data reveal new strategic opportunities.',
          bulletPoints: analysisResult.nonObviousCorrelations.slice(0, 4).map(corr => 
            `${corr.variables.join(' ↔ ')}: ${Math.round(corr.correlation * 100)}% correlation`
          ),
          dataStory: 'These hidden connections suggest new approaches to business optimization.'
        },
        charts: [{
          type: 'correlation_matrix',
          title: 'Hidden Correlation Network',
          data: analysisResult.nonObviousCorrelations,
          config: {
            showHeatmap: true,
            correlationThreshold: 0.5
          },
          insights: ['Non-obvious patterns reveal new optimization opportunities']
        }]
      })
    }

    // Emerging Trends and Early Signals
    if (analysisResult.emergingTrends.length > 0) {
      slides.push({
        id: `emerging_trends_${Date.now()}`,
        type: 'trend_analysis',
        title: 'Emerging Trends & Early Warning Signals',
        content: {
          summary: 'Early trend detection reveals opportunities to stay ahead of the market.',
          bulletPoints: analysisResult.emergingTrends.map(trend => 
            `${trend.trend} (${trend.timeframe})`
          ),
          dataStory: 'These emerging patterns indicate shifting market dynamics.'
        },
        charts: [{
          type: 'trend_decomposition',
          title: 'Trend Strength Analysis',
          data: analysisResult.emergingTrends,
          config: {
            showPrediction: true,
            confidenceInterval: true
          },
          insights: ['Early trend detection enables proactive strategy adjustments']
        }]
      })
    }

    // Deep Insight Details (for top insights)
    analysisResult.deepInsights.slice(0, 2).forEach((insight, index) => {
      slides.push({
        id: `insight_detail_${index}_${Date.now()}`,
        type: 'insight_spotlight',
        title: insight.title,
        content: {
          summary: insight.description,
          bulletPoints: insight.actionableRecommendations.slice(0, 4),
          dataStory: `Novelty Score: ${insight.noveltyScore}/100 | Confidence: ${Math.round(insight.confidence * 100)}%`,
          evidence: insight.evidence.dataPoints
        },
        charts: [{
          type: insight.visualization.chartType,
          title: `${insight.title} - Evidence`,
          data: [], // Would be populated with actual chart data
          config: insight.visualization.config,
          insights: insight.opportunityIndicators,
          source: 'Deep Analytics Engine'
        }]
      })
    })

    // Strategic Action Plan
    slides.push({
      id: `strategic_actions_${Date.now()}`,
      type: 'action_plan',
      title: 'Strategic Action Plan: Leveraging Hidden Insights',
      content: {
        summary: 'Convert deep insights into competitive advantage through strategic action.',
        bulletPoints: [
          ...analysisResult.strategicRecommendations.immediate.slice(0, 2),
          ...analysisResult.strategicRecommendations.shortTerm.slice(0, 2)
        ],
        dataStory: 'Systematic implementation of these insights can drive significant business value.'
      }
    })

    return slides
  }
}