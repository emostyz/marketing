import { ConnectionOptions } from 'bullmq'
import Redis from 'ioredis'

export const redisConnection: ConnectionOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  enableOfflineQueue: false
}

export const redisClient = new Redis({
  ...redisConnection,
  lazyConnect: true
})

export const QUEUE_NAMES = {
  SLIDE_PIPELINE: 'slidePipeline'
} as const

export const JOB_TYPES = {
  GENERATE_PRESENTATION: 'generatePresentation'
} as const