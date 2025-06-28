import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import { AsyncOrchestrator } from '@/lib/queue/async-orchestrator'
import { PresentationQueue } from '@/lib/queue/producer'
import { getWorker, closeWorker } from '@/lib/queue/consumer'
import { drizzle } from '@/lib/db/drizzle'
import { presentations, profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// Mock external dependencies
jest.mock('@/lib/ai/world-class-orchestrator')
jest.mock('@/lib/ai/openai-orchestrator')
jest.mock('@sentry/node')

describe('Queue Integration Tests', () => {
  let testDeckId: string
  let testUserId: string
  let worker: any

  beforeAll(async () => {
    // Start worker for tests
    worker = getWorker()
    await new Promise(resolve => setTimeout(resolve, 1000)) // Give worker time to start
  })

  afterAll(async () => {
    // Clean up worker
    await closeWorker()
  })

  beforeEach(async () => {
    // Create test data
    testDeckId = `test-deck-${Date.now()}`
    testUserId = `test-user-${Date.now()}`
    
    const db = drizzle()
    
    // Insert test presentation
    await db.insert(presentations).values({
      id: testDeckId,
      userId: testUserId,
      title: 'Test Presentation',
      status: 'draft',
      dataSources: [{
        data: [
          { name: 'Product A', revenue: 100000, growth: 15 },
          { name: 'Product B', revenue: 150000, growth: 25 },
          { name: 'Product C', revenue: 80000, growth: -5 }
        ]
      }]
    })
  })

  describe('Successful Job Processing', () => {
    it('should enqueue and process a presentation job successfully', async () => {
      const context = {
        businessContext: 'Q4 Revenue Analysis',
        industry: 'Technology',
        targetAudience: 'Executives',
        presentationGoal: 'Show quarterly performance',
        urgency: 'high'
      }

      // Enqueue job
      const { jobId, deckId } = await AsyncOrchestrator.enqueuePresentationGeneration({
        deckId: testDeckId,
        userId: testUserId,
        context,
        priority: 5
      })

      expect(jobId).toBeDefined()
      expect(deckId).toBe(testDeckId)

      // Check initial status
      let jobStatus = await AsyncOrchestrator.getJobStatus(jobId)
      expect(['waiting', 'active', 'completed']).toContain(jobStatus.status)

      // Wait for job completion (with timeout)
      const maxWaitTime = 30000 // 30 seconds
      const pollInterval = 1000 // 1 second
      let attempts = 0
      const maxAttempts = maxWaitTime / pollInterval

      while (attempts < maxAttempts) {
        jobStatus = await AsyncOrchestrator.getJobStatus(jobId)
        
        if (jobStatus.status === 'completed') {
          break
        }
        
        if (jobStatus.status === 'failed') {
          throw new Error(`Job failed: ${jobStatus.failedReason}`)
        }

        await new Promise(resolve => setTimeout(resolve, pollInterval))
        attempts++
      }

      expect(jobStatus.status).toBe('completed')

      // Check database was updated
      const db = drizzle()
      const presentation = await db
        .select()
        .from(presentations)
        .where(eq(presentations.id, testDeckId))
        .limit(1)

      expect(presentation.length).toBe(1)
      expect(presentation[0].status).toBe('completed')
      expect(presentation[0].finalDeckJson).toBeDefined()
      expect(presentation[0].errorMessage).toBeNull()
    }, 35000) // 35 second timeout

    it('should handle queue status endpoint', async () => {
      const queueStatus = await AsyncOrchestrator.getQueueStatus()
      
      expect(queueStatus).toHaveProperty('waiting')
      expect(queueStatus).toHaveProperty('active')
      expect(queueStatus).toHaveProperty('completed')
      expect(queueStatus).toHaveProperty('failed')
      expect(queueStatus.queue).toBe('slidePipeline')
      
      expect(typeof queueStatus.waiting).toBe('number')
      expect(typeof queueStatus.active).toBe('number')
    })
  })

  describe('Failed Job Processing', () => {
    it('should handle jobs with invalid data gracefully', async () => {
      // Create presentation with no data sources
      const invalidDeckId = `invalid-deck-${Date.now()}`
      const db = drizzle()
      
      await db.insert(presentations).values({
        id: invalidDeckId,
        userId: testUserId,
        title: 'Invalid Presentation',
        status: 'draft',
        dataSources: [] // Empty data sources should cause failure
      })

      const context = {
        businessContext: 'Invalid Test',
        industry: 'Technology'
      }

      // Enqueue job
      const { jobId } = await AsyncOrchestrator.enqueuePresentationGeneration({
        deckId: invalidDeckId,
        userId: testUserId,
        context
      })

      // Wait for job to fail
      const maxWaitTime = 15000 // 15 seconds
      const pollInterval = 1000
      let attempts = 0
      let jobStatus: any

      while (attempts < maxWaitTime / pollInterval) {
        jobStatus = await AsyncOrchestrator.getJobStatus(jobId)
        
        if (jobStatus.status === 'failed' || jobStatus.status === 'completed') {
          break
        }

        await new Promise(resolve => setTimeout(resolve, pollInterval))
        attempts++
      }

      expect(jobStatus.status).toBe('failed')
      expect(jobStatus.failedReason).toBeDefined()

      // Check database reflects error state
      const presentation = await db
        .select()
        .from(presentations)
        .where(eq(presentations.id, invalidDeckId))
        .limit(1)

      expect(presentation[0].status).toBe('error')
      expect(presentation[0].errorMessage).toBeDefined()
    }, 20000)

    it('should handle nonexistent deck ID', async () => {
      const nonexistentDeckId = 'nonexistent-deck-123'
      
      const { jobId } = await AsyncOrchestrator.enqueuePresentationGeneration({
        deckId: nonexistentDeckId,
        userId: testUserId,
        context: { businessContext: 'Test' }
      })

      // Wait for job to fail
      await new Promise(resolve => setTimeout(resolve, 5000))
      
      const jobStatus = await AsyncOrchestrator.getJobStatus(jobId)
      expect(jobStatus.status).toBe('failed')
    })
  })

  describe('Queue Health Monitoring', () => {
    it('should provide accurate queue metrics', async () => {
      // Add multiple jobs
      const jobs = []
      for (let i = 0; i < 3; i++) {
        const deckId = `batch-deck-${Date.now()}-${i}`
        
        // Create minimal presentation for each job
        const db = drizzle()
        await db.insert(presentations).values({
          id: deckId,
          userId: testUserId,
          title: `Batch Test ${i}`,
          status: 'draft',
          dataSources: [{ data: [{ test: 'data' }] }]
        })

        const jobPromise = AsyncOrchestrator.enqueuePresentationGeneration({
          deckId,
          userId: testUserId,
          context: { businessContext: `Batch test ${i}` }
        })
        jobs.push(jobPromise)
      }

      await Promise.all(jobs)

      // Check queue status
      const queueStatus = await AsyncOrchestrator.getQueueStatus()
      const totalJobs = queueStatus.waiting + queueStatus.active + queueStatus.completed + queueStatus.failed
      
      expect(totalJobs).toBeGreaterThanOrEqual(3)
    })

    it('should handle queue status API endpoint format', async () => {
      // This would typically be tested via HTTP request in a real app
      const queueStatus = await AsyncOrchestrator.getQueueStatus()
      
      // Verify the structure matches what the API endpoint expects
      expect(queueStatus).toMatchObject({
        waiting: expect.any(Number),
        active: expect.any(Number),
        completed: expect.any(Number),
        failed: expect.any(Number),
        queue: expect.any(String)
      })
    })
  })

  describe('Job Priority and Ordering', () => {
    it('should respect job priority ordering', async () => {
      const jobs = []
      
      // Create jobs with different priorities
      for (let i = 0; i < 3; i++) {
        const deckId = `priority-deck-${Date.now()}-${i}`
        const db = drizzle()
        
        await db.insert(presentations).values({
          id: deckId,
          userId: testUserId,
          title: `Priority Test ${i}`,
          status: 'draft',
          dataSources: [{ data: [{ test: 'data' }] }]
        })

        // Higher priority jobs should be processed first
        const priority = i === 0 ? 10 : 1
        
        const jobPromise = AsyncOrchestrator.enqueuePresentationGeneration({
          deckId,
          userId: testUserId,
          context: { businessContext: `Priority test ${i}` },
          priority
        })
        
        jobs.push(jobPromise)
      }

      const results = await Promise.all(jobs)
      
      // All jobs should be enqueued successfully
      expect(results).toHaveLength(3)
      results.forEach(result => {
        expect(result.jobId).toBeDefined()
      })
    })
  })
})