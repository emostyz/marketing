// WORLD-CLASS AI ORCHESTRATOR
// Production-ready system that actually generates business-grade presentations

import OpenAI from 'openai'
import { z } from 'zod'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Rigorous type definitions
const ContextSchema = z.object({
  businessContext: z.string().optional(),
  industry: z.string().optional(),
  targetAudience: z.string().optional(),
  presentationGoal: z.string().optional(),
  decisionMakers: z.array(z.string()).optional(),
  timeframe: z.string().optional(),
  urgency: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  keyMetrics: z.array(z.string()).optional(),
  specificQuestions: z.array(z.string()).optional(),
  budgetImplications: z.string().optional(),
  competitiveContext: z.string().optional(),
  expectedOutcomes: z.array(z.string()).optional()
})

type UserContext = z.infer<typeof ContextSchema>

interface WorldClassAnalysis {
  executiveSummary: string
  keyFindings: Array<{
    finding: string
    evidence: any[]
    businessImpact: string
    confidence: number
    actionRequired: string
  }>
  dataQuality: {
    score: number
    issues: string[]
    reliability: string
  }
  recommendations: Array<{
    recommendation: string
    rationale: string
    priority: 'high' | 'medium' | 'low'
    effort: 'low' | 'medium' | 'high'
    impact: 'low' | 'medium' | 'high'
    timeline: string
  }>
  risks: Array<{
    risk: string
    probability: string
    impact: string
    mitigation: string
  }>
  nextActions: Array<{
    action: string
    owner: string
    deadline: string
    dependencies: string[]
  }>
}

interface WorldClassSlide {
  id: string
  type: 'executive_summary' | 'key_findings' | 'deep_analysis' | 'recommendations' | 'implementation' | 'risks' | 'next_steps'
  title: string
  executiveMessage: string
  content: {
    headline: string
    subheadline: string
    keyPoints: string[]
    dataEvidence: any[]
    businessImplication: string
    callToAction: string
  }
  visuals: {
    charts: Array<{
      type: 'bar' | 'line' | 'pie' | 'scatter' | 'heatmap'
      title: string
      data: any[]
      insights: string[]
      config: any
    }>
    metrics: Array<{
      label: string
      value: string | number
      trend: 'up' | 'down' | 'stable'
      context: string
    }>
    callouts: Array<{
      type: 'success' | 'warning' | 'critical' | 'info'
      message: string
      action?: string
    }>
  }
  speakerNotes: string
  design: {
    layout: string
    colorScheme: string[]
    emphasis: string[]
  }
}

export class WorldClassOrchestrator {
  private context: UserContext
  private data: any[]
  private industry: string
  private audience: string

  constructor(context: UserContext, data: any[]) {
    this.context = ContextSchema.parse(context)
    this.data = data
    this.industry = context.industry || 'business'
    this.audience = context.targetAudience || 'executives'
  }

  async generateWorldClassPresentation(): Promise<{
    analysis: WorldClassAnalysis
    slides: WorldClassSlide[]
    metadata: {
      confidence: number
      dataQuality: number
      analysisDepth: string
      businessReadiness: string
    }
  }> {
    console.log('🏆 Starting WORLD-CLASS presentation generation...')

    // Step 1: Deep business-focused analysis
    const analysis = await this.performWorldClassAnalysis()
    
    // Step 2: Generate executive-ready slides
    const slides = await this.generateExecutiveSlides(analysis)
    
    // Step 3: Quality assessment
    const metadata = await this.assessPresentationQuality(analysis, slides)

    return { analysis, slides, metadata }
  }

  private async performWorldClassAnalysis(): Promise<WorldClassAnalysis> {
    console.log('🔍 Performing world-class business analysis...')

    const prompt = `You are a world-class business analyst creating an executive-level analysis.

BUSINESS CONTEXT:
- Industry: ${this.industry}
- Target Audience: ${this.audience}
- Business Context: ${this.context.businessContext}
- Key Questions: ${this.context.specificQuestions?.join('; ') || 'General analysis'}
- Decision Timeline: ${this.context.timeframe}
- Budget Implications: ${this.context.budgetImplications}
- Competitive Context: ${this.context.competitiveContext}

DATA SUMMARY:
- Total Records: ${this.data.length}
- Columns: ${Object.keys(this.data[0] || {}).join(', ')}
- Sample Data: ${JSON.stringify(this.data.slice(0, 3), null, 2)}

REAL DATA ANALYSIS:
${this.performActualDataAnalysis()}

Create a COMPREHENSIVE business analysis that a Fortune 500 executive would expect. Focus on:
1. Business impact and implications
2. Financial implications
3. Strategic recommendations
4. Risk assessment
5. Implementation roadmap

Return a detailed JSON analysis with:
{
  "executiveSummary": "2-3 sentence summary of the most critical business insights",
  "keyFindings": [
    {
      "finding": "Specific insight with real numbers",
      "evidence": ["Data points that support this finding"],
      "businessImpact": "What this means for the business",
      "confidence": 85,
      "actionRequired": "Specific action needed"
    }
  ],
  "dataQuality": {
    "score": 85,
    "issues": ["Any data quality concerns"],
    "reliability": "Assessment of data reliability"
  },
  "recommendations": [
    {
      "recommendation": "Specific, actionable recommendation",
      "rationale": "Business justification",
      "priority": "high",
      "effort": "medium", 
      "impact": "high",
      "timeline": "Implementation timeframe"
    }
  ],
  "risks": [
    {
      "risk": "Potential business risk",
      "probability": "high/medium/low",
      "impact": "Description of potential impact",
      "mitigation": "How to mitigate this risk"
    }
  ],
  "nextActions": [
    {
      "action": "Specific action item",
      "owner": "Who should own this",
      "deadline": "When this should be completed",
      "dependencies": ["What this depends on"]
    }
  ]
}

Make this analysis worthy of a board presentation.`

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 4000
    })

    return JSON.parse(response.choices[0].message.content || '{}')
  }

  private performActualDataAnalysis(): string {
    if (!this.data || this.data.length === 0) {
      return "No data available for analysis"
    }

    const analysis: string[] = []

    // Basic statistics
    const numericColumns = this.getNumericColumns()
    const categoricalColumns = this.getCategoricalColumns()
    
    analysis.push(`Dataset contains ${this.data.length} records with ${numericColumns.length} numeric and ${categoricalColumns.length} categorical dimensions.`)

    // Numeric analysis
    for (const col of numericColumns.slice(0, 3)) {
      const values = this.data.map(row => parseFloat(row[col])).filter(v => !isNaN(v))
      const sum = values.reduce((a, b) => a + b, 0)
      const avg = sum / values.length
      const max = Math.max(...values)
      const min = Math.min(...values)

      analysis.push(`${col}: Total ${this.formatNumber(sum)}, Average ${this.formatNumber(avg)}, Range ${this.formatNumber(min)}-${this.formatNumber(max)}`)
    }

    // Categorical analysis
    for (const col of categoricalColumns.slice(0, 2)) {
      const counts = this.data.reduce((acc, row) => {
        acc[row[col]] = (acc[row[col]] || 0) + 1
        return acc
      }, {})
      const topCategory = Object.entries(counts).sort(([,a], [,b]) => (b as number) - (a as number))[0]
      analysis.push(`${col}: ${Object.keys(counts).length} categories, top: ${topCategory[0]} (${topCategory[1]} records)`)
    }

    // Growth/trend analysis
    const dateColumns = this.getDateColumns()
    if (dateColumns.length > 0 && numericColumns.length > 0) {
      const dateCol = dateColumns[0]
      const valueCol = numericColumns[0]
      
      try {
        const sortedData = this.data
          .filter(row => row[dateCol] && !isNaN(parseFloat(row[valueCol])))
          .sort((a, b) => new Date(a[dateCol]).getTime() - new Date(b[dateCol]).getTime())
        
        if (sortedData.length >= 2) {
          const firstValue = parseFloat(sortedData[0][valueCol])
          const lastValue = parseFloat(sortedData[sortedData.length - 1][valueCol])
          const growth = ((lastValue - firstValue) / firstValue) * 100
          
          analysis.push(`Trend Analysis: ${valueCol} ${growth > 0 ? 'increased' : 'decreased'} by ${Math.abs(growth).toFixed(1)}% over the time period`)
        }
      } catch (e) {
        // Skip trend analysis if data format issues
      }
    }

    return analysis.join('\n')
  }

  private async generateExecutiveSlides(analysis: WorldClassAnalysis): Promise<WorldClassSlide[]> {
    console.log('📊 Generating executive-level slides...')

    const prompt = `Create world-class presentation slides for ${this.audience} in ${this.industry}.

ANALYSIS RESULTS:
${JSON.stringify(analysis, null, 2)}

CONTEXT:
- Presentation Goal: ${this.context.presentationGoal}
- Decision Makers: ${this.context.decisionMakers?.join(', ')}
- Urgency: ${this.context.urgency}
- Timeline: ${this.context.timeframe}

DATA INSIGHTS:
${this.performActualDataAnalysis()}

Create slides that executives would actually use in board meetings. Each slide must:
1. Have a clear executive message
2. Show business impact with real numbers
3. Include specific recommendations
4. Have supporting data visualizations
5. End with clear next actions

Return JSON array of slides:
[
  {
    "id": "slide_1",
    "type": "executive_summary",
    "title": "Executive Summary",
    "executiveMessage": "The one thing executives need to know",
    "content": {
      "headline": "Main business insight with specific numbers",
      "subheadline": "Supporting context that matters to business",
      "keyPoints": [
        "Specific finding with number/percentage",
        "Business implication with dollar impact",
        "Recommended action with timeline"
      ],
      "dataEvidence": ["Specific data points that prove this"],
      "businessImplication": "What this means for revenue/costs/strategy",
      "callToAction": "Specific action executive should take"
    },
    "visuals": {
      "charts": [
        {
          "type": "bar",
          "title": "Chart title that tells a story",
          "data": "Reference to actual data from analysis",
          "insights": ["What the chart reveals about business performance"],
          "config": {"colors": ["#1e40af"], "theme": "executive"}
        }
      ],
      "metrics": [
        {
          "label": "Revenue Impact",
          "value": "Actual calculated value",
          "trend": "up",
          "context": "Compared to what/when"
        }
      ],
      "callouts": [
        {
          "type": "critical",
          "message": "Urgent insight that needs attention",
          "action": "Specific action required"
        }
      ]
    },
    "speakerNotes": "What the presenter should emphasize",
    "design": {
      "layout": "executive_summary",
      "colorScheme": ["#1e40af", "#64748b", "#f59e0b"],
      "emphasis": ["headline", "key_metric"]
    }
  }
]

Create exactly ${this.getOptimalSlideCount()} slides that tell a complete business story.`

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 4000
    })

    const result = JSON.parse(response.choices[0].message.content || '{"slides": []}')
    return this.enhanceSlidesWithRealData(result.slides || [])
  }

  private async enhanceSlidesWithRealData(slides: WorldClassSlide[]): Promise<WorldClassSlide[]> {
    return slides.map(slide => {
      // Enhance with actual calculated metrics
      if (slide.visuals?.metrics) {
        slide.visuals.metrics = slide.visuals.metrics.map(metric => ({
          ...metric,
          value: this.calculateActualMetric(metric.label)
        }))
      }

      // Enhance charts with real data
      if (slide.visuals?.charts) {
        slide.visuals.charts = slide.visuals.charts.map(chart => ({
          ...chart,
          data: this.getChartData(chart.type, chart.title)
        }))
      }

      return slide
    })
  }

  private calculateActualMetric(label: string): string | number {
    const numericColumns = this.getNumericColumns()
    
    if (numericColumns.length === 0) return "N/A"

    const primaryColumn = numericColumns[0]
    const values = this.data.map(row => parseFloat(row[primaryColumn])).filter(v => !isNaN(v))
    
    if (label.toLowerCase().includes('total') || label.toLowerCase().includes('revenue')) {
      return this.formatNumber(values.reduce((a, b) => a + b, 0))
    }
    
    if (label.toLowerCase().includes('average')) {
      return this.formatNumber(values.reduce((a, b) => a + b, 0) / values.length)
    }
    
    if (label.toLowerCase().includes('growth') || label.toLowerCase().includes('change')) {
      if (values.length >= 2) {
        const growth = ((values[values.length - 1] - values[0]) / values[0]) * 100
        return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`
      }
    }

    return this.formatNumber(Math.max(...values))
  }

  private getChartData(chartType: string, title: string): any[] {
    const numericColumns = this.getNumericColumns()
    const categoricalColumns = this.getCategoricalColumns()

    if (chartType === 'bar' && categoricalColumns.length > 0 && numericColumns.length > 0) {
      const categoryCol = categoricalColumns[0]
      const valueCol = numericColumns[0]
      
      const aggregated = this.data.reduce((acc, row) => {
        const category = row[categoryCol]
        const value = parseFloat(row[valueCol])
        if (!isNaN(value)) {
          acc[category] = (acc[category] || 0) + value
        }
        return acc
      }, {})

      return Object.entries(aggregated)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => (b.value as number) - (a.value as number))
        .slice(0, 8)
    }

    if (chartType === 'line' && this.getDateColumns().length > 0 && numericColumns.length > 0) {
      const dateCol = this.getDateColumns()[0]
      const valueCol = numericColumns[0]
      
      return this.data
        .filter(row => row[dateCol] && !isNaN(parseFloat(row[valueCol])))
        .sort((a, b) => new Date(a[dateCol]).getTime() - new Date(b[dateCol]).getTime())
        .map(row => ({
          date: row[dateCol],
          value: parseFloat(row[valueCol])
        }))
        .slice(0, 20)
    }

    // Fallback to metric summary
    return numericColumns.slice(0, 5).map(col => {
      const values = this.data.map(row => parseFloat(row[col])).filter(v => !isNaN(v))
      return {
        name: col,
        value: values.reduce((a, b) => a + b, 0)
      }
    })
  }

  private async assessPresentationQuality(analysis: WorldClassAnalysis, slides: WorldClassSlide[]): Promise<any> {
    let score = 60 // Base score

    // Data quality impact
    score += analysis.dataQuality.score * 0.2

    // Insight quality
    if (analysis.keyFindings.length >= 3) score += 10
    if (analysis.recommendations.filter(r => r.priority === 'high').length >= 2) score += 10

    // Slide quality
    if (slides.length >= 4 && slides.length <= 8) score += 10
    if (slides.every(s => s.content.keyPoints.length >= 2)) score += 5

    // Context alignment
    if (this.context.specificQuestions && this.context.specificQuestions.length > 0) score += 5

    return {
      confidence: Math.min(score, 95),
      dataQuality: analysis.dataQuality.score,
      analysisDepth: score > 80 ? 'Comprehensive' : score > 65 ? 'Adequate' : 'Basic',
      businessReadiness: score > 85 ? 'Board-ready' : score > 70 ? 'Executive-ready' : 'Needs refinement'
    }
  }

  // Utility methods
  private getNumericColumns(): string[] {
    if (!this.data[0]) return []
    return Object.keys(this.data[0]).filter(col => {
      const values = this.data.slice(0, 10).map(row => row[col])
      return values.some(val => !isNaN(parseFloat(val)) && isFinite(val))
    })
  }

  private getCategoricalColumns(): string[] {
    if (!this.data[0]) return []
    const numericCols = this.getNumericColumns()
    return Object.keys(this.data[0]).filter(col => !numericCols.includes(col))
  }

  private getDateColumns(): string[] {
    if (!this.data[0]) return []
    return Object.keys(this.data[0]).filter(col => {
      const sample = this.data[0][col]
      if (!sample) return false
      return !isNaN(Date.parse(String(sample)))
    })
  }

  private formatNumber(num: number): string {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toFixed(0)
  }

  private getOptimalSlideCount(): number {
    let count = 5 // Base count

    if (this.context.urgency === 'critical') count = 4
    if (this.context.urgency === 'high') count = 5
    if (this.audience?.toLowerCase().includes('executive')) count = Math.min(count, 6)
    if (this.context.specificQuestions && this.context.specificQuestions.length > 3) count += 1

    return Math.min(count, 8)
  }
}

export default WorldClassOrchestrator