import { OpenAI } from 'openai'
import { z } from 'zod'

export interface OpenAICallOptions {
  model?: string
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
  temperature?: number
  max_tokens?: number
  timeout?: number
  requireJSON?: boolean
  schema?: z.ZodType<any>
}

export interface OpenAIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

/**
 * Enhanced OpenAI wrapper with comprehensive error handling and JSON validation
 */
export class EnhancedOpenAIWrapper {
  private openai: OpenAI
  private defaultModel: string
  private maxRetries: number
  private retryDelay: number

  constructor(apiKey?: string, options?: {
    defaultModel?: string
    maxRetries?: number
    retryDelay?: number
  }) {
    if (!apiKey && !process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is required')
    }

    this.openai = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
      maxRetries: 3,
      timeout: 60000
    })

    this.defaultModel = options?.defaultModel || 'gpt-4-turbo-preview'
    this.maxRetries = options?.maxRetries || 3
    this.retryDelay = options?.retryDelay || 1000
  }

  /**
   * Makes a safe OpenAI call with automatic JSON handling
   */
  async call<T = any>(options: OpenAICallOptions): Promise<OpenAIResponse<T>> {
    const { 
      model = this.defaultModel, 
      messages, 
      temperature = 0.3, 
      max_tokens = 4000,
      timeout = 30000,
      requireJSON = true,
      schema
    } = options

    try {
      // Ensure JSON keyword is present if requireJSON is true
      if (requireJSON) {
        const messagesWithJSON = this.ensureJSONKeyword(messages)
        options.messages = messagesWithJSON
      }

      // Attempt the API call with retries
      const response = await this.retryWithBackoff(async () => {
        const completion = await this.openai.chat.completions.create({
          model,
          messages: options.messages,
          temperature,
          max_tokens,
          ...(requireJSON ? { response_format: { type: "json_object" } } : {}),
          timeout
        })

        return completion
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        return {
          success: false,
          error: 'No response content from OpenAI'
        }
      }

      // Parse and validate JSON if required
      if (requireJSON) {
        try {
          const parsed = JSON.parse(content)
          
          // Validate against schema if provided
          if (schema) {
            const validated = schema.parse(parsed)
            return {
              success: true,
              data: validated as T,
              usage: response.usage
            }
          }

          return {
            success: true,
            data: parsed as T,
            usage: response.usage
          }
        } catch (parseError) {
          console.error('JSON parsing/validation error:', parseError)
          return {
            success: false,
            error: `Invalid JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
            usage: response.usage
          }
        }
      }

      // Return raw content for non-JSON responses
      return {
        success: true,
        data: content as T,
        usage: response.usage
      }

    } catch (error) {
      console.error('OpenAI API error:', error)
      return {
        success: false,
        error: this.formatError(error)
      }
    }
  }

  /**
   * Ensures the JSON keyword is present in messages
   */
  private ensureJSONKeyword(messages: Array<{ role: string; content: string }>): Array<{ role: string; content: string }> {
    const hasJsonKeyword = messages.some(m => /json/i.test(m.content))
    
    if (hasJsonKeyword) {
      return messages
    }

    // Create a copy to avoid mutating the original
    const updatedMessages = [...messages]
    
    // Add JSON instruction to system message or create one
    const systemMessageIndex = updatedMessages.findIndex(m => m.role === 'system')
    
    if (systemMessageIndex >= 0) {
      updatedMessages[systemMessageIndex] = {
        ...updatedMessages[systemMessageIndex],
        content: updatedMessages[systemMessageIndex].content + 
          '\n\nIMPORTANT: Always respond in valid JSON format only.'
      }
    } else {
      updatedMessages.unshift({
        role: 'system',
        content: 'You are an AI assistant that always responds in valid JSON format only.'
      })
    }

    return updatedMessages
  }

  /**
   * Retry logic with exponential backoff
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    attempt: number = 1
  ): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      // Don't retry on specific errors
      if (this.shouldNotRetry(error)) {
        throw error
      }

      if (attempt >= this.maxRetries) {
        throw error
      }

      const delay = this.retryDelay * Math.pow(2, attempt - 1)
      console.warn(`OpenAI call failed (attempt ${attempt}/${this.maxRetries}), retrying in ${delay}ms`)
      
      await new Promise(resolve => setTimeout(resolve, delay))
      return this.retryWithBackoff(fn, attempt + 1)
    }
  }

  /**
   * Determines if an error should not be retried
   */
  private shouldNotRetry(error: any): boolean {
    if (error instanceof Error) {
      // Don't retry on authentication errors
      if (error.message.includes('401') || error.message.includes('Invalid API key')) {
        return true
      }
      
      // Don't retry on invalid request errors (400)
      if (error.message.includes('400') && 
          (error.message.includes('json') || error.message.includes('Invalid request'))) {
        return true
      }

      // Don't retry on quota errors
      if (error.message.includes('429') && error.message.includes('quota')) {
        return true
      }
    }

    return false
  }

  /**
   * Formats error messages for user-friendly display
   */
  private formatError(error: any): string {
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        return 'Invalid OpenAI API key. Please check your configuration.'
      }
      if (error.message.includes('429')) {
        return 'OpenAI rate limit exceeded. Please try again later.'
      }
      if (error.message.includes('timeout')) {
        return 'Request timed out. Please try again.'
      }
      if (error.message.includes('Network')) {
        return 'Network error. Please check your connection.'
      }
      return error.message
    }
    
    return 'An unexpected error occurred with the OpenAI API'
  }

  /**
   * Convenience method for structured data analysis
   */
  async analyzeData(data: any[], context: string, schema?: z.ZodType<any>): Promise<OpenAIResponse> {
    const messages = [
      {
        role: 'system' as const,
        content: `You are an expert data analyst. Analyze the provided data and return insights in JSON format. ${context}`
      },
      {
        role: 'user' as const,
        content: `Analyze this data: ${JSON.stringify(data.slice(0, 10))}\n\nProvide comprehensive insights.`
      }
    ]

    return this.call({ messages, requireJSON: true, schema })
  }

  /**
   * Convenience method for generating chart recommendations
   */
  async recommendCharts(data: any[], insights: any): Promise<OpenAIResponse> {
    const messages = [
      {
        role: 'system' as const,
        content: 'You are a data visualization expert. Recommend optimal charts for the given data and insights. Return recommendations in JSON format.'
      },
      {
        role: 'user' as const,
        content: `Data: ${JSON.stringify(data.slice(0, 5))}\nInsights: ${JSON.stringify(insights)}\n\nRecommend the best visualizations.`
      }
    ]

    return this.call({ messages, requireJSON: true })
  }

  /**
   * Convenience method for generating slide content
   */
  async generateSlides(data: any, insights: any, charts: any[]): Promise<OpenAIResponse> {
    const messages = [
      {
        role: 'system' as const,
        content: 'You are a presentation expert. Create professional slides based on the provided data, insights, and charts. Return slides in JSON format.'
      },
      {
        role: 'user' as const,
        content: `Create a presentation with:\nData: ${JSON.stringify(data)}\nInsights: ${JSON.stringify(insights)}\nCharts: ${JSON.stringify(charts)}`
      }
    ]

    return this.call({ 
      messages, 
      requireJSON: true,
      max_tokens: 6000
    })
  }
}

// Export a singleton instance for convenience
export const openAIWrapper = new EnhancedOpenAIWrapper()