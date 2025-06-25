// HUMAN FEEDBACK INTERFACE
// Real-time feedback collection and integration system

import { z } from 'zod'

// Feedback schemas
const FeedbackItemSchema = z.object({
  id: z.string(),
  timestamp: z.date(),
  type: z.enum(['approval', 'correction', 'suggestion', 'question', 'priority_change']),
  content: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  targetElement: z.object({
    slideId: z.string().optional(),
    elementId: z.string().optional(),
    section: z.string().optional()
  }).optional(),
  businessContext: z.string().optional(),
  expectedAction: z.string().optional()
})

const FeedbackSessionSchema = z.object({
  sessionId: z.string(),
  userId: z.string(),
  presentationId: z.string(),
  startTime: z.date(),
  endTime: z.date().optional(),
  status: z.enum(['active', 'paused', 'completed', 'abandoned']),
  feedback: z.array(FeedbackItemSchema),
  overallApproval: z.enum(['needs_major_revision', 'needs_minor_revision', 'approved']).optional(),
  businessPriorities: z.array(z.string()).optional(),
  nextSteps: z.array(z.string()).optional()
})

type FeedbackItem = z.infer<typeof FeedbackItemSchema>
type FeedbackSession = z.infer<typeof FeedbackSessionSchema>

export interface HumanFeedbackRequest {
  presentationId: string
  slides: any[]
  analysisResults: any
  businessContext: any
  iterationNumber: number
  confidenceLevel: number
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical'
  decisionMakers: string[]
}

export interface FeedbackResponse {
  sessionId: string
  feedback: FeedbackItem[]
  overallApproval: 'needs_major_revision' | 'needs_minor_revision' | 'approved'
  businessPriorities: string[]
  corrections: string[]
  additionalQuestions: string[]
  approvalTimestamp: Date
  nextIterationInstructions: string[]
}

export class HumanFeedbackInterface {
  private activeSessions: Map<string, FeedbackSession> = new Map()
  private feedbackQueue: Map<string, HumanFeedbackRequest> = new Map()

  /**
   * Initiate human feedback request
   */
  async requestFeedback(request: HumanFeedbackRequest): Promise<string> {
    const sessionId = `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    console.log(`👤 Initiating human feedback session: ${sessionId}`)
    console.log(`📊 Iteration ${request.iterationNumber}, Confidence: ${request.confidenceLevel}%`)

    // Store feedback request
    this.feedbackQueue.set(sessionId, request)

    // Create feedback session
    const session: FeedbackSession = {
      sessionId,
      userId: 'current_user', // Would come from auth context
      presentationId: request.presentationId,
      startTime: new Date(),
      status: 'active',
      feedback: [],
      businessPriorities: this.extractBusinessPriorities(request.businessContext)
    }

    this.activeSessions.set(sessionId, session)

    // In a real implementation, this would:
    // 1. Send notification to relevant stakeholders
    // 2. Create feedback interface/dashboard
    // 3. Set up real-time collaboration
    // 4. Schedule reminders based on urgency
    
    await this.notifyStakeholders(request, sessionId)
    await this.setupFeedbackInterface(sessionId, request)

    return sessionId
  }

  /**
   * Collect feedback in real-time
   */
  async collectFeedback(
    sessionId: string,
    feedback: Partial<FeedbackItem>
  ): Promise<void> {
    const session = this.activeSessions.get(sessionId)
    if (!session) {
      throw new Error(`Feedback session ${sessionId} not found`)
    }

    const feedbackItem: FeedbackItem = {
      id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date(),
      type: feedback.type || 'suggestion',
      content: feedback.content || '',
      priority: feedback.priority || 'medium',
      targetElement: feedback.targetElement,
      businessContext: feedback.businessContext,
      expectedAction: feedback.expectedAction
    }

    session.feedback.push(feedbackItem)
    this.activeSessions.set(sessionId, session)

    console.log(`💬 Feedback collected: ${feedbackItem.type} - ${feedbackItem.content}`)

    // Real-time updates to other stakeholders
    await this.broadcastFeedbackUpdate(sessionId, feedbackItem)
  }

  /**
   * Process and aggregate feedback for AI iteration
   */
  async processFeedbackForIteration(sessionId: string): Promise<FeedbackResponse> {
    const session = this.activeSessions.get(sessionId)
    const request = this.feedbackQueue.get(sessionId)
    
    if (!session || !request) {
      throw new Error(`Session or request not found for ${sessionId}`)
    }

    console.log(`🔄 Processing feedback for next iteration: ${session.feedback.length} items`)

    // Categorize and prioritize feedback
    const categorizedFeedback = this.categorizeFeedback(session.feedback)
    
    // Determine overall approval level
    const overallApproval = this.determineOverallApproval(session.feedback, request.confidenceLevel)
    
    // Extract corrections and suggestions
    const corrections = this.extractCorrections(session.feedback)
    const additionalQuestions = this.extractQuestions(session.feedback)
    
    // Generate next iteration instructions
    const nextIterationInstructions = this.generateNextIterationInstructions(
      session.feedback,
      request
    )

    // Update session status
    session.status = 'completed'
    session.endTime = new Date()
    session.overallApproval = overallApproval
    this.activeSessions.set(sessionId, session)

    const response: FeedbackResponse = {
      sessionId,
      feedback: session.feedback,
      overallApproval,
      businessPriorities: session.businessPriorities || [],
      corrections,
      additionalQuestions,
      approvalTimestamp: new Date(),
      nextIterationInstructions
    }

    console.log(`✅ Feedback processed: ${overallApproval} with ${corrections.length} corrections`)
    
    return response
  }

  /**
   * Simulate intelligent human feedback for development/testing
   */
  async simulateIntelligentFeedback(request: HumanFeedbackRequest): Promise<FeedbackResponse> {
    console.log(`🤖 Simulating intelligent human feedback for iteration ${request.iterationNumber}`)
    
    const sessionId = await this.requestFeedback(request)
    
    // Simulate realistic feedback based on business context and analysis quality
    const simulatedFeedback = await this.generateSimulatedFeedback(request)
    
    // Add feedback to session
    for (const feedback of simulatedFeedback) {
      await this.collectFeedback(sessionId, feedback)
    }
    
    // Process and return
    return this.processFeedbackForIteration(sessionId)
  }

  /**
   * Generate realistic feedback based on business context
   */
  private async generateSimulatedFeedback(request: HumanFeedbackRequest): Promise<Partial<FeedbackItem>[]> {
    const feedback: Partial<FeedbackItem>[] = []
    
    // Business context-driven feedback
    if (request.businessContext.industry === 'finance') {
      feedback.push({
        type: 'correction',
        content: 'Need to include regulatory compliance metrics and risk assessment',
        priority: 'high',
        businessContext: 'Financial services require regulatory transparency'
      })
    }
    
    if (request.businessContext.urgency === 'critical') {
      feedback.push({
        type: 'priority_change',
        content: 'Focus on immediate action items only - remove background analysis',
        priority: 'critical',
        businessContext: 'Critical urgency requires immediate focus'
      })
    }
    
    // Confidence-based feedback
    if (request.confidenceLevel < 70) {
      feedback.push({
        type: 'question',
        content: 'Data quality seems low - what additional validation was performed?',
        priority: 'high',
        businessContext: 'Low confidence requires data validation'
      })
    }
    
    // Audience-specific feedback
    if (request.businessContext.targetAudience?.includes('executive')) {
      feedback.push({
        type: 'suggestion',
        content: 'Executive summary should lead with financial impact and be more concise',
        priority: 'high',
        businessContext: 'Executive audiences need bottom-line focus'
      })
    }
    
    // Decision maker feedback
    if (request.decisionMakers.includes('CEO') || request.decisionMakers.includes('Board')) {
      feedback.push({
        type: 'correction',
        content: 'Need clear ROI projections and competitive differentiation',
        priority: 'critical',
        businessContext: 'C-level decisions require ROI and competitive analysis'
      })
    }
    
    // Iteration-based feedback
    if (request.iterationNumber >= 2) {
      feedback.push({
        type: 'approval',
        content: 'Significant improvement from previous iteration - almost ready',
        priority: 'medium',
        businessContext: 'Iteration showing progress'
      })
    }

    return feedback
  }

  /**
   * Notify stakeholders about feedback request
   */
  private async notifyStakeholders(request: HumanFeedbackRequest, sessionId: string): Promise<void> {
    console.log(`📧 Notifying stakeholders for session ${sessionId}`)
    
    // In production, this would:
    // - Send emails/slack messages to decision makers
    // - Create calendar events for review meetings
    // - Set up real-time collaboration workspace
    // - Schedule escalation reminders based on urgency
    
    const notificationLevel = this.getNotificationUrgency(request.urgencyLevel)
    console.log(`🔔 Notification level: ${notificationLevel}`)
  }

  /**
   * Setup feedback interface/dashboard
   */
  private async setupFeedbackInterface(sessionId: string, request: HumanFeedbackRequest): Promise<void> {
    console.log(`🖥️ Setting up feedback interface for session ${sessionId}`)
    
    // In production, this would:
    // - Create interactive review dashboard
    // - Enable real-time commenting on slides
    // - Set up approval workflow
    // - Create feedback collection forms
    // - Enable collaborative editing
  }

  /**
   * Broadcast feedback updates to stakeholders
   */
  private async broadcastFeedbackUpdate(sessionId: string, feedback: FeedbackItem): Promise<void> {
    console.log(`📡 Broadcasting feedback update: ${feedback.type}`)
    
    // In production, this would:
    // - Send real-time updates to all session participants
    // - Update shared dashboard
    // - Trigger notifications for high-priority feedback
    // - Log audit trail
  }

  /**
   * Categorize feedback by type and priority
   */
  private categorizeFeedback(feedback: FeedbackItem[]): {
    corrections: FeedbackItem[]
    suggestions: FeedbackItem[]
    questions: FeedbackItem[]
    approvals: FeedbackItem[]
    critical: FeedbackItem[]
  } {
    return {
      corrections: feedback.filter(f => f.type === 'correction'),
      suggestions: feedback.filter(f => f.type === 'suggestion'),
      questions: feedback.filter(f => f.type === 'question'),
      approvals: feedback.filter(f => f.type === 'approval'),
      critical: feedback.filter(f => f.priority === 'critical')
    }
  }

  /**
   * Determine overall approval level
   */
  private determineOverallApproval(
    feedback: FeedbackItem[], 
    confidenceLevel: number
  ): 'needs_major_revision' | 'needs_minor_revision' | 'approved' {
    const criticalIssues = feedback.filter(f => f.priority === 'critical').length
    const corrections = feedback.filter(f => f.type === 'correction').length
    const approvals = feedback.filter(f => f.type === 'approval').length
    
    if (criticalIssues > 0 || corrections > 3 || confidenceLevel < 60) {
      return 'needs_major_revision'
    }
    
    if (corrections > 0 || confidenceLevel < 80) {
      return 'needs_minor_revision'
    }
    
    return 'approved'
  }

  /**
   * Extract corrections for next iteration
   */
  private extractCorrections(feedback: FeedbackItem[]): string[] {
    return feedback
      .filter(f => f.type === 'correction' || f.priority === 'critical')
      .map(f => f.content)
  }

  /**
   * Extract questions for additional analysis
   */
  private extractQuestions(feedback: FeedbackItem[]): string[] {
    return feedback
      .filter(f => f.type === 'question')
      .map(f => f.content)
  }

  /**
   * Generate next iteration instructions
   */
  private generateNextIterationInstructions(
    feedback: FeedbackItem[], 
    request: HumanFeedbackRequest
  ): string[] {
    const instructions: string[] = []
    
    // Process critical feedback first
    const criticalFeedback = feedback.filter(f => f.priority === 'critical')
    for (const critical of criticalFeedback) {
      instructions.push(`CRITICAL: ${critical.content}`)
    }
    
    // Process corrections
    const corrections = feedback.filter(f => f.type === 'correction')
    for (const correction of corrections) {
      instructions.push(`FIX: ${correction.content}`)
    }
    
    // Process suggestions
    const suggestions = feedback.filter(f => f.type === 'suggestion')
    for (const suggestion of suggestions) {
      instructions.push(`IMPROVE: ${suggestion.content}`)
    }
    
    // Add business context instructions
    if (request.businessContext.urgency === 'critical') {
      instructions.push('URGENCY: Prioritize immediate actionability over comprehensive analysis')
    }
    
    return instructions
  }

  /**
   * Extract business priorities from context
   */
  private extractBusinessPriorities(businessContext: any): string[] {
    const priorities: string[] = []
    
    if (businessContext.presentationGoal) {
      priorities.push(`Goal: ${businessContext.presentationGoal}`)
    }
    
    if (businessContext.keyMetrics) {
      priorities.push(`Key Metrics: ${businessContext.keyMetrics.join(', ')}`)
    }
    
    if (businessContext.urgency) {
      priorities.push(`Urgency: ${businessContext.urgency}`)
    }
    
    return priorities
  }

  /**
   * Determine notification urgency
   */
  private getNotificationUrgency(urgencyLevel: string): string {
    switch (urgencyLevel) {
      case 'critical': return 'immediate_notification'
      case 'high': return 'priority_notification'
      case 'medium': return 'standard_notification'
      default: return 'low_priority_notification'
    }
  }

  /**
   * Get active feedback sessions
   */
  getActiveSessions(): FeedbackSession[] {
    return Array.from(this.activeSessions.values())
  }

  /**
   * Get feedback session by ID
   */
  getSession(sessionId: string): FeedbackSession | undefined {
    return this.activeSessions.get(sessionId)
  }
}

// Global feedback interface instance
export const humanFeedbackInterface = new HumanFeedbackInterface()

export default HumanFeedbackInterface