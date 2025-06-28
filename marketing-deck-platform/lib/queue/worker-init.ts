import { getWorker, closeWorker } from './consumer'

let isWorkerRunning = false

export function startWorker() {
  if (isWorkerRunning) {
    console.log('⚠️ Worker already running')
    return
  }

  try {
    const worker = getWorker()
    isWorkerRunning = true
    console.log('🚀 Presentation worker started')
    
    // Handle graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`📴 Received ${signal}, shutting down worker...`)
      isWorkerRunning = false
      await closeWorker()
      console.log('✅ Worker shut down gracefully')
      process.exit(0)
    }

    process.on('SIGTERM', () => shutdown('SIGTERM'))
    process.on('SIGINT', () => shutdown('SIGINT'))
    
    return worker
  } catch (error) {
    console.error('❌ Failed to start worker:', error)
    isWorkerRunning = false
    throw error
  }
}

export function getWorkerStatus() {
  return {
    running: isWorkerRunning,
    startedAt: isWorkerRunning ? new Date().toISOString() : null
  }
}

// Auto-start worker in development mode
if (process.env.NODE_ENV === 'development' && process.env.AUTO_START_WORKER !== 'false') {
  startWorker()
}