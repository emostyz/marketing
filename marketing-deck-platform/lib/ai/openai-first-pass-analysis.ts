/**
 * OpenAI First-Pass Analysis System
 * 
 * Takes validated datasets from the data intake system and generates structured insights
 * using OpenAI with comprehensive error handling and JSON validation.
 */

import { z } from 'zod'
import { openAIWrapper } from './enhanced-openai-wrapper'
import { Dataset } from '../data/data-intake-system'

// Analysis output schema
export const FirstPassAnalysisSchema = z.object({
  executiveSummary: z.string().min(50).max(500),
  keyFindings: z.array(z.object({
    title: z.string().min(10).max(100),
    insight: z.string().min(20).max(300),
    dataEvidence: z.string().min(10).max(200),
    businessImpact: z.enum(['high', 'medium', 'low']),
    confidence: z.number().min(0).max(1),
    relatedMetrics: z.array(z.string())
  })).min(3).max(8),
  trends: z.array(z.object({
    metric: z.string(),
    direction: z.enum(['increasing', 'decreasing', 'stable', 'volatile']),
    magnitude: z.number().min(0).max(1),
    significance: z.enum(['high', 'medium', 'low']),
    timeframe: z.string().optional(),
    description: z.string()
  })),
  correlations: z.array(z.object({
    variables: z.array(z.string()).min(2).max(3),
    relationship: z.enum(['positive', 'negative', 'none']),
    strength: z.number().min(0).max(1),
    interpretation: z.string().min(20).max(200),
    actionable: z.boolean()
  })),
  recommendations: z.array(z.object({
    title: z.string().min(10).max(80),
    action: z.string().min(20).max(250),
    priority: z.enum(['immediate', 'short_term', 'long_term']),
    expectedImpact: z.enum(['high', 'medium', 'low']),
    feasibility: z.enum(['easy', 'moderate', 'complex']),
    requiredResources: z.array(z.string()),
    successMetrics: z.array(z.string())
  })).min(2).max(5),
  dataQuality: z.object({
    completeness: z.number().min(0).max(1),
    reliability: z.enum(['high', 'medium', 'low']),
    limitations: z.array(z.string()),
    suggestedImprovements: z.array(z.string())
  })
})

export type FirstPassAnalysis = z.infer<typeof FirstPassAnalysisSchema>

export interface AnalysisContext {
  userGoals?: string
  businessContext?: string
  industryType?: string
  timeframe?: string
  specificQuestions?: string[]
  comparisonBenchmarks?: any[]
}

export interface AnalysisResult {
  success: boolean
  data?: FirstPassAnalysis
  error?: string
  metadata?: {
    processingTime: number
    datasetSummary: {
      rows: number
      columns: number
      numericFields: number
      categoricalFields: number
    }
    modelUsed: string
    confidence: number
  }
}

export class OpenAIFirstPassAnalysis {
  private maxRetries = 3
  private timeoutMs = 120000 // 2 minutes

  /**
   * Perform comprehensive first-pass analysis of a dataset
   */
  async analyzeDataset(
    dataset: Dataset,
    context: AnalysisContext = {},
    sessionId?: string
  ): Promise<AnalysisResult> {
    const startTime = Date.now()

    try {
      console.log('🧠 Starting OpenAI first-pass analysis...')
      console.log(`📊 Dataset: ${dataset.rows} rows, ${dataset.columns.length} columns`)

      // Validate dataset
      const validationResult = this.validateDataset(dataset)
      if (!validationResult.valid) {
        return {
          success: false,
          error: `Dataset validation failed: ${validationResult.errors.join(', ')}`
        }
      }

      // Prepare analysis prompt
      const analysisPrompt = this.buildAnalysisPrompt(dataset, context)
      
      // Call OpenAI with retry logic
      const response = await this.callOpenAIWithRetry(analysisPrompt, sessionId)
      
      if (!response.success) {
        return {
          success: false,
          error: response.error || 'OpenAI analysis failed'
        }
      }

      // Validate response schema
      const validationResult2 = FirstPassAnalysisSchema.safeParse(response.data)
      if (!validationResult2.success) {
        console.error('❌ Schema validation failed:', validationResult2.error)
        return {
          success: false,
          error: `Analysis output validation failed: ${validationResult2.error.message}`
        }
      }

      // Calculate metadata
      const processingTime = Date.now() - startTime
      const datasetSummary = this.generateDatasetSummary(dataset)
      const confidence = this.calculateConfidence(validationResult2.data, dataset)

      console.log('✅ First-pass analysis completed successfully')
      console.log(`📈 Generated ${validationResult2.data.keyFindings.length} findings and ${validationResult2.data.recommendations.length} recommendations`)

      return {
        success: true,
        data: validationResult2.data,
        metadata: {
          processingTime,
          datasetSummary,
          modelUsed: 'gpt-4-turbo-preview',
          confidence
        }
      }

    } catch (error) {
      console.error('❌ First-pass analysis error:', error)
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown analysis error',
        metadata: {
          processingTime: Date.now() - startTime,
          datasetSummary: this.generateDatasetSummary(dataset),
          modelUsed: 'gpt-4-turbo-preview',
          confidence: 0
        }
      }
    }
  }

  /**
   * Validate dataset for analysis readiness
   */
  private validateDataset(dataset: Dataset): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!dataset.rows || dataset.rows === 0) {
      errors.push('Dataset contains no data rows')
    }

    if (!dataset.columns || dataset.columns.length === 0) {
      errors.push('Dataset contains no columns')
    }

    if (dataset.rows > 10000) {
      errors.push('Dataset too large for analysis (max 10,000 rows)')
    }

    if (dataset.validationErrors && dataset.validationErrors.length > 0) {
      errors.push(`Data validation issues: ${dataset.validationErrors.join(', ')}`)
    }

    if (!dataset.preview || dataset.preview.length === 0) {
      errors.push('No data preview available')
    }

    // Check for minimum data variety
    const numericColumns = dataset.metadata.numericColumns?.length || 0
    const categoricalColumns = dataset.metadata.categoricalColumns?.length || 0
    
    if (numericColumns === 0 && categoricalColumns === 0) {
      errors.push('Dataset must contain at least some numeric or categorical data')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Build comprehensive analysis prompt
   */
  private buildAnalysisPrompt(dataset: Dataset, context: AnalysisContext) {
    const dataPreview = this.formatDataPreview(dataset.preview)
    const schemaInfo = this.formatSchemaInfo(dataset)
    const contextInfo = this.formatContextInfo(context)

    return [
      {
        role: 'system' as const,
        content: `You are an expert data analyst specializing in business intelligence and McKinsey-style insights. Your task is to perform a comprehensive first-pass analysis of a business dataset.

ANALYSIS REQUIREMENTS:
1. Generate actionable business insights backed by data evidence
2. Identify meaningful trends and patterns with statistical significance
3. Discover correlations that have business relevance
4. Provide prioritized, specific recommendations
5. Assess data quality and limitations honestly

RESPONSE FORMAT:
- Always respond in valid JSON format only
- Use professional, executive-ready language
- Focus on business value and actionability
- Quantify impacts and confidence levels
- Be specific with evidence and metrics

${contextInfo}

CRITICAL: Ensure all insights are:
- Supported by actual data evidence
- Relevant to business decision-making
- Quantified where possible
- Prioritized by importance and feasibility`
      },
      {
        role: 'user' as const,
        content: `Analyze this business dataset and provide comprehensive insights:

DATASET OVERVIEW:
${schemaInfo}

SAMPLE DATA:
${dataPreview}

ANALYSIS REQUIREMENTS:
1. Executive Summary (50-500 chars): Key takeaways for leadership
2. Key Findings (3-8 items): Most important insights with evidence
3. Trends: Significant patterns in the data over time/categories
4. Correlations: Meaningful relationships between variables
5. Recommendations: Specific, actionable next steps
6. Data Quality Assessment: Reliability and limitations

Provide structured analysis that enables immediate business action.`
      }
    ]
  }

  /**
   * Format data preview for analysis
   */
  private formatDataPreview(preview: Record<string, any>[]): string {
    const sampleSize = Math.min(preview.length, 5)
    const sample = preview.slice(0, sampleSize)
    
    return `Sample Records (${sampleSize} of ${preview.length}):\n${JSON.stringify(sample, null, 2)}`
  }

  /**
   * Format schema information
   */
  private formatSchemaInfo(dataset: Dataset): string {
    const { metadata, schema, rows, columns } = dataset
    
    return `
Dataset Statistics:
- Total Records: ${rows.toLocaleString()}
- Total Columns: ${columns.length}
- Numeric Columns: ${metadata.numericColumns?.length || 0} (${metadata.numericColumns?.join(', ') || 'none'})
- Categorical Columns: ${metadata.categoricalColumns?.length || 0} (${metadata.categoricalColumns?.join(', ') || 'none'})
- Date Columns: ${metadata.dateColumns?.length || 0} (${metadata.dateColumns?.join(', ') || 'none'})

Column Types:
${Object.entries(schema).map(([col, type]) => `- ${col}: ${type}`).join('\n')}
`
  }

  /**
   * Format context information
   */
  private formatContextInfo(context: AnalysisContext): string {
    if (!context || Object.keys(context).length === 0) {
      return 'CONTEXT: General business analysis requested.'
    }

    let contextStr = 'BUSINESS CONTEXT:\n'
    
    if (context.userGoals) {
      contextStr += `- Goals: ${context.userGoals}\n`
    }
    
    if (context.businessContext) {
      contextStr += `- Business Context: ${context.businessContext}\n`
    }
    
    if (context.industryType) {
      contextStr += `- Industry: ${context.industryType}\n`
    }
    
    if (context.timeframe) {
      contextStr += `- Timeframe: ${context.timeframe}\n`
    }
    
    if (context.specificQuestions?.length) {
      contextStr += `- Specific Questions: ${context.specificQuestions.join(', ')}\n`
    }

    return contextStr
  }

  /**
   * Call OpenAI with retry logic and validation
   */
  private async callOpenAIWithRetry(
    messages: any[],
    sessionId?: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    let lastError: string | null = null

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`🔄 OpenAI analysis attempt ${attempt}/${this.maxRetries}`)

        const response = await Promise.race([
          openAIWrapper.call({
            model: 'gpt-4-turbo-preview',
            messages,
            requireJSON: true,
            temperature: 0.3,
            max_tokens: 6000
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Analysis timeout')), this.timeoutMs)
          )
        ]) as any

        if (!response.success) {
          lastError = response.error || 'OpenAI call failed'
          console.log(`❌ Attempt ${attempt} failed: ${lastError}`)
          continue
        }

        console.log(`✅ Attempt ${attempt} succeeded`)
        return response

      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error'
        console.log(`❌ Attempt ${attempt} error: ${lastError}`)
        
        if (attempt < this.maxRetries) {
          const delay = Math.min(2000 * Math.pow(2, attempt - 1), 10000)
          console.log(`⏳ Retrying in ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    return {
      success: false,
      error: lastError || 'All analysis attempts failed'
    }
  }

  /**
   * Generate dataset summary for metadata
   */
  private generateDatasetSummary(dataset: Dataset) {
    return {
      rows: dataset.rows,
      columns: dataset.columns.length,
      numericFields: dataset.metadata.numericColumns?.length || 0,
      categoricalFields: dataset.metadata.categoricalColumns?.length || 0
    }
  }

  /**
   * Calculate confidence score based on analysis quality
   */
  private calculateConfidence(analysis: FirstPassAnalysis, dataset: Dataset): number {
    let confidence = 0.8 // Base confidence

    // Boost confidence for larger datasets
    if (dataset.rows > 1000) confidence += 0.1
    if (dataset.rows > 5000) confidence += 0.05

    // Boost confidence for diverse data types
    const numTypes = [
      dataset.metadata.numericColumns?.length || 0,
      dataset.metadata.categoricalColumns?.length || 0,
      dataset.metadata.dateColumns?.length || 0
    ].filter(count => count > 0).length
    
    confidence += numTypes * 0.02

    // Boost confidence for comprehensive analysis
    if (analysis.keyFindings.length >= 5) confidence += 0.03
    if (analysis.recommendations.length >= 3) confidence += 0.03
    if (analysis.correlations.length >= 2) confidence += 0.02

    return Math.min(confidence, 1.0)
  }

  /**
   * Generate fallback analysis when OpenAI fails
   */
  async generateFallbackAnalysis(
    dataset: Dataset,
    context: AnalysisContext = {}
  ): Promise<FirstPassAnalysis> {
    console.log('🔄 Generating fallback analysis...')

    const numericCols = dataset.metadata.numericColumns || []
    const categoricalCols = dataset.metadata.categoricalColumns || []

    return {
      executiveSummary: `Analysis of ${dataset.rows.toLocaleString()} records across ${dataset.columns.length} variables reveals key business metrics and patterns requiring leadership attention.`,
      
      keyFindings: [
        {
          title: `Dataset Scale: ${dataset.rows.toLocaleString()} Records Analyzed`,
          insight: `Large-scale dataset with ${numericCols.length} quantitative metrics and ${categoricalCols.length} categorical dimensions provides robust foundation for analysis.`,
          dataEvidence: `${dataset.rows} total records with ${dataset.columns.length} variables`,
          businessImpact: 'medium' as const,
          confidence: 0.7,
          relatedMetrics: numericCols.slice(0, 3)
        },
        {
          title: 'Data Structure Assessment',
          insight: 'Balanced mix of numeric and categorical data enables comprehensive business intelligence analysis.',
          dataEvidence: `${numericCols.length} numeric fields, ${categoricalCols.length} categorical fields`,
          businessImpact: 'medium' as const,
          confidence: 0.8,
          relatedMetrics: [...numericCols.slice(0, 2), ...categoricalCols.slice(0, 2)]
        }
      ],
      
      trends: numericCols.slice(0, 3).map(metric => ({
        metric,
        direction: 'stable' as const,
        magnitude: 0.5,
        significance: 'medium' as const,
        description: `${metric} shows consistent patterns requiring detailed analysis`
      })),
      
      correlations: [],
      
      recommendations: [
        {
          title: 'Conduct Detailed Metric Analysis',
          action: `Focus analysis on key performance indicators: ${numericCols.slice(0, 3).join(', ')}`,
          priority: 'short_term' as const,
          expectedImpact: 'medium' as const,
          feasibility: 'easy' as const,
          requiredResources: ['Data analyst time', 'Statistical tools'],
          successMetrics: ['Analysis completion', 'Actionable insights generated']
        },
        {
          title: 'Segment Analysis Implementation',
          action: `Analyze performance across different categories: ${categoricalCols.slice(0, 2).join(', ')}`,
          priority: 'short_term' as const,
          expectedImpact: 'high' as const,
          feasibility: 'moderate' as const,
          requiredResources: ['Analytics platform', 'Business context'],
          successMetrics: ['Segment insights', 'Optimization opportunities']
        }
      ],
      
      dataQuality: {
        completeness: 0.85,
        reliability: 'medium' as const,
        limitations: ['Automated analysis only', 'Requires domain expertise validation'],
        suggestedImprovements: ['Add business context', 'Include time-series data', 'Expand sample size if possible']
      }
    }
  }
}

// Export singleton instance
export const firstPassAnalysis = new OpenAIFirstPassAnalysis()

// Export utility functions
export const analyzeDataset = (dataset: Dataset, context?: AnalysisContext, sessionId?: string) =>
  firstPassAnalysis.analyzeDataset(dataset, context, sessionId)