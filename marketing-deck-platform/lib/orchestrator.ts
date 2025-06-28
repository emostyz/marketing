/**
 * AI Pipeline Orchestrator
 * Chains the 5-step AI pipeline: Data Analysis → Outline → Styling → Charts → QA
 */

import { analyzeDataAgent } from './agents/analyze-data-agent'
import { generateOutlineAgent } from './agents/generate-outline-agent'
import { styleSlidesAgent } from './agents/style-slides-agent'
import { generateChartsAgent } from './agents/generate-charts-agent'
import { qaDeckAgent } from './agents/qa-deck-agent'

interface PipelineInput {
  deckId: string
  csvData: any[]
  context?: {
    businessGoals?: string[]
    industry?: string
    timeframe?: string
    audience?: string
    presentationType?: string
    stylePreferences?: any
  }
}

interface PipelineStep {
  step: number
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  startTime?: Date
  endTime?: Date
  error?: string
  result?: any
}

interface PipelineResult {
  deckId: string
  status: 'success' | 'failed'
  finalDeckJson: any
  steps: PipelineStep[]
  metadata: {
    startTime: Date
    endTime: Date
    totalDuration: number
    dataRows: number
    slidesGenerated: number
    qualityScore: number
  }
}

// Supabase client for storing intermediate results
async function saveIntermediateResult(deckId: string, step: string, data: any) {
  // TODO: Implement Supabase storage
  console.log(`💾 Saving ${step} results for deck ${deckId}`)
  
  // For now, store in memory or local storage
  if (typeof window !== 'undefined') {
    localStorage.setItem(`pipeline_${deckId}_${step}`, JSON.stringify({
      data,
      timestamp: new Date().toISOString()
    }))
  }
}

async function loadIntermediateResult(deckId: string, step: string) {
  // TODO: Implement Supabase loading
  console.log(`📖 Loading ${step} results for deck ${deckId}`)
  
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(`pipeline_${deckId}_${step}`)
    return stored ? JSON.parse(stored).data : null
  }
  return null
}

// Retry logic for transient failures
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      // Check if error is retryable (network, rate limit, temporary OpenAI issues)
      const isRetryable = error instanceof Error && (
        error.message.includes('network') ||
        error.message.includes('timeout') ||
        error.message.includes('rate limit') ||
        error.message.includes('503') ||
        error.message.includes('502')
      )
      
      if (!isRetryable || attempt === maxRetries) {
        throw error
      }
      
      console.log(`⚠️ Attempt ${attempt} failed, retrying in ${delay}ms:`, error.message)
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }
  
  throw lastError!
}

export async function runPipeline(input: PipelineInput): Promise<PipelineResult> {
  const startTime = new Date()
  const steps: PipelineStep[] = [
    { step: 1, name: 'Data Analysis', status: 'pending' },
    { step: 2, name: 'Outline Generation', status: 'pending' },
    { step: 3, name: 'Slide Styling', status: 'pending' },
    { step: 4, name: 'Chart Generation', status: 'pending' },
    { step: 5, name: 'Quality Assurance', status: 'pending' }
  ]
  
  let finalResult: any = null
  
  try {
    console.log(`🚀 Starting AI pipeline for deck ${input.deckId}`)
    console.log(`📊 Processing ${input.csvData.length} rows of data`)
    
    // Step 1: Data Analysis
    steps[0].status = 'running'
    steps[0].startTime = new Date()
    
    const analysisResult = await retryOperation(async () => {
      return await analyzeDataAgent({
        csvData: input.csvData,
        context: input.context
      })
    })
    
    steps[0].status = 'completed'
    steps[0].endTime = new Date()
    steps[0].result = analysisResult
    await saveIntermediateResult(input.deckId, 'analysis', analysisResult)
    
    console.log(`✅ Step 1 completed: Found ${analysisResult.insights.length} insights`)
    
    // Step 2: Outline Generation
    steps[1].status = 'running'
    steps[1].startTime = new Date()
    
    const outlineResult = await retryOperation(async () => {
      return await generateOutlineAgent({
        analysisData: analysisResult,
        context: {
          audience: input.context?.audience,
          presentation_type: input.context?.presentationType,
          businessGoals: input.context?.businessGoals
        }
      })
    })
    
    steps[1].status = 'completed'
    steps[1].endTime = new Date()
    steps[1].result = outlineResult
    await saveIntermediateResult(input.deckId, 'outline', outlineResult)
    
    console.log(`✅ Step 2 completed: Generated ${outlineResult.slides.length} slide outline`)
    
    // Step 3: Slide Styling
    steps[2].status = 'running'
    steps[2].startTime = new Date()
    
    const styledResult = await retryOperation(async () => {
      return await styleSlidesAgent({
        slideOutline: outlineResult,
        stylePreferences: input.context?.stylePreferences
      })
    })
    
    steps[2].status = 'completed'
    steps[2].endTime = new Date()
    steps[2].result = styledResult
    await saveIntermediateResult(input.deckId, 'styled', styledResult)
    
    console.log(`✅ Step 3 completed: Applied ${styledResult.theme.name} theme`)
    
    // Step 4: Chart Generation
    steps[3].status = 'running'
    steps[3].startTime = new Date()
    
    const chartsResult = await retryOperation(async () => {
      return await generateChartsAgent({
        styledSlides: styledResult.styledSlides,
        csvData: input.csvData
      })
    })
    
    steps[3].status = 'completed'
    steps[3].endTime = new Date()
    steps[3].result = chartsResult
    await saveIntermediateResult(input.deckId, 'charts', chartsResult)
    
    console.log(`✅ Step 4 completed: Generated ${chartsResult.chartSummary.totalCharts} charts`)
    
    // Step 5: Quality Assurance
    steps[4].status = 'running'
    steps[4].startTime = new Date()
    
    const qaResult = await retryOperation(async () => {
      return await qaDeckAgent({
        finalDeck: {
          slidesWithCharts: chartsResult.slidesWithCharts,
          metadata: {
            deckId: input.deckId,
            generatedAt: new Date().toISOString(),
            pipeline: 'ai-orchestrator-v1'
          }
        }
      })
    })
    
    steps[4].status = 'completed'
    steps[4].endTime = new Date()
    steps[4].result = qaResult
    await saveIntermediateResult(input.deckId, 'qa', qaResult)
    
    console.log(`✅ Step 5 completed: QA score ${qaResult.qualityReport.overallScore}%`)
    
    // Compile final result
    finalResult = {
      deckId: input.deckId,
      presentation: {
        title: outlineResult.presentation.title,
        subtitle: outlineResult.presentation.subtitle,
        slides: qaResult.approvedDeck.slidesWithCharts,
        metadata: qaResult.metadata,
        theme: styledResult.theme,
        qualityReport: qaResult.qualityReport
      },
      pipeline: {
        steps: steps,
        analysisInsights: analysisResult.insights,
        recommendations: qaResult.recommendations
      }
    }
    
    const endTime = new Date()
    console.log(`🎉 Pipeline completed successfully in ${endTime.getTime() - startTime.getTime()}ms`)
    
    return {
      deckId: input.deckId,
      status: 'success',
      finalDeckJson: finalResult,
      steps,
      metadata: {
        startTime,
        endTime,
        totalDuration: endTime.getTime() - startTime.getTime(),
        dataRows: input.csvData.length,
        slidesGenerated: qaResult.approvedDeck.slidesWithCharts.length,
        qualityScore: qaResult.qualityReport.overallScore
      }
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`❌ Pipeline failed:`, errorMessage)
    
    // Mark current step as failed
    const currentStep = steps.find(s => s.status === 'running')
    if (currentStep) {
      currentStep.status = 'failed'
      currentStep.endTime = new Date()
      currentStep.error = errorMessage
    }
    
    // Save failure state
    await saveIntermediateResult(input.deckId, 'error', {
      error: errorMessage,
      steps,
      failedAt: new Date().toISOString()
    })
    
    return {
      deckId: input.deckId,
      status: 'failed',
      finalDeckJson: null,
      steps,
      metadata: {
        startTime,
        endTime: new Date(),
        totalDuration: new Date().getTime() - startTime.getTime(),
        dataRows: input.csvData.length,
        slidesGenerated: 0,
        qualityScore: 0
      }
    }
  }
}

// Helper function to get pipeline status
export async function getPipelineStatus(deckId: string): Promise<PipelineStep[] | null> {
  try {
    const errorData = await loadIntermediateResult(deckId, 'error')
    if (errorData) {
      return errorData.steps
    }
    
    const qaData = await loadIntermediateResult(deckId, 'qa')
    if (qaData) {
      return [
        { step: 1, name: 'Data Analysis', status: 'completed' },
        { step: 2, name: 'Outline Generation', status: 'completed' },
        { step: 3, name: 'Slide Styling', status: 'completed' },
        { step: 4, name: 'Chart Generation', status: 'completed' },
        { step: 5, name: 'Quality Assurance', status: 'completed' }
      ]
    }
    
    // Check other steps...
    return null
  } catch (error) {
    console.error('Error getting pipeline status:', error)
    return null
  }
}

// Helper function to resume failed pipeline
export async function resumePipeline(deckId: string, input: PipelineInput): Promise<PipelineResult> {
  console.log(`🔄 Attempting to resume pipeline for deck ${deckId}`)
  
  // Load the last successful step and continue from there
  // For now, just restart the pipeline
  return runPipeline(input)
}