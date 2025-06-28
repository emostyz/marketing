/**
 * Comprehensive AI Solution Integration
 * 
 * This file provides a unified interface for all AI operations with:
 * - OpenAI API error handling and JSON validation
 * - Auth token management for long operations
 * - Slide state preservation
 * - Auto-save with recovery
 */

import { EnhancedOpenAIWrapper, openAIWrapper } from './enhanced-openai-wrapper'
import { authRefreshManager } from '../auth/auth-refresh-manager'
import { useSlideStore } from '../state/slide-state-manager'
import { EnhancedAutoSave } from '../auto-save/enhanced-auto-save'
import { z } from 'zod'

// Unified response type
export interface AIOperationResult<T = any> {
  success: boolean
  data?: T
  error?: string
  metadata?: {
    duration: number
    tokensUsed?: number
    model?: string
    operation?: string
  }
}

// Operation configuration
export interface AIOperationConfig {
  requireAuth?: boolean
  enableAutoSave?: boolean
  preserveState?: boolean
  maxDuration?: number
  retryAttempts?: number
}

/**
 * Comprehensive AI Solution Manager
 */
export class ComprehensiveAISolution {
  private autoSave: EnhancedAutoSave | null = null
  private operationStartTime: number = 0

  constructor() {
    // Initialize auth refresh monitoring
    if (typeof window !== 'undefined') {
      authRefreshManager.startMonitoring()
    }
  }

  /**
   * Initialize for a specific presentation
   */
  async initialize(presentationId: string): Promise<void> {
    // Initialize auto-save
    this.autoSave = new EnhancedAutoSave({
      debounceMs: 2000,
      maxRetries: 5,
      saveOnVisibilityChange: true,
      saveOnBeforeUnload: true,
      enableVersionHistory: true
    })

    this.autoSave.initialize(presentationId, (state) => {
      console.log('Auto-save state:', state.status)
    })

    // Load any existing backup
    const backup = this.autoSave.loadFromLocalStorage()
    if (backup) {
      console.log('Found backup data, consider recovery')
    }
  }

  /**
   * Execute an AI operation with comprehensive error handling
   */
  async executeOperation<T>(
    operation: () => Promise<T>,
    config: AIOperationConfig = {}
  ): Promise<AIOperationResult<T>> {
    const {
      requireAuth = true,
      enableAutoSave = true,
      preserveState = true,
      maxDuration = 5 * 60 * 1000, // 5 minutes
      retryAttempts = 3
    } = config

    this.operationStartTime = Date.now()

    try {
      // Ensure auth token is valid for the operation
      if (requireAuth) {
        const tokenValid = await authRefreshManager.ensureValidTokenForOperation(maxDuration)
        if (!tokenValid) {
          return {
            success: false,
            error: 'Failed to ensure valid authentication token'
          }
        }
      }

      // Execute the operation
      const result = await operation()

      // Auto-save if enabled
      if (enableAutoSave && this.autoSave && preserveState) {
        const slideStore = useSlideStore.getState()
        this.autoSave.registerChange('AI operation completed', {
          title: slideStore.title,
          slides: slideStore.slides,
          metadata: slideStore.metadata
        })
      }

      return {
        success: true,
        data: result,
        metadata: {
          duration: Date.now() - this.operationStartTime,
          operation: 'AI operation'
        }
      }

    } catch (error) {
      console.error('AI operation failed:', error)
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          duration: Date.now() - this.operationStartTime,
          operation: 'AI operation (failed)'
        }
      }
    }
  }

  /**
   * Analyze data with comprehensive error handling
   */
  async analyzeData(
    data: any[],
    context: string,
    userGoals?: string
  ): Promise<AIOperationResult> {
    return this.executeOperation(async () => {
      const messages = [
        {
          role: 'system' as const,
          content: `You are an expert data analyst. Analyze the provided data and generate comprehensive business insights. Always respond in valid JSON format.
          
Context: ${context}
Goals: ${userGoals || 'Generate actionable business insights'}`
        },
        {
          role: 'user' as const,
          content: `Analyze this dataset and provide insights:

Data Summary:
- Records: ${data.length}
- Columns: ${Object.keys(data[0] || {}).join(', ')}
- Sample: ${JSON.stringify(data.slice(0, 3), null, 2)}

Provide structured analysis with insights, trends, and recommendations.`
        }
      ]

      const response = await openAIWrapper.call({
        messages,
        requireJSON: true,
        temperature: 0.3,
        max_tokens: 4000
      })

      if (!response.success) {
        throw new Error(response.error || 'Data analysis failed')
      }

      return response.data
    }, { maxDuration: 2 * 60 * 1000 }) // 2 minutes
  }

  /**
   * Generate charts with error handling
   */
  async generateCharts(
    data: any[],
    insights: any,
    preferences?: any
  ): Promise<AIOperationResult> {
    return this.executeOperation(async () => {
      const messages = [
        {
          role: 'system' as const,
          content: 'You are a data visualization expert. Recommend optimal charts for the given data and insights. Respond in JSON format.'
        },
        {
          role: 'user' as const,
          content: `Create chart recommendations:
Data: ${JSON.stringify(data.slice(0, 5))}
Insights: ${JSON.stringify(insights)}
Preferences: ${JSON.stringify(preferences || {})}

Provide specific chart recommendations with rationale.`
        }
      ]

      const response = await openAIWrapper.call({
        messages,
        requireJSON: true,
        temperature: 0.4,
        max_tokens: 3000
      })

      if (!response.success) {
        throw new Error(response.error || 'Chart generation failed')
      }

      return response.data
    })
  }

  /**
   * Generate slides with state preservation
   */
  async generateSlides(
    data: any,
    insights: any,
    charts: any[]
  ): Promise<AIOperationResult> {
    return this.executeOperation(async () => {
      const messages = [
        {
          role: 'system' as const,
          content: 'You are a presentation expert. Create professional slides that tell a compelling data story. Respond in JSON format with structured slide data.'
        },
        {
          role: 'user' as const,
          content: `Create a presentation:
Data: ${JSON.stringify(data)}
Insights: ${JSON.stringify(insights)}
Charts: ${JSON.stringify(charts)}

Generate executive-ready slides with clear narrative flow.`
        }
      ]

      const response = await openAIWrapper.call({
        messages,
        requireJSON: true,
        temperature: 0.5,
        max_tokens: 6000
      })

      if (!response.success) {
        throw new Error(response.error || 'Slide generation failed')
      }

      // Preserve AI-generated content in state
      const slideStore = useSlideStore.getState()
      
      if (response.data?.slides) {
        response.data.slides.forEach((slide: any, index: number) => {
          slideStore.preserveAIContent(slide.id || `slide_${index}`, {
            originalPrompt: `Generated from data analysis`,
            model: 'gpt-4-turbo-preview',
            insights,
            dataAnalysis: data
          })
        })
      }

      return response.data
    }, { maxDuration: 3 * 60 * 1000 }) // 3 minutes
  }

  /**
   * Run complete AI pipeline
   */
  async runCompletePipeline(
    data: any[],
    context: string,
    userGoals?: string
  ): Promise<AIOperationResult> {
    const pipelineStartTime = Date.now()

    try {
      console.log('🚀 Starting complete AI pipeline...')

      // Step 1: Analyze data
      console.log('📊 Step 1: Analyzing data...')
      const analysisResult = await this.analyzeData(data, context, userGoals)
      
      if (!analysisResult.success) {
        return analysisResult
      }

      // Step 2: Generate charts
      console.log('📈 Step 2: Generating charts...')
      const chartsResult = await this.generateCharts(data, analysisResult.data)
      
      if (!chartsResult.success) {
        return chartsResult
      }

      // Step 3: Generate slides
      console.log('📑 Step 3: Generating slides...')
      const slidesResult = await this.generateSlides(data, analysisResult.data, chartsResult.data?.chartRecommendations || [])
      
      if (!slidesResult.success) {
        return slidesResult
      }

      console.log('✅ Complete AI pipeline finished successfully')

      return {
        success: true,
        data: {
          analysis: analysisResult.data,
          charts: chartsResult.data,
          slides: slidesResult.data,
          pipeline: {
            duration: Date.now() - pipelineStartTime,
            steps: ['analysis', 'charts', 'slides'],
            completedAt: new Date().toISOString()
          }
        },
        metadata: {
          duration: Date.now() - pipelineStartTime,
          operation: 'Complete AI Pipeline'
        }
      }

    } catch (error) {
      console.error('❌ AI pipeline failed:', error)
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Pipeline failed',
        metadata: {
          duration: Date.now() - pipelineStartTime,
          operation: 'Complete AI Pipeline (failed)'
        }
      }
    }
  }

  /**
   * Save current state with enhanced auto-save
   */
  async saveState(force: boolean = false): Promise<boolean> {
    if (!this.autoSave) {
      console.warn('Auto-save not initialized')
      return false
    }

    const slideStore = useSlideStore.getState()
    const presentationData = {
      title: slideStore.title,
      slides: slideStore.slides,
      metadata: slideStore.metadata
    }

    if (force) {
      return this.autoSave.saveImmediate(presentationData)
    } else {
      this.autoSave.registerChange('Manual save', presentationData)
      return true
    }
  }

  /**
   * Recover from failures
   */
  async recover(): Promise<boolean> {
    if (!this.autoSave) {
      return false
    }

    console.log('🔄 Attempting recovery...')
    
    // Check for local backup
    const backup = this.autoSave.loadFromLocalStorage()
    if (backup) {
      console.log('Found local backup, attempting to restore...')
      
      const slideStore = useSlideStore.getState()
      slideStore.setPresentation({
        title: backup.data.title,
        slides: backup.data.slides,
        metadata: backup.data.metadata
      })
      
      // Try to save to database
      return this.autoSave.recoverAndSave(backup.data)
    }

    return false
  }

  /**
   * Get system status
   */
  getStatus(): {
    authStatus: 'valid' | 'expiring' | 'expired' | 'unknown'
    autoSaveStatus: string
    hasBackup: boolean
    lastOperation?: string
  } {
    return {
      authStatus: 'unknown', // Would need to check actual token status
      autoSaveStatus: this.autoSave?.getState().status || 'not_initialized',
      hasBackup: this.autoSave?.getBackupInfo().hasBackup || false,
      lastOperation: this.operationStartTime ? 'recent' : 'none'
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.autoSave) {
      this.autoSave.destroy()
    }
    
    if (typeof window !== 'undefined') {
      authRefreshManager.stopMonitoring()
    }
  }
}

// Export singleton instance
export const aiSolution = new ComprehensiveAISolution()

// Export utility functions
export const initializeAISolution = (presentationId: string) => aiSolution.initialize(presentationId)
export const executeAIOperation = <T>(operation: () => Promise<T>, config?: AIOperationConfig) => 
  aiSolution.executeOperation(operation, config)
export const runAIPipeline = (data: any[], context: string, goals?: string) => 
  aiSolution.runCompletePipeline(data, context, goals)