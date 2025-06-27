// Centralized OpenAI Rate Limiter
// Prevents 429 rate limit errors by coordinating all OpenAI calls

export class OpenAIRateLimiter {
  private static instance: OpenAIRateLimiter
  private queue: Array<() => Promise<any>> = []
  private isProcessing = false
  private tokensUsed = 0
  private requestsUsed = 0
  private resetTime = Date.now() + 60000 // Reset every minute
  
  // OpenAI limits for gpt-4o
  private readonly TOKEN_LIMIT = 25000 // Conservative limit (actual is 30k)
  private readonly REQUEST_LIMIT = 400  // Conservative limit (actual is 500)
  private readonly MIN_DELAY = 200     // Minimum 200ms between calls
  private readonly FALLBACK_DELAY = 2000 // 2 second delay after rate limit

  static getInstance(): OpenAIRateLimiter {
    if (!OpenAIRateLimiter.instance) {
      OpenAIRateLimiter.instance = new OpenAIRateLimiter()
    }
    return OpenAIRateLimiter.instance
  }

  async addToQueue<T>(
    openaiCall: () => Promise<T>, 
    estimatedTokens: number = 1000
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          // Check if we need to reset counters
          if (Date.now() > this.resetTime) {
            this.tokensUsed = 0
            this.requestsUsed = 0
            this.resetTime = Date.now() + 60000
            console.log('🔄 Rate limiter reset - tokens and requests refreshed')
          }

          // Check if we're approaching limits
          if (this.tokensUsed + estimatedTokens > this.TOKEN_LIMIT || 
              this.requestsUsed >= this.REQUEST_LIMIT) {
            const waitTime = this.resetTime - Date.now()
            console.log(`⏳ Rate limit approaching, waiting ${Math.ceil(waitTime/1000)}s for reset`)
            await new Promise(resolve => setTimeout(resolve, waitTime + 1000))
            
            // Reset after waiting
            this.tokensUsed = 0
            this.requestsUsed = 0
            this.resetTime = Date.now() + 60000
          }

          // Execute the OpenAI call
          const result = await openaiCall()
          
          // Update counters
          this.tokensUsed += estimatedTokens
          this.requestsUsed += 1
          
          console.log(`✅ OpenAI call completed - Tokens: ${this.tokensUsed}/${this.TOKEN_LIMIT}, Requests: ${this.requestsUsed}/${this.REQUEST_LIMIT}`)
          
          resolve(result)
        } catch (error: any) {
          // Handle rate limit errors specifically
          if (error.status === 429) {
            console.log('⚠️ Rate limit hit, implementing backoff strategy')
            await new Promise(resolve => setTimeout(resolve, this.FALLBACK_DELAY))
            
            try {
              // Retry once after backoff
              const result = await openaiCall()
              this.tokensUsed += estimatedTokens
              this.requestsUsed += 1
              resolve(result)
            } catch (retryError) {
              reject(retryError)
            }
          } else {
            reject(error)
          }
        }
      })

      this.processQueue()
    })
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return

    this.isProcessing = true

    while (this.queue.length > 0) {
      const task = this.queue.shift()
      if (task) {
        await task()
        // Wait minimum delay between calls
        await new Promise(resolve => setTimeout(resolve, this.MIN_DELAY))
      }
    }

    this.isProcessing = false
  }

  getStatus() {
    return {
      tokensUsed: this.tokensUsed,
      requestsUsed: this.requestsUsed,
      queueLength: this.queue.length,
      timeToReset: Math.max(0, this.resetTime - Date.now())
    }
  }
}

// Helper function for easy use
export async function rateLimitedOpenAICall<T>(
  openaiCall: () => Promise<T>, 
  estimatedTokens: number = 1000
): Promise<T> {
  const limiter = OpenAIRateLimiter.getInstance()
  return limiter.addToQueue(openaiCall, estimatedTokens)
}