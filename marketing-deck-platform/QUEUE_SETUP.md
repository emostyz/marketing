# Async Queue Setup for Presentation Generation

This document explains how to set up and use the BullMQ-based job queue for asynchronous presentation generation.

## Architecture Overview

The async pipeline replaces direct orchestrator calls with a queue-based system:

1. **Producer** (`lib/queue/producer.ts`): Enqueues presentation generation jobs
2. **Consumer** (`lib/queue/consumer.ts`): Processes jobs by calling AI orchestrators
3. **Database Updates**: Jobs update `presentations.final_deck_json` on completion
4. **Error Handling**: Failed jobs log to Sentry and update error status

## Prerequisites

### Redis Server
Install and run Redis locally or use a cloud provider:

```bash
# macOS with Homebrew
brew install redis
brew services start redis

# Docker
docker run -d -p 6379:6379 redis:alpine

# Or use Redis Cloud, AWS ElastiCache, etc.
```

### Environment Variables
Add to your `.env.local`:

```bash
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=           # Optional for local development
REDIS_DB=0               # Use 1 for tests

# Queue Configuration  
QUEUE_CONCURRENCY=2      # Number of concurrent workers
AUTO_START_WORKER=true   # Auto-start worker in development

# Error Monitoring
SENTRY_DSN=your_sentry_dsn_here
```

## Usage

### 1. Start the Worker
The worker processes jobs from the queue:

```bash
# Auto-starts in development mode
npm run dev

# Or manually start worker
npm run worker:start
```

### 2. Enqueue Jobs (Replace Direct Calls)

**Before (Synchronous):**
```typescript
import { WorldClassOrchestrator } from '@/lib/ai/world-class-orchestrator'

const orchestrator = new WorldClassOrchestrator(context, csvData)
const result = await orchestrator.generateWorldClassPresentation()
```

**After (Asynchronous):**
```typescript
import { AsyncOrchestrator } from '@/lib/queue/async-orchestrator'

const { jobId } = await AsyncOrchestrator.enqueuePresentationGeneration({
  deckId: 'uuid-here',
  userId: 'user-uuid',
  context: userContext,
  priority: 5 // 1-10, higher = more urgent
})

// Job runs in background, updates database when complete
```

### 3. Monitor Job Status

```typescript
// Check specific job
const status = await AsyncOrchestrator.getJobStatus(jobId)
console.log(status.status) // 'waiting', 'active', 'completed', 'failed'

// Check overall queue health
const queueStatus = await AsyncOrchestrator.getQueueStatus()
console.log(`${queueStatus.active} jobs active, ${queueStatus.waiting} waiting`)
```

### 4. API Endpoints

#### Enqueue Presentation Generation
```bash
POST /api/ai/generate-async
{
  "deckId": "uuid",
  "userId": "uuid", 
  "context": {
    "businessContext": "Q4 Revenue Analysis",
    "industry": "Technology",
    "urgency": "high"
  },
  "priority": 5
}

# Response: { "jobId": "...", "estimatedTime": "2-5 minutes" }
```

#### Check Queue Health
```bash
GET /api/ai/queue-status

# Response:
{
  "healthy": true,
  "jobs": {
    "waiting": 2,
    "active": 1, 
    "completed": 15,
    "failed": 0
  },
  "metrics": {
    "errorRate": 0,
    "activeJobs": 1
  }
}
```

## Database Schema Changes

The `presentations` table now includes:

```sql
ALTER TABLE presentations 
ADD COLUMN final_deck_json JSONB,
ADD COLUMN error_message TEXT;
```

- `final_deck_json`: Complete presentation result from orchestrator
- `error_message`: Error details if job fails
- `status`: 'draft' → 'queued' → 'processing' → 'completed'|'error'

## Error Handling & Monitoring

### Job Failures
- Automatic retries with exponential backoff (3 attempts)
- Failed jobs log to Sentry with context
- Database updated with error status and message
- Optional user notifications (webhook/realtime events)

### Sentry Integration
Errors are automatically logged with tags:
```javascript
{
  tags: {
    jobType: 'presentation-generation',
    deckId: 'uuid',
    userId: 'uuid'
  },
  extra: {
    context: userContext,
    jobId: 'job-123'
  }
}
```

### Health Monitoring
- Queue metrics available via `/api/ai/queue-status`
- Returns 503 if unhealthy (high error rate, too many active jobs)
- Useful for load balancers and monitoring systems

## Testing

### Run Queue Tests
```bash
# Run all tests
npm test

# Run only queue tests  
npm run test:queue

# Watch mode for development
npm run test:watch
```

### Manual Testing
```bash
# 1. Start Redis and worker
redis-server
npm run worker:start

# 2. Enqueue test job
curl -X POST http://localhost:3000/api/ai/generate-async \
  -H "Content-Type: application/json" \
  -d '{
    "deckId": "test-deck-123",
    "userId": "test-user-123", 
    "context": {"businessContext": "Test"},
    "priority": 5
  }'

# 3. Check status
curl http://localhost:3000/api/ai/queue-status
```

## Production Deployment

### Scaling Considerations
- **Redis**: Use Redis Cluster or managed service (AWS ElastiCache, Redis Cloud)
- **Workers**: Run multiple worker processes across servers
- **Monitoring**: Set up alerts on queue depth and error rates
- **Graceful Shutdown**: Workers handle SIGTERM for zero-downtime deploys

### Worker Deployment
```bash
# Separate worker processes
NODE_ENV=production npm run worker:start

# Or integrate with your existing app
import { startWorker } from '@/lib/queue/worker-init'
startWorker()
```

### Environment Variables (Production)
```bash
REDIS_HOST=your-redis-cluster.cache.amazonaws.com
REDIS_PORT=6379
REDIS_PASSWORD=your-secure-password
QUEUE_CONCURRENCY=5
SENTRY_DSN=your-production-sentry-dsn
```

## Troubleshooting

### Common Issues

1. **"Connection refused" errors**
   - Ensure Redis is running: `redis-cli ping` should return "PONG"
   - Check `REDIS_HOST` and `REDIS_PORT` env vars

2. **Jobs stuck in "waiting" state**
   - Verify worker is running: check logs for "🚀 Presentation worker started"
   - Check worker errors in console or Sentry

3. **High failure rate**
   - Check Sentry for error patterns
   - Verify OpenAI API keys and rate limits
   - Ensure database connections are stable

4. **Memory issues**
   - Limit job retention: `removeOnComplete: 50, removeOnFail: 100`
   - Monitor Redis memory usage
   - Consider job data size optimization

### Debugging Commands
```bash
# Check Redis connection
redis-cli ping

# View queue contents (Redis CLI)
redis-cli
> KEYS bull:slidePipeline:*
> LLEN bull:slidePipeline:waiting

# Monitor worker logs
npm run worker:start | grep "🎯\|✅\|❌"
```

## Migration from Synchronous to Async

To migrate existing synchronous endpoints:

1. **Replace direct orchestrator calls** with `AsyncOrchestrator.enqueuePresentationGeneration()`
2. **Return job ID** instead of final result
3. **Update frontend** to poll job status or use WebSockets
4. **Handle status states** in UI: queued → processing → completed/error
5. **Add loading indicators** and estimated completion times

The queue system provides better scalability, error handling, and user experience for long-running AI operations.