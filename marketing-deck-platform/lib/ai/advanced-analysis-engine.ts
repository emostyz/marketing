import OpenAI from 'openai'
import { PythonExecutor, PythonAnalysisResult } from '../python/python-executor'

export interface AdvancedAnalysisRequest {
  data: any[]
  datasetName: string
  context?: string
  businessGoals?: string[]
  targetAudience?: 'executives' | 'managers' | 'analysts' | 'board'
}

export interface AdvancedAnalysisResult {
  executiveSummary: ExecutiveSummary
  keyFindings: KeyFinding[]
  detailedAnalysis: DetailedAnalysis
  recommendations: Recommendation[]
  visualizations: VisualizationSpec[]
  slides: SlideContent[]
  qualityScore: number
  confidence: number
}

interface ExecutiveSummary {
  headline: string
  keyMetric: { name: string; value: string; change: string }
  summary: string
  businessImpact: string
}

interface KeyFinding {
  title: string
  insight: string
  evidence: string
  significance: 'high' | 'medium' | 'low'
  actionable: boolean
}

interface DetailedAnalysis {
  dataQuality: DataQualityAssessment
  statisticalFindings: StatisticalFinding[]
  trends: TrendAnalysis[]
  correlations: CorrelationInsight[]
}

interface Recommendation {
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  timeframe: string
  expectedImpact: string
  resources: string[]
}

interface VisualizationSpec {
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap'
  title: string
  data: any[]
  config: any
  insights: string[]
}

interface SlideContent {
  type: 'title' | 'executive_summary' | 'key_findings' | 'analysis' | 'trends' | 'recommendations'
  title: string
  subtitle?: string
  content: SlideElement[]
  speakerNotes: string
}

interface SlideElement {
  type: 'text' | 'chart' | 'metric' | 'list'
  content: any
  position: { x: number; y: number; width: number; height: number }
  style: any
}

interface DataQualityAssessment {
  completeness: number
  consistency: number
  accuracy: number
  issues: string[]
  recommendations: string[]
}

interface StatisticalFinding {
  metric: string
  value: number
  significance: string
  interpretation: string
}

interface TrendAnalysis {
  metric: string
  direction: 'increasing' | 'decreasing' | 'stable'
  strength: number
  forecast: string
}

interface CorrelationInsight {
  variables: string[]
  strength: number
  relationship: string
  businessImplication: string
}

export class AdvancedAnalysisEngine {
  private openai: OpenAI
  private pythonExecutor!: PythonExecutor

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  }

  async generateCEOReadyAnalysis(request: AdvancedAnalysisRequest): Promise<AdvancedAnalysisResult> {
    console.log('🧠 Starting CEO-ready analysis pipeline...')
    
    try {
      // Step 1: Initial data exploration with Python
      const explorationCode = await this.generateExplorationCode(request)
      const explorationResult = await PythonExecutor.executeAnalysis(explorationCode, request.data)
      
      if (!explorationResult.success) {
        throw new Error(`Python exploration failed: ${explorationResult.error}`)
      }

      // Step 2: OpenAI analyzes Python results and requests deeper analysis
      const deepAnalysisCode = await this.generateDeepAnalysisCode(explorationResult, request)
      const deepAnalysisResult = await PythonExecutor.executeAnalysis(deepAnalysisCode, request.data)

      if (!deepAnalysisResult.success) {
        throw new Error(`Python deep analysis failed: ${deepAnalysisResult.error}`)
      }

      // Step 3: OpenAI generates executive insights and narratives
      const insights = await this.generateExecutiveInsights(deepAnalysisResult, request)

      // Step 4: OpenAI creates visualizations and charts
      const visualizations = await this.generateVisualizations(deepAnalysisResult, insights, request)

      // Step 5: OpenAI builds CEO-ready slides
      const slides = await this.generateCEOSlides(insights, visualizations, request)

      // Step 6: Quality assurance and refinement
      const finalResult = await this.qualityAssurance({
        executiveSummary: insights.executiveSummary,
        keyFindings: insights.keyFindings,
        detailedAnalysis: insights.detailedAnalysis,
        recommendations: insights.recommendations,
        visualizations,
        slides,
        qualityScore: 0,
        confidence: 0
      }, request)

      console.log('✅ CEO-ready analysis pipeline completed')
      return finalResult

    } catch (error) {
      console.error('❌ Analysis pipeline failed:', error)
      throw error
    }
  }

  private async generateExplorationCode(request: AdvancedAnalysisRequest): Promise<string> {
    const prompt = `You are a senior data scientist. Generate ONLY Python code to explore this dataset for a CEO presentation.

Dataset: ${request.datasetName}
Context: ${request.context || 'Business performance analysis'}
Target Audience: ${request.targetAudience || 'executives'}

Generate comprehensive Python code that:
1. Explores data structure and quality
2. Identifies key business metrics
3. Calculates growth rates and trends
4. Finds correlations and patterns
5. Identifies outliers and anomalies
6. Generates summary statistics

CRITICAL: Return ONLY executable Python code with NO markdown, NO explanations, NO comments except within the code itself.

# Example of what to include:
# Calculate key metrics
revenue_total = df['Revenue'].sum() if 'Revenue' in df.columns else 0
revenue_avg = df['Revenue'].mean() if 'Revenue' in df.columns else 0

# Print structured results
print("KEY_METRICS:", json.dumps({"total_revenue": float(revenue_total), "avg_revenue": float(revenue_avg)}))

Generate similar analysis code for the actual dataset:`

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 2000
    })

    const content = response.choices[0]?.message?.content || ''
    
    // Remove markdown code block markers and explanatory text
    let cleanedContent = content
      .replace(/```python\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()
    
    // Remove explanatory text that might be present
    const lines = cleanedContent.split('\n')
    const codeLines = []
    
    for (const line of lines) {
      const trimmedLine = line.trim()
      
      // Skip explanatory sentences (simple heuristic)
      if (trimmedLine.includes('.csv') && trimmedLine.includes('might vary')) {
        continue
      }
      if (trimmedLine.includes('Please note') || trimmedLine.includes('Note that')) {
        continue
      }
      if (trimmedLine.match(/^[A-Z][a-z].*\.$/) && !trimmedLine.startsWith('#')) {
        continue // Skip sentences that look like explanations
      }
      
      // Include Python code lines
      if (trimmedLine.startsWith('#') || 
          trimmedLine.includes('=') || 
          trimmedLine.includes('import') ||
          trimmedLine.includes('print') ||
          trimmedLine.includes('df') ||
          trimmedLine.includes('if ') ||
          trimmedLine.includes('for ') ||
          trimmedLine.includes('try:') ||
          trimmedLine.includes('except') ||
          trimmedLine === '') {
        codeLines.push(line)
      }
    }
    
    return codeLines.join('\n').trim()
  }

  private async generateDeepAnalysisCode(explorationResult: PythonAnalysisResult, request: AdvancedAnalysisRequest): Promise<string> {
    const prompt = `Based on the initial data exploration, generate advanced Python analysis code for CEO-level insights.

Initial findings: ${JSON.stringify(explorationResult.output, null, 2)}

Generate Python code that:
1. Performs advanced statistical analysis
2. Creates forecasting models
3. Analyzes customer segments or categories
4. Calculates ROI and business metrics
5. Identifies actionable insights
6. Performs cohort or time-series analysis (if applicable)
7. Generates executive KPIs

Focus on metrics that drive business decisions. The analysis should be presentation-ready.

Return only the Python code:`

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 2500
    })

    const content = response.choices[0]?.message?.content || ''
    
    // Remove markdown code block markers if present
    return content.replace(/```python\n?/g, '').replace(/```\n?/g, '').trim()
  }

  private async generateExecutiveInsights(analysisResult: PythonAnalysisResult, request: AdvancedAnalysisRequest): Promise<any> {
    const prompt = `You are a McKinsey consultant preparing insights for a CEO presentation.

Analysis Results: ${JSON.stringify(analysisResult.output, null, 2)}
Dataset: ${request.datasetName}
Context: ${request.context}

Generate executive-level insights in this exact JSON format:
{
  "executiveSummary": {
    "headline": "Compelling 8-12 word headline capturing the key story",
    "keyMetric": {"name": "Primary metric", "value": "Formatted value", "change": "% change with direction"},
    "summary": "3-sentence executive summary",
    "businessImpact": "Clear business impact statement"
  },
  "keyFindings": [
    {
      "title": "Key finding title",
      "insight": "Detailed insight",
      "evidence": "Supporting data",
      "significance": "high|medium|low",
      "actionable": true|false
    }
  ],
  "detailedAnalysis": {
    "dataQuality": {
      "completeness": 95,
      "consistency": 87,
      "accuracy": 92,
      "issues": ["List of issues"],
      "recommendations": ["Quality improvement suggestions"]
    },
    "statisticalFindings": [
      {
        "metric": "Metric name",
        "value": 123.45,
        "significance": "Statistical significance",
        "interpretation": "Business interpretation"
      }
    ],
    "trends": [
      {
        "metric": "Metric name",
        "direction": "increasing|decreasing|stable",
        "strength": 0.85,
        "forecast": "Future prediction"
      }
    ],
    "correlations": [
      {
        "variables": ["var1", "var2"],
        "strength": 0.75,
        "relationship": "Description",
        "businessImplication": "What this means for business"
      }
    ]
  },
  "recommendations": [
    {
      "title": "Recommendation title",
      "description": "Detailed description",
      "priority": "high|medium|low",
      "timeframe": "Timeline",
      "expectedImpact": "Expected business impact",
      "resources": ["Required resources"]
    }
  ]
}

Make insights CEO-ready: clear, actionable, and tied to business outcomes.`

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 3000
    })

    return JSON.parse(response.choices[0]?.message?.content || '{}')
  }

  private async generateVisualizations(analysisResult: PythonAnalysisResult, insights: any, request: AdvancedAnalysisRequest): Promise<VisualizationSpec[]> {
    const prompt = `Create compelling visualizations for a CEO presentation based on these insights.

Analysis: ${JSON.stringify(analysisResult.output, null, 2)}
Insights: ${JSON.stringify(insights, null, 2)}

Generate visualization specifications in this JSON format:
[
  {
    "type": "bar|line|pie|scatter|heatmap",
    "title": "Compelling chart title",
    "data": [{"name": "Category", "value": 123}],
    "config": {
      "xAxis": "field_name",
      "yAxis": "field_name", 
      "colors": ["#2563eb", "#ef4444"],
      "showLegend": true,
      "showTooltip": true
    },
    "insights": ["Key insight from this chart", "Another insight"]
  }
]

Create 3-5 executive-quality visualizations that tell a compelling story.`

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 2000
    })

    return JSON.parse(response.choices[0]?.message?.content || '[]')
  }

  private async generateCEOSlides(insights: any, visualizations: VisualizationSpec[], request: AdvancedAnalysisRequest): Promise<SlideContent[]> {
    const prompt = `Create a CEO-ready presentation structure with detailed slide content.

Insights: ${JSON.stringify(insights, null, 2)}
Visualizations: ${JSON.stringify(visualizations, null, 2)}
Context: ${request.context}

Generate slide content in this JSON format:
[
  {
    "type": "title|executive_summary|key_findings|analysis|trends|recommendations",
    "title": "Slide title",
    "subtitle": "Optional subtitle",
    "content": [
      {
        "type": "text|chart|metric|list",
        "content": "Content or chart config",
        "position": {"x": 80, "y": 120, "width": 640, "height": 200},
        "style": {"fontSize": 18, "fontWeight": "bold", "color": "#1f2937"}
      }
    ],
    "speakerNotes": "Detailed talking points for presenter"
  }
]

Create 5-7 slides that tell a compelling business story. Each slide should be rich with content and executive-ready.`

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 4000
    })

    return JSON.parse(response.choices[0]?.message?.content || '[]')
  }

  private async qualityAssurance(result: AdvancedAnalysisResult, request: AdvancedAnalysisRequest): Promise<AdvancedAnalysisResult> {
    const qaPrompt = `Review this analysis for a CEO presentation and provide quality scores.

Analysis: ${JSON.stringify(result, null, 2)}

Evaluate on:
1. Executive relevance (0-100)
2. Data quality and accuracy (0-100)  
3. Insight depth and actionability (0-100)
4. Presentation readiness (0-100)
5. Business impact clarity (0-100)

Return JSON with:
{
  "qualityScore": overall_score,
  "confidence": confidence_level,
  "improvements": ["Suggested improvements"],
  "strengths": ["Key strengths"]
}`

    const qaResponse = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: qaPrompt }],
      temperature: 0.2,
      max_tokens: 1000
    })

    const qa = JSON.parse(qaResponse.choices[0]?.message?.content || '{}')
    
    return {
      ...result,
      qualityScore: qa.qualityScore || 85,
      confidence: qa.confidence || 80
    }
  }
}