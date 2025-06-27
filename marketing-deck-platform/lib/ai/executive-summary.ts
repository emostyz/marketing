// Executive Summary Generator
// Creates C-level appropriate summaries from data insights

import { Anthropic } from '@anthropic-ai/sdk'
import { OpenAI } from 'openai'
import { AIReadyData } from './data-preparation'
import { Insight } from './insight-generation'

export interface ExecutiveSummary {
  id: string
  summary: string
  keyMetrics: KeyMetric[]
  recommendations: Recommendation[]
  riskAssessment: RiskAssessment
  opportunityHighlights: OpportunityHighlight[]
  nextSteps: NextStep[]
  confidence: number
  generatedAt: string
  wordCount: number
}

export interface KeyMetric {
  name: string
  value: string
  change?: string
  trend: 'up' | 'down' | 'stable'
  significance: 'high' | 'medium' | 'low'
  context: string
}

export interface Recommendation {
  id: string
  title: string
  description: string
  priority: 'immediate' | 'short-term' | 'long-term'
  impact: 'high' | 'medium' | 'low'
  effort: 'low' | 'medium' | 'high'
  timeframe: string
  success_metrics: string[]
}

export interface RiskAssessment {
  overall: 'low' | 'medium' | 'high'
  key_risks: string[]
  mitigation_strategies: string[]
}

export interface OpportunityHighlight {
  title: string
  description: string
  potential_value: string
  timeframe: string
}

export interface NextStep {
  action: string
  owner: string
  deadline: string
  priority: 'high' | 'medium' | 'low'
}

export class ExecutiveSummaryGenerator {
  private openai: OpenAI
  private anthropic: Anthropic

  constructor(openaiKey?: string, anthropicKey?: string) {
    this.openai = new OpenAI({
      apiKey: openaiKey || process.env.OPENAI_API_KEY
    })
    
    this.anthropic = new Anthropic({
      apiKey: anthropicKey || process.env.ANTHROPIC_API_KEY
    })
  }

  /**
   * Generate comprehensive executive summary
   */
  async generateExecutiveSummary(
    data: AIReadyData,
    insights: Insight[],
    context?: {
      industry?: string
      businessContext?: string
      targetAudience?: string
      timeframe?: string
    }
  ): Promise<ExecutiveSummary> {
    console.log('📋 Generating executive summary...', {
      insights: insights.length,
      industry: context?.industry,
      dataQuality: data.summary.dataQuality.score
    })

    try {
      // Use Anthropic Claude for executive summary (better at business communication)
      const summaryResult = await this.generateCoreSummary(data, insights, context)
      
      // Use OpenAI for structured data extraction
      const structuredData = await this.extractStructuredData(data, insights, summaryResult, context)

      // Combine results
      const executiveSummary: ExecutiveSummary = {
        id: `exec_summary_${Date.now()}`,
        summary: summaryResult,
        keyMetrics: structuredData.keyMetrics,
        recommendations: structuredData.recommendations,
        riskAssessment: structuredData.riskAssessment,
        opportunityHighlights: structuredData.opportunities,
        nextSteps: structuredData.nextSteps,
        confidence: this.calculateConfidence(insights),
        generatedAt: new Date().toISOString(),
        wordCount: summaryResult.split(/\s+/).length
      }

      return executiveSummary

    } catch (error) {
      console.error('❌ Executive summary generation failed:', error)
      return this.generateFallbackSummary(data, insights, context)
    }
  }

  /**
   * Generate core executive summary using Claude
   */
  private async generateCoreSummary(
    data: AIReadyData,
    insights: Insight[],
    context?: any
  ): Promise<string> {
    const topInsights = insights
      .filter(insight => insight.impact === 'high' || insight.priority >= 8)
      .slice(0, 5)

    const prompt = this.buildExecutiveSummaryPrompt(data, topInsights, context)

    const response = await this.anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 400,
      messages: [{
        role: "user",
        content: prompt
      }]
    })

    return response.content[0].type === 'text' ? response.content[0].text : 'Summary generation failed'
  }

  /**
   * Build comprehensive prompt for executive summary
   */
  private buildExecutiveSummaryPrompt(data: AIReadyData, insights: Insight[], context?: any): string {
    const industryContext = context?.industry ? `${context.industry} industry` : 'business'
    const audience = context?.targetAudience || 'C-level executives'
    
    return `Write a concise executive summary for ${audience} in the ${industryContext}. 

DATA ANALYSIS RESULTS:
- Dataset: ${data.summary.totalRows} records across ${data.summary.totalColumns} dimensions
- Data Quality: ${data.summary.dataQuality.score}/100 (${data.summary.dataQuality.score >= 80 ? 'Excellent' : data.summary.dataQuality.score >= 60 ? 'Good' : 'Fair'})
- Analysis Period: ${data.summary.timeRange ? `${data.summary.timeRange.start} to ${data.summary.timeRange.end}` : 'Cross-sectional analysis'}

TOP INSIGHTS:
${insights.map((insight, i) => `${i + 1}. ${insight.title}
   - ${insight.description}
   - Business Impact: ${insight.businessImplication}
   - Action: ${insight.actionableRecommendation}
   - Confidence: ${insight.confidence}%`).join('\n\n')}

KEY METRICS AVAILABLE:
${data.summary.columns.filter(c => c.type === 'numeric').slice(0, 5).map(col => 
  `- ${col.name}: Range ${col.stats?.min?.toFixed(2)} to ${col.stats?.max?.toFixed(2)}, Average ${col.stats?.mean?.toFixed(2)}`
).join('\n')}

CORRELATION FINDINGS:
${data.summary.numericalSummary.correlations.slice(0, 3).map(corr => 
  `- ${corr.col1} ↔ ${corr.col2}: ${(corr.correlation * 100).toFixed(0)}% correlation`
).join('\n')}

Write a 200-250 word executive summary that:

1. OPENS with the single most important finding
2. HIGHLIGHTS 3-4 key metrics with specific numbers
3. IDENTIFIES the primary opportunity or risk with quantification
4. PROVIDES 2-3 actionable recommendations with expected impact
5. CLOSES with immediate next steps and timeline

Requirements:
- Use confident, executive tone
- Include specific numbers and percentages from the data
- Focus on business impact and ROI
- Avoid technical jargon
- Be actionable and decisive
- Reference data quality and analysis rigor

Context: ${context?.businessContext || 'Strategic business analysis for decision-making'}`
  }

  /**
   * Extract structured data using OpenAI
   */
  private async extractStructuredData(
    data: AIReadyData,
    insights: Insight[],
    summary: string,
    context?: any
  ): Promise<{
    keyMetrics: KeyMetric[]
    recommendations: Recommendation[]
    riskAssessment: RiskAssessment
    opportunities: OpportunityHighlight[]
    nextSteps: NextStep[]
  }> {
    const prompt = `Based on this executive summary and data analysis, extract structured information:

EXECUTIVE SUMMARY:
${summary}

DATA INSIGHTS:
${insights.slice(0, 8).map(insight => `- ${insight.title}: ${insight.description} (${insight.impact} impact, ${insight.confidence}% confidence)`).join('\n')}

NUMERICAL DATA:
${data.summary.columns.filter(c => c.type === 'numeric' && c.stats).map(col => 
  `- ${col.name}: ${col.stats!.min?.toFixed(2)} - ${col.stats!.max?.toFixed(2)} (avg: ${col.stats!.mean?.toFixed(2)})`
).join('\n')}

Extract and return JSON with:
{
  "keyMetrics": [
    {
      "name": "Metric name",
      "value": "Formatted value with units",
      "change": "+15.3%" or "description of change",
      "trend": "up|down|stable",
      "significance": "high|medium|low",
      "context": "Business context explanation"
    }
  ],
  "recommendations": [
    {
      "id": "rec_1",
      "title": "Actionable recommendation title",
      "description": "Detailed description with expected outcome",
      "priority": "immediate|short-term|long-term",
      "impact": "high|medium|low",
      "effort": "low|medium|high",
      "timeframe": "Specific timeframe",
      "success_metrics": ["Metric 1", "Metric 2"]
    }
  ],
  "riskAssessment": {
    "overall": "low|medium|high",
    "key_risks": ["Risk 1", "Risk 2"],
    "mitigation_strategies": ["Strategy 1", "Strategy 2"]
  },
  "opportunities": [
    {
      "title": "Opportunity title",
      "description": "Opportunity description",
      "potential_value": "Quantified value/impact",
      "timeframe": "Timeline to realize"
    }
  ],
  "nextSteps": [
    {
      "action": "Specific action item",
      "owner": "Responsible party/department",
      "deadline": "Specific deadline",
      "priority": "high|medium|low"
    }
  ]
}

Requirements:
- Extract 3-5 key metrics with real numbers where available
- Provide 3-4 actionable recommendations
- Include realistic timeframes and effort estimates
- Base recommendations on actual insights
- Ensure all values reference real data points`

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are extracting structured business data from executive summaries. Return valid JSON only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" }
      })

      const result = JSON.parse(response.choices[0].message.content || '{}')
      
      return {
        keyMetrics: result.keyMetrics || [],
        recommendations: result.recommendations || [],
        riskAssessment: result.riskAssessment || { overall: 'medium', key_risks: [], mitigation_strategies: [] },
        opportunities: result.opportunities || [],
        nextSteps: result.nextSteps || []
      }

    } catch (error) {
      console.warn('Structured data extraction failed, using fallback:', error)
      return this.generateFallbackStructuredData(data, insights)
    }
  }

  /**
   * Generate fallback structured data
   */
  private generateFallbackStructuredData(data: AIReadyData, insights: Insight[]): {
    keyMetrics: KeyMetric[]
    recommendations: Recommendation[]
    riskAssessment: RiskAssessment
    opportunities: OpportunityHighlight[]
    nextSteps: NextStep[]
  } {
    // Extract key metrics from numeric columns
    const keyMetrics: KeyMetric[] = data.summary.columns
      .filter(col => col.type === 'numeric' && col.stats)
      .slice(0, 4)
      .map(col => ({
        name: col.name,
        value: `${col.stats!.mean?.toFixed(2)} (avg)`,
        change: col.stats!.max! > col.stats!.mean! ? '+Above average' : 'Within range',
        trend: 'stable' as const,
        significance: 'medium' as const,
        context: `Based on ${data.summary.totalRows} data points`
      }))

    // Extract recommendations from high-impact insights
    const recommendations: Recommendation[] = insights
      .filter(insight => insight.impact === 'high')
      .slice(0, 3)
      .map((insight, index) => ({
        id: `rec_${index + 1}`,
        title: insight.title,
        description: insight.actionableRecommendation,
        priority: insight.priority >= 8 ? 'immediate' : 'short-term' as const,
        impact: insight.impact,
        effort: 'medium' as const,
        timeframe: insight.priority >= 8 ? '30 days' : '90 days',
        success_metrics: [insight.metrics.value ? `${insight.metrics.value}` : 'Performance improvement']
      }))

    // Basic risk assessment
    const risks = insights.filter(insight => insight.type === 'anomaly' || insight.impact === 'high')
    const riskAssessment: RiskAssessment = {
      overall: risks.length > 2 ? 'high' : risks.length > 0 ? 'medium' : 'low',
      key_risks: risks.slice(0, 3).map(risk => risk.title),
      mitigation_strategies: risks.slice(0, 2).map(risk => risk.actionableRecommendation)
    }

    // Extract opportunities
    const opportunities: OpportunityHighlight[] = insights
      .filter(insight => insight.type === 'opportunity' || insight.type === 'trend')
      .slice(0, 2)
      .map(insight => ({
        title: insight.title,
        description: insight.businessImplication,
        potential_value: insight.metrics.value ? `${insight.metrics.value}` : 'Significant impact expected',
        timeframe: insight.priority >= 7 ? '60-90 days' : '3-6 months'
      }))

    // Generate next steps
    const nextSteps: NextStep[] = [
      {
        action: 'Review detailed analysis findings',
        owner: 'Analytics Team',
        deadline: '1 week',
        priority: 'high' as const
      },
      {
        action: 'Implement top recommendation',
        owner: 'Operations Team',
        deadline: '30 days',
        priority: 'high' as const
      },
      {
        action: 'Monitor key metrics weekly',
        owner: 'Management Team',
        deadline: 'Ongoing',
        priority: 'medium' as const
      }
    ]

    return {
      keyMetrics,
      recommendations,
      riskAssessment,
      opportunities,
      nextSteps
    }
  }

  /**
   * Calculate confidence score for summary
   */
  private calculateConfidence(insights: Insight[]): number {
    if (insights.length === 0) return 50

    const avgConfidence = insights.reduce((sum, insight) => sum + insight.confidence, 0) / insights.length
    const highImpactRatio = insights.filter(insight => insight.impact === 'high').length / insights.length
    const varietyBonus = new Set(insights.map(insight => insight.type)).size * 5

    return Math.min(95, Math.round(avgConfidence * 0.7 + highImpactRatio * 20 + varietyBonus))
  }

  /**
   * Generate fallback summary
   */
  private generateFallbackSummary(data: AIReadyData, insights: Insight[], context?: any): ExecutiveSummary {
    const topInsight = insights.find(insight => insight.impact === 'high') || insights[0]
    
    const fallbackSummary = `Analysis of ${data.summary.totalRows} records reveals ${insights.length} key insights with ${data.summary.dataQuality.score}/100 data quality. ` +
      `Primary finding: ${topInsight?.title || 'Data patterns require attention'}. ` +
      `${insights.filter(i => i.impact === 'high').length} high-impact opportunities identified. ` +
      `Recommended action: ${topInsight?.actionableRecommendation || 'Review detailed findings for strategic recommendations'}.`

    return {
      id: `exec_summary_fallback_${Date.now()}`,
      summary: fallbackSummary,
      keyMetrics: [],
      recommendations: [],
      riskAssessment: { overall: 'medium', key_risks: [], mitigation_strategies: [] },
      opportunityHighlights: [],
      nextSteps: [],
      confidence: 60,
      generatedAt: new Date().toISOString(),
      wordCount: fallbackSummary.split(/\s+/).length
    }
  }

  /**
   * Format executive summary for presentation
   */
  static formatForPresentation(summary: ExecutiveSummary): {
    title: string
    content: string
    keyPoints: string[]
    metrics: string[]
    actions: string[]
  } {
    return {
      title: 'Executive Summary',
      content: summary.summary,
      keyPoints: [
        ...summary.keyMetrics.slice(0, 3).map(metric => 
          `${metric.name}: ${metric.value} ${metric.change ? `(${metric.change})` : ''}`
        ),
        ...summary.opportunityHighlights.slice(0, 2).map(opp => opp.title)
      ],
      metrics: summary.keyMetrics.map(metric => 
        `${metric.name}: ${metric.value} - ${metric.context}`
      ),
      actions: summary.recommendations.slice(0, 3).map(rec => 
        `${rec.title} (${rec.timeframe})`
      )
    }
  }
}