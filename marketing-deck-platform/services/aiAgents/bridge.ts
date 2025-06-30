/**
 * Python Analysis Bridge Service
 * Orchestrates Python data analysis and manages the AI pipeline
 */

import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs/promises'
import { db } from '@/lib/db/drizzle'
import { presentations, deckProgress, datasetAnalyses, aiInteractions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export interface AnalysisResult {
  basic_statistics: {
    row_count: number
    column_count: number
    numeric_columns: number
    categorical_columns: number
    missing_values_total: number
    missing_percentage: number
  }
  data_quality_score: number
  trends: Array<{
    metric: string
    timeframe: string
    direction: 'growth' | 'decline' | 'stable'
    overall_change_pct: number
    latest_period_change_pct: number
    confidence: number
  }>
  outliers: Array<{
    column: string
    outlier_count: number
    outlier_percentage: number
    extreme_values: {
      highest: number | null
      lowest: number | null
    }
    threshold_bounds: {
      upper: number
      lower: number
    }
  }>
  correlations: Array<{
    variable_x: string
    variable_y: string
    correlation: number
    strength: 'strong' | 'moderate'
    direction: 'positive' | 'negative'
    business_insight: string
  }>
  segments: Array<{
    type: 'categorical' | 'numeric_clusters'
    segment_by?: string
    segments?: Array<{
      name: string
      count: number
      percentage: number
    }>
    cluster_method?: string
    features_used?: string[]
    clusters?: Array<{
      cluster_id: number
      size: number
      percentage: number
      characteristics: Record<string, { mean: number; median: number }>
    }>
  }>
  key_insights: Array<{
    type: 'growth_opportunity' | 'relationship_discovery' | 'market_segmentation'
    title: string
    description: string
    business_impact: 'high' | 'medium' | 'low'
    slide_recommendation: string
  }>
  slide_recommendations: {
    total_slides_suggested: number
    narrative_arc: string
    chart_types_recommended: string[]
  }
  metadata: {
    analysis_timestamp: string
    python_version: string
    pandas_version: string
    has_profiling: boolean
    has_scipy: boolean
  }
}

export interface PipelineProgress {
  deckId: string
  step: 'analyzing' | 'planning' | 'chart_building' | 'composing' | 'done' | 'error'
  message?: string
  metadata?: any
}

class PythonBridge {
  private pythonPath: string
  private scriptPath: string

  constructor() {
    // Try to find Python executable
    this.pythonPath = process.env.PYTHON_PATH || 'python3'
    this.scriptPath = path.join(process.cwd(), 'python', 'insightGenerator.py')
  }

  async checkPythonEnvironment(): Promise<{ available: boolean; error?: string }> {
    return new Promise((resolve) => {
      const python = spawn(this.pythonPath, ['--version'])
      
      python.on('close', (code) => {
        if (code === 0) {
          resolve({ available: true })
        } else {
          resolve({ 
            available: false, 
            error: `Python not available at ${this.pythonPath}. Set PYTHON_PATH environment variable.`
          })
        }
      })

      python.on('error', (error) => {
        resolve({ 
          available: false, 
          error: `Python execution error: ${error.message}`
        })
      })

      // Timeout after 5 seconds
      setTimeout(() => {
        python.kill()
        resolve({ 
          available: false, 
          error: 'Python check timeout'
        })
      }, 5000)
    })
  }

  async analyzeCSV(csvPath: string, qualityThreshold: number = 70): Promise<AnalysisResult> {
    const pythonCheck = await this.checkPythonEnvironment()
    if (!pythonCheck.available) {
      throw new Error(`Python environment not available: ${pythonCheck.error}`)
    }

    return new Promise((resolve, reject) => {
      const args = [
        this.scriptPath,
        csvPath,
        '--output_format=json',
        `--quality_threshold=${qualityThreshold}`
      ]

      console.log(`🐍 Running Python analysis: ${this.pythonPath} ${args.join(' ')}`)
      
      const python = spawn(this.pythonPath, args)
      let stdout = ''
      let stderr = ''

      python.stdout.on('data', (data) => {
        stdout += data.toString()
      })

      python.stderr.on('data', (data) => {
        stderr += data.toString()
      })

      python.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(stdout)
            if (result.error) {
              reject(new Error(`Python analysis error: ${result.error}`))
            } else {
              console.log(`✅ Python analysis completed. Quality score: ${result.data_quality_score}`)
              resolve(result)
            }
          } catch (parseError) {
            reject(new Error(`Failed to parse Python output: ${parseError.message}\nOutput: ${stdout}`))
          }
        } else {
          reject(new Error(`Python script failed with code ${code}\nStderr: ${stderr}\nStdout: ${stdout}`))
        }
      })

      python.on('error', (error) => {
        reject(new Error(`Python execution error: ${error.message}`))
      })

      // Timeout after 60 seconds
      setTimeout(() => {
        python.kill()
        reject(new Error('Python analysis timeout (60s)'))
      }, 60000)
    })
  }

  async downloadDatasetCSV(datasetId: string): Promise<string> {
    // In a real implementation, this would download from S3/Supabase storage
    // For now, we'll assume the CSV is stored locally or fetch from your existing dataset API
    
    try {
      // Try to fetch from your existing dataset API
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/datasets/${datasetId}`)
      const result = await response.json()
      
      if (!result.success || !result.data?.processedData) {
        throw new Error(`Dataset ${datasetId} not found or has no processed data`)
      }

      // Convert JSON data back to CSV for Python analysis
      const csvData = this.jsonToCsv(result.data.processedData)
      const tempPath = path.join('/tmp', `dataset_${datasetId}_${Date.now()}.csv`)
      
      await fs.writeFile(tempPath, csvData)
      console.log(`📄 CSV saved for analysis: ${tempPath}`)
      
      return tempPath
    } catch (error) {
      throw new Error(`Failed to download dataset ${datasetId}: ${error.message}`)
    }
  }

  private jsonToCsv(jsonData: any[]): string {
    if (!jsonData || jsonData.length === 0) {
      throw new Error('No data to convert to CSV')
    }

    const headers = Object.keys(jsonData[0])
    const csvRows = [
      headers.join(','), // Header row
      ...jsonData.map(row => 
        headers.map(header => {
          const value = row[header]
          // Handle values that might contain commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        }).join(',')
      )
    ]

    return csvRows.join('\n')
  }

  async cleanupTempFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath)
      console.log(`🗑️ Cleaned up temp file: ${filePath}`)
    } catch (error) {
      console.warn(`Warning: Could not cleanup temp file ${filePath}: ${error.message}`)
    }
  }
}

// Progress tracking utilities
export async function publishProgress(deckId: string, step: PipelineProgress['step'], message?: string, metadata?: any): Promise<void> {
  try {
    await db.insert(deckProgress).values({
      deck_id: deckId,
      step,
      message,
      metadata: metadata ? JSON.stringify(metadata) : null
    })
    
    console.log(`📊 Pipeline progress: ${deckId} → ${step}${message ? `: ${message}` : ''}`)
  } catch (error) {
    console.error(`Failed to publish progress for ${deckId}:`, error)
  }
}

export async function getLatestProgress(deckId: string): Promise<PipelineProgress | null> {
  try {
    const [latest] = await db
      .select()
      .from(deckProgress)
      .where(eq(deckProgress.deck_id, deckId))
      .orderBy(deckProgress.created_at)
      .limit(1)

    if (!latest) return null

    return {
      deckId,
      step: latest.step as PipelineProgress['step'],
      message: latest.message || undefined,
      metadata: latest.metadata ? JSON.parse(latest.metadata) : undefined
    }
  } catch (error) {
    console.error(`Failed to get progress for ${deckId}:`, error)
    return null
  }
}

// AI interaction tracking
export async function trackAIInteraction(
  deckId: string,
  agentType: string,
  inputTokens: number,
  outputTokens: number,
  model: string,
  success: boolean = true,
  errorMessage?: string,
  executionTimeMs?: number
): Promise<void> {
  try {
    // Simple cost calculation (update with current OpenAI pricing)
    const inputCostPer1k = model.includes('gpt-4') ? 0.03 : 0.0015
    const outputCostPer1k = model.includes('gpt-4') ? 0.06 : 0.002
    const costUsd = ((inputTokens / 1000) * inputCostPer1k) + ((outputTokens / 1000) * outputCostPer1k)

    await db.insert(aiInteractions).values({
      deck_id: deckId,
      agent_type: agentType,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      cost_usd: costUsd,
      model_used: model,
      success,
      error_message: errorMessage,
      execution_time_ms: executionTimeMs
    })

    console.log(`💰 AI interaction tracked: ${agentType} cost $${costUsd.toFixed(4)}`)
  } catch (error) {
    console.error(`Failed to track AI interaction:`, error)
  }
}

// Main bridge function
export async function bridgeToPython(datasetId: string, deckId?: string): Promise<AnalysisResult> {
  const bridge = new PythonBridge()
  let tempFilePath: string | null = null
  
  try {
    if (deckId) {
      await publishProgress(deckId, 'analyzing', 'Downloading dataset for analysis')
    }
    
    // Download and prepare CSV
    tempFilePath = await bridge.downloadDatasetCSV(datasetId)
    
    if (deckId) {
      await publishProgress(deckId, 'analyzing', 'Running Python data analysis')
    }
    
    // Run Python analysis
    const analysis = await bridge.analyzeCSV(tempFilePath)
    
    // Store analysis in database
    await db.insert(datasetAnalyses).values({
      dataset_id: datasetId,
      analysis_type: 'pandas_profile',
      analysis_data: analysis,
      quality_score: analysis.data_quality_score
    })

    if (deckId) {
      // Update presentation with analysis summary
      await db.update(presentations)
        .set({ 
          analysis_summary: analysis 
        })
        .where(eq(presentations.id, deckId))
      
      await publishProgress(deckId, 'analyzing', 'Analysis complete', { 
        qualityScore: analysis.data_quality_score,
        insightsCount: analysis.key_insights.length
      })
    }

    console.log(`✅ Analysis completed for dataset ${datasetId}. Quality: ${analysis.data_quality_score}/100`)
    
    return analysis

  } catch (error) {
    if (deckId) {
      await publishProgress(deckId, 'error', `Analysis failed: ${error.message}`)
    }
    throw error
  } finally {
    // Cleanup temp file
    if (tempFilePath) {
      await bridge.cleanupTempFile(tempFilePath)
    }
  }
}

export { PythonBridge }