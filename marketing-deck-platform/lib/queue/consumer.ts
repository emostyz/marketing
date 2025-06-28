import { Worker, Job } from 'bullmq'
import * as Sentry from '@sentry/node'
import { redisConnection, QUEUE_NAMES, JOB_TYPES } from './config'
import { PresentationJobData } from './producer'
import { WorldClassOrchestrator } from '@/lib/ai/world-class-orchestrator'
import { OpenAIOrchestrator } from '@/lib/ai/openai-orchestrator'
import { drizzle } from '@/lib/db/drizzle'
import { presentations } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// Initialize Sentry for error logging
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
})

export class PresentationWorker {
  private worker: Worker
  
  constructor() {
    this.worker = new Worker(
      QUEUE_NAMES.SLIDE_PIPELINE,
      async (job: Job<PresentationJobData>) => {
        return await this.processJob(job)
      },
      {
        connection: redisConnection,
        concurrency: parseInt(process.env.QUEUE_CONCURRENCY || '2'),
        stalledInterval: 30000,
        maxStalledCount: 1,
      }
    )

    this.setupEventHandlers()
  }

  private async processJob(job: Job<PresentationJobData>) {
    const { deckId, userId, context } = job.data
    
    console.log(`🎯 Processing presentation job for deck ${deckId}`)
    
    try {
      // Update status to processing
      await this.updatePresentationStatus(deckId, 'processing')

      // Load CSV data from database
      const csvData = await this.loadCsvData(deckId)
      
      if (!csvData || csvData.length === 0) {
        throw new Error(`No CSV data found for deck ${deckId}`)
      }

      // Choose orchestrator based on context
      const useWorldClass = context.presentationStyle === 'executive' || 
                           context.urgency === 'critical' ||
                           context.targetAudience?.toLowerCase().includes('executive')

      let result
      if (useWorldClass) {
        console.log('🏆 Using WorldClass orchestrator')
        const orchestrator = new WorldClassOrchestrator(context, csvData)
        result = await orchestrator.generateWorldClassPresentation()
      } else {
        console.log('🧠 Using OpenAI orchestrator')
        const orchestrator = new OpenAIOrchestrator(context, csvData)
        result = await orchestrator.orchestrateIntelligentPresentation()
      }

      // Update presentation with final result
      await this.updatePresentationResult(deckId, result)
      
      // Send completion notification (could be webhook or realtime event)
      await this.notifyCompletion(deckId, userId, 'success')
      
      console.log(`✅ Successfully processed presentation ${deckId}`)
      return { success: true, deckId, slidesGenerated: result.slides?.length || 0 }

    } catch (error) {
      console.error(`❌ Failed to process presentation ${deckId}:`, error)
      
      // Log error to Sentry
      Sentry.captureException(error, {
        tags: {
          jobType: 'presentation-generation',
          deckId,
          userId
        },
        extra: {
          context,
          jobId: job.id
        }
      })

      // Update presentation status to error
      await this.updatePresentationStatus(deckId, 'error', String(error))
      
      // Send failure notification
      await this.notifyCompletion(deckId, userId, 'error', String(error))
      
      throw error
    }
  }

  private async loadCsvData(deckId: string): Promise<any[]> {
    const db = drizzle()
    
    const presentation = await db
      .select()
      .from(presentations)
      .where(eq(presentations.id, deckId))
      .limit(1)

    if (presentation.length === 0) {
      throw new Error(`Presentation ${deckId} not found`)
    }

    const dataSources = presentation[0].dataSources as any[]
    
    if (!dataSources || dataSources.length === 0) {
      throw new Error(`No data sources found for presentation ${deckId}`)
    }

    // For now, assume the first data source contains the CSV data
    // In a real implementation, you might need to fetch from storage
    return dataSources[0].data || []
  }

  private async updatePresentationStatus(
    deckId: string, 
    status: string, 
    errorMessage?: string
  ) {
    const db = drizzle()
    
    const updateData: any = {
      status,
      updatedAt: new Date()
    }
    
    if (errorMessage) {
      updateData.errorMessage = errorMessage
    }

    await db
      .update(presentations)
      .set(updateData)
      .where(eq(presentations.id, deckId))
  }

  private async updatePresentationResult(deckId: string, result: any) {
    const db = drizzle()
    
    await db
      .update(presentations)
      .set({
        status: 'completed',
        finalDeckJson: result,
        slides: result.slides || [],
        errorMessage: null,
        updatedAt: new Date()
      })
      .where(eq(presentations.id, deckId))
  }

  private async notifyCompletion(
    deckId: string, 
    userId: string, 
    status: 'success' | 'error',
    errorMessage?: string
  ) {
    // In a real implementation, you would:
    // 1. Send a Supabase Realtime event
    // 2. Send a webhook to the frontend
    // 3. Send an email notification
    
    console.log(`📢 Notification: Presentation ${deckId} ${status}`, {
      userId,
      errorMessage
    })
    
    // Example: Send realtime event via Supabase
    // await supabase.from('presentation_events').insert({
    //   presentation_id: deckId,
    //   user_id: userId,
    //   event_type: status === 'success' ? 'completed' : 'failed',
    //   metadata: { errorMessage }
    // })
  }

  private setupEventHandlers() {
    this.worker.on('completed', (job, result) => {
      console.log(`✅ Job ${job.id} completed successfully:`, result)
    })

    this.worker.on('failed', (job, err) => {
      console.error(`❌ Job ${job?.id} failed:`, err.message)
      
      // Additional Sentry logging for failed jobs
      Sentry.captureException(err, {
        tags: {
          jobType: 'presentation-generation',
          jobId: job?.id,
          failureType: 'job-failed'
        }
      })
    })

    this.worker.on('stalled', (jobId) => {
      console.warn(`⚠️ Job ${jobId} stalled`)
    })

    this.worker.on('error', (err) => {
      console.error('Worker error:', err)
      Sentry.captureException(err, {
        tags: { workerError: true }
      })
    })
  }

  public async close() {
    await this.worker.close()
  }

  public getWorker() {
    return this.worker
  }
}

// Export singleton instance
let workerInstance: PresentationWorker | null = null

export function getWorker(): PresentationWorker {
  if (!workerInstance) {
    workerInstance = new PresentationWorker()
  }
  return workerInstance
}

export async function closeWorker() {
  if (workerInstance) {
    await workerInstance.close()
    workerInstance = null
  }
}