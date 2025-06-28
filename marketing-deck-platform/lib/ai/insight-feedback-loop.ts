/**
 * Insight Feedback Loop System
 * 
 * Manages the iterative refinement of AI insights based on user feedback
 * and generates slide structures for approved insights.
 */

import { z } from 'zod'
import { openAIWrapper } from './enhanced-openai-wrapper'
import { type FirstPassAnalysis } from './openai-first-pass-analysis'

// Feedback schemas
export const UserFeedbackSchema = z.object({
  approved: z.boolean(),
  findingsFeedback: z.record(z.object({
    approved: z.boolean(),
    comment: z.string().optional()
  })),
  recommendationsFeedback: z.record(z.object({
    approved: z.boolean(),
    comment: z.string().optional()
  })),
  overallComment: z.string().optional(),
  suggestedChanges: z.array(z.string()).optional()
})

export const SlideStructureSchema = z.object({
  presentationTitle: z.string().min(10).max(100),
  slides: z.array(z.object({
    id: z.string(),
    type: z.enum(['title', 'executive_summary', 'key_finding', 'trend_analysis', 'recommendation', 'conclusion']),
    title: z.string().min(5).max(100),
    sequence: z.number(),
    mainContent: z.string().min(20).max(500),
    supportingPoints: z.array(z.string()).max(5),
    visualElements: z.array(z.object({
      type: z.enum(['chart', 'table', 'callout', 'metric_highlight']),
      content: z.string(),
      position: z.enum(['left', 'right', 'center', 'full_width']),
      priority: z.enum(['high', 'medium', 'low'])
    })),
    speakerNotes: z.string().optional(),
    transitionToNext: z.string().optional()
  })).min(3).max(15),
  narrativeFlow: z.object({
    introduction: z.string(),
    keyMessage: z.string(),
    supportingEvidence: z.array(z.string()),
    callToAction: z.string(),
    executiveTakeaway: z.string()
  }),
  recommendedDuration: z.number().min(5).max(60), // minutes
  targetAudience: z.string(),
  keyMetrics: z.array(z.string())
})

export type UserFeedback = z.infer<typeof UserFeedbackSchema>
export type SlideStructure = z.infer<typeof SlideStructureSchema>

export interface FeedbackIteration {
  iterationNumber: number
  originalAnalysis: FirstPassAnalysis
  userFeedback: UserFeedback
  refinedAnalysis?: FirstPassAnalysis
  slideStructure?: SlideStructure
  timestamp: Date
  processingTime: number
  success: boolean
  errors?: string[]
}

export interface FeedbackLoopResult {
  success: boolean
  finalAnalysis?: FirstPassAnalysis
  slideStructure?: SlideStructure
  iterations: FeedbackIteration[]
  error?: string
  metadata?: {
    totalProcessingTime: number
    iterationsCount: number
    approvalRate: number
    confidenceScore: number
  }
}

export class InsightFeedbackLoop {
  private maxIterations = 3
  private iterationHistory: FeedbackIteration[] = []

  /**
   * Process user feedback and generate refined analysis with slide structure
   */
  async processFeedbackAndGenerateStructure(
    originalAnalysis: FirstPassAnalysis,
    userFeedback: UserFeedback,
    sessionId: string,
    datasetContext?: any
  ): Promise<FeedbackLoopResult> {
    const startTime = Date.now()
    
    try {
      console.log('🔄 Starting feedback loop processing...')
      console.log(`👤 User approval: ${userFeedback.approved}`)
      
      // Validate feedback
      const feedbackValidation = UserFeedbackSchema.safeParse(userFeedback)
      if (!feedbackValidation.success) {
        return {
          success: false,
          error: `Invalid feedback format: ${feedbackValidation.error.message}`,
          iterations: []
        }
      }

      let currentAnalysis = originalAnalysis
      let finalSlideStructure: SlideStructure | undefined

      // If overall approved, proceed to slide structure generation
      if (userFeedback.approved) {
        console.log('✅ Analysis approved, generating slide structure...')
        
        const slideStructureResult = await this.generateSlideStructure(
          currentAnalysis,
          userFeedback,
          sessionId,
          datasetContext
        )

        if (slideStructureResult.success && slideStructureResult.data) {
          finalSlideStructure = slideStructureResult.data
          console.log(`📑 Generated ${finalSlideStructure.slides.length} slides`)
        } else {
          console.error('❌ Slide structure generation failed:', slideStructureResult.error)
        }

        // Record successful iteration
        this.iterationHistory.push({
          iterationNumber: this.iterationHistory.length + 1,
          originalAnalysis,
          userFeedback,
          refinedAnalysis: currentAnalysis,
          slideStructure: finalSlideStructure,
          timestamp: new Date(),
          processingTime: Date.now() - startTime,
          success: true
        })

      } else {
        // Analysis not approved, need refinement
        console.log('🔄 Analysis not approved, refining based on feedback...')
        
        const refinementResult = await this.refineAnalysisBasedOnFeedback(
          currentAnalysis,
          userFeedback,
          sessionId
        )

        if (refinementResult.success && refinementResult.data) {
          currentAnalysis = refinementResult.data
          console.log('✅ Analysis refined successfully')

          // Generate slide structure for refined analysis
          const slideStructureResult = await this.generateSlideStructure(
            currentAnalysis,
            userFeedback,
            sessionId,
            datasetContext
          )

          if (slideStructureResult.success && slideStructureResult.data) {
            finalSlideStructure = slideStructureResult.data
          }

          // Record iteration
          this.iterationHistory.push({
            iterationNumber: this.iterationHistory.length + 1,
            originalAnalysis,
            userFeedback,
            refinedAnalysis: currentAnalysis,
            slideStructure: finalSlideStructure,
            timestamp: new Date(),
            processingTime: Date.now() - startTime,
            success: true
          })

        } else {
          // Record failed iteration
          this.iterationHistory.push({
            iterationNumber: this.iterationHistory.length + 1,
            originalAnalysis,
            userFeedback,
            timestamp: new Date(),
            processingTime: Date.now() - startTime,
            success: false,
            errors: [refinementResult.error || 'Refinement failed']
          })

          return {
            success: false,
            error: refinementResult.error || 'Failed to refine analysis',
            iterations: this.iterationHistory
          }
        }
      }

      // Calculate metadata
      const metadata = this.calculateFeedbackMetadata()

      return {
        success: true,
        finalAnalysis: currentAnalysis,
        slideStructure: finalSlideStructure,
        iterations: this.iterationHistory,
        metadata: {
          ...metadata,
          totalProcessingTime: Date.now() - startTime
        }
      }

    } catch (error) {
      console.error('❌ Feedback loop processing error:', error)
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Feedback processing failed',
        iterations: this.iterationHistory,
        metadata: {
          totalProcessingTime: Date.now() - startTime,
          iterationsCount: this.iterationHistory.length,
          approvalRate: 0,
          confidenceScore: 0
        }
      }
    }
  }

  /**
   * Refine analysis based on user feedback
   */
  private async refineAnalysisBasedOnFeedback(
    originalAnalysis: FirstPassAnalysis,
    feedback: UserFeedback,
    sessionId: string
  ): Promise<{ success: boolean; data?: FirstPassAnalysis; error?: string }> {
    try {
      // Build refinement prompt based on feedback
      const refinementPrompt = this.buildRefinementPrompt(originalAnalysis, feedback)

      const response = await openAIWrapper.call({
        model: 'gpt-4-turbo-preview',
        messages: refinementPrompt,
        requireJSON: true,
        temperature: 0.3,
        max_tokens: 6000
      })

      if (!response.success) {
        return {
          success: false,
          error: response.error || 'OpenAI refinement call failed'
        }
      }

      // Validate refined analysis against schema
      // Note: We'd need to import FirstPassAnalysisSchema here or create a validation function
      
      return {
        success: true,
        data: response.data
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refinement failed'
      }
    }
  }

  /**
   * Generate slide structure from approved analysis
   */
  private async generateSlideStructure(
    analysis: FirstPassAnalysis,
    feedback: UserFeedback,
    sessionId: string,
    datasetContext?: any
  ): Promise<{ success: boolean; data?: SlideStructure; error?: string }> {
    try {
      console.log('📑 Generating slide structure...')

      // Extract approved findings and recommendations
      const approvedFindings = this.extractApprovedFindings(analysis, feedback)
      const approvedRecommendations = this.extractApprovedRecommendations(analysis, feedback)

      // Build slide structure prompt
      const structurePrompt = this.buildSlideStructurePrompt(
        analysis,
        approvedFindings,
        approvedRecommendations,
        feedback,
        datasetContext
      )

      const response = await openAIWrapper.call({
        model: 'gpt-4-turbo-preview',
        messages: structurePrompt,
        requireJSON: true,
        temperature: 0.4,
        max_tokens: 8000
      })

      if (!response.success) {
        return {
          success: false,
          error: response.error || 'Slide structure generation failed'
        }
      }

      // Validate slide structure
      const validationResult = SlideStructureSchema.safeParse(response.data)
      if (!validationResult.success) {
        console.error('❌ Slide structure validation failed:', validationResult.error)
        return {
          success: false,
          error: `Invalid slide structure: ${validationResult.error.message}`
        }
      }

      return {
        success: true,
        data: validationResult.data
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Slide structure generation failed'
      }
    }
  }

  /**
   * Build refinement prompt based on user feedback
   */
  private buildRefinementPrompt(analysis: FirstPassAnalysis, feedback: UserFeedback) {
    const rejectedFindings = this.extractRejectedFindings(analysis, feedback)
    const rejectedRecommendations = this.extractRejectedRecommendations(analysis, feedback)
    const suggestedChanges = feedback.suggestedChanges || []

    return [
      {
        role: 'system' as const,
        content: `You are refining a business analysis based on user feedback. The user has provided specific feedback about findings and recommendations that need improvement. Always respond in valid JSON format only.

REFINEMENT REQUIREMENTS:
1. Address all rejected findings and recommendations
2. Incorporate user-suggested changes
3. Maintain the same overall structure and schema
4. Improve confidence and evidence for weak insights
5. Ensure all new insights are data-backed and actionable

Focus on business value and executive-level insights.`
      },
      {
        role: 'user' as const,
        content: `Refine this analysis based on user feedback:

ORIGINAL ANALYSIS:
${JSON.stringify(analysis, null, 2)}

USER FEEDBACK:
- Overall Comment: ${feedback.overallComment || 'None provided'}
- Rejected Findings: ${rejectedFindings.length} items
${rejectedFindings.map(f => `  - ${f.title}: ${f.comment || 'No specific reason'}`).join('\n')}

- Rejected Recommendations: ${rejectedRecommendations.length} items  
${rejectedRecommendations.map(r => `  - ${r.title}: ${r.comment || 'No specific reason'}`).join('\n')}

- Suggested Changes:
${suggestedChanges.map(change => `  - ${change}`).join('\n')}

Please provide a refined analysis that addresses these concerns while maintaining high quality and business relevance.`
      }
    ]
  }

  /**
   * Build slide structure generation prompt
   */
  private buildSlideStructurePrompt(
    analysis: FirstPassAnalysis,
    approvedFindings: any[],
    approvedRecommendations: any[],
    feedback: UserFeedback,
    datasetContext?: any
  ) {
    return [
      {
        role: 'system' as const,
        content: `You are a presentation expert creating executive-ready slide structures. Generate a comprehensive slide deck structure that tells a compelling data story. Always respond in valid JSON format only.

SLIDE DECK REQUIREMENTS:
1. Professional McKinsey-style structure
2. Clear narrative flow from problem to solution
3. Each slide has specific purpose and content
4. Include visual elements (charts, callouts, metrics)
5. Executive summary and clear recommendations
6. 8-12 slides optimal for executive attention
7. Speaker notes for key transitions

SLIDE TYPES TO USE:
- title: Opening slide with presentation overview
- executive_summary: High-level takeaways for leadership
- key_finding: Individual insights with supporting data
- trend_analysis: Pattern analysis over time/categories
- recommendation: Specific actionable recommendations
- conclusion: Summary and next steps

Focus on business impact and actionability.`
      },
      {
        role: 'user' as const,
        content: `Create a comprehensive slide structure for this analysis:

EXECUTIVE SUMMARY:
${analysis.executiveSummary}

APPROVED KEY FINDINGS (${approvedFindings.length} items):
${approvedFindings.map((f, i) => `${i + 1}. ${f.title}: ${f.insight}`).join('\n')}

APPROVED RECOMMENDATIONS (${approvedRecommendations.length} items):
${approvedRecommendations.map((r, i) => `${i + 1}. ${r.title}: ${r.action} (${r.priority} priority)`).join('\n')}

TRENDS & CORRELATIONS:
${analysis.trends.map(t => `- ${t.metric}: ${t.direction} (${t.significance})`).join('\n')}

${datasetContext ? `DATASET CONTEXT: ${JSON.stringify(datasetContext)}` : ''}

Generate a professional slide structure that creates a compelling narrative from this analysis.`
      }
    ]
  }

  /**
   * Extract approved findings based on feedback
   */
  private extractApprovedFindings(analysis: FirstPassAnalysis, feedback: UserFeedback) {
    return analysis.keyFindings.filter((_, index) => 
      feedback.findingsFeedback[index]?.approved === true
    ).map((finding, originalIndex) => ({
      ...finding,
      comment: feedback.findingsFeedback[originalIndex]?.comment
    }))
  }

  /**
   * Extract approved recommendations based on feedback
   */
  private extractApprovedRecommendations(analysis: FirstPassAnalysis, feedback: UserFeedback) {
    return analysis.recommendations.filter((_, index) => 
      feedback.recommendationsFeedback[index]?.approved === true
    ).map((rec, originalIndex) => ({
      ...rec,
      comment: feedback.recommendationsFeedback[originalIndex]?.comment
    }))
  }

  /**
   * Extract rejected findings for refinement
   */
  private extractRejectedFindings(analysis: FirstPassAnalysis, feedback: UserFeedback) {
    return analysis.keyFindings.filter((_, index) => 
      feedback.findingsFeedback[index]?.approved === false
    ).map((finding, originalIndex) => ({
      title: finding.title,
      comment: feedback.findingsFeedback[originalIndex]?.comment
    }))
  }

  /**
   * Extract rejected recommendations for refinement
   */
  private extractRejectedRecommendations(analysis: FirstPassAnalysis, feedback: UserFeedback) {
    return analysis.recommendations.filter((_, index) => 
      feedback.recommendationsFeedback[index]?.approved === false
    ).map((rec, originalIndex) => ({
      title: rec.title,
      comment: feedback.recommendationsFeedback[originalIndex]?.comment
    }))
  }

  /**
   * Calculate feedback processing metadata
   */
  private calculateFeedbackMetadata() {
    const totalIterations = this.iterationHistory.length
    const successfulIterations = this.iterationHistory.filter(i => i.success).length
    const approvalRate = totalIterations > 0 ? successfulIterations / totalIterations : 0
    
    // Calculate confidence based on successful iterations and user feedback
    const latestIteration = this.iterationHistory[this.iterationHistory.length - 1]
    const confidenceScore = latestIteration?.success ? 0.8 + (approvalRate * 0.2) : 0.3

    return {
      iterationsCount: totalIterations,
      approvalRate,
      confidenceScore
    }
  }

  /**
   * Get iteration history for debugging/monitoring
   */
  getIterationHistory(): FeedbackIteration[] {
    return [...this.iterationHistory]
  }

  /**
   * Reset iteration history for new session
   */
  resetHistory(): void {
    this.iterationHistory = []
  }
}

// Export singleton instance
export const insightFeedbackLoop = new InsightFeedbackLoop()

// Export utility functions
export const processFeedback = (
  analysis: FirstPassAnalysis,
  feedback: UserFeedback,
  sessionId: string,
  context?: any
) => insightFeedbackLoop.processFeedbackAndGenerateStructure(analysis, feedback, sessionId, context)