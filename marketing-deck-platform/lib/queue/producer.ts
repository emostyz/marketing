import { Queue } from 'bullmq'
import { redisConnection, QUEUE_NAMES, JOB_TYPES } from './config'

const slidePipelineQueue = new Queue(QUEUE_NAMES.SLIDE_PIPELINE, {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 50,
    removeOnFail: 100,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
})

export interface PresentationJobData {
  deckId: string
  userId: string
  context: any
  priority?: number
}

export class PresentationQueue {
  static async addPresentationJob(data: PresentationJobData): Promise<string> {
    const job = await slidePipelineQueue.add(
      JOB_TYPES.GENERATE_PRESENTATION,
      data,
      {
        priority: data.priority || 1,
        delay: 0,
        jobId: `presentation-${data.deckId}-${Date.now()}`,
      }
    )
    
    return job.id!
  }

  static async getQueueStatus() {
    const waiting = await slidePipelineQueue.getWaiting()
    const active = await slidePipelineQueue.getActive()
    const completed = await slidePipelineQueue.getCompleted()
    const failed = await slidePipelineQueue.getFailed()

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      queue: QUEUE_NAMES.SLIDE_PIPELINE
    }
  }

  static async getJob(jobId: string) {
    return await slidePipelineQueue.getJob(jobId)
  }

  static getQueue() {
    return slidePipelineQueue
  }
}

export default PresentationQueue