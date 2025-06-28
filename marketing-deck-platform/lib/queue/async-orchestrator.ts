import { PresentationQueue, PresentationJobData } from './producer'
import { drizzle } from '@/lib/db/drizzle'
import { presentations } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export interface AsyncOrchestrationRequest {
  deckId: string
  userId: string
  context: any
  priority?: number
}

export class AsyncOrchestrator {
  /**
   * Enqueue a presentation generation job instead of processing synchronously
   */
  static async enqueuePresentationGeneration(
    request: AsyncOrchestrationRequest
  ): Promise<{ jobId: string; deckId: string }> {
    console.log(`🚀 Enqueuing presentation generation for deck ${request.deckId}`)
    
    // Update presentation status to queued
    await this.updatePresentationStatus(request.deckId, 'queued')
    
    // Create job data
    const jobData: PresentationJobData = {
      deckId: request.deckId,
      userId: request.userId,
      context: request.context,
      priority: request.priority || 1
    }
    
    // Enqueue the job
    const jobId = await PresentationQueue.addPresentationJob(jobData)
    
    console.log(`✅ Enqueued job ${jobId} for deck ${request.deckId}`)
    
    return { jobId, deckId: request.deckId }
  }

  /**
   * Get status of a presentation job
   */
  static async getJobStatus(jobId: string) {
    const job = await PresentationQueue.getJob(jobId)
    
    if (!job) {
      return { status: 'not_found', progress: 0 }
    }

    const state = await job.getState()
    const progress = job.progress || 0

    return {
      status: state,
      progress,
      data: job.data,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
      failedReason: job.failedReason
    }
  }

  /**
   * Get overall queue status
   */
  static async getQueueStatus() {
    return await PresentationQueue.getQueueStatus()
  }

  private static async updatePresentationStatus(deckId: string, status: string) {
    const db = drizzle()
    
    await db
      .update(presentations)
      .set({
        status,
        updatedAt: new Date()
      })
      .where(eq(presentations.id, deckId))
  }
}

export default AsyncOrchestrator