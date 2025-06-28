import { OpenAI } from 'openai'

/**
 * Helper function to safely make OpenAI calls with JSON response format
 * Ensures the "json" keyword is present in messages to avoid 400 errors
 */
export async function safeOpenAIJSONCall(
  openai: OpenAI,
  options: {
    model: string
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
    temperature?: number
    max_tokens?: number
    timeout?: number
  }
): Promise<string> {
  
  // Preflight validation to ensure "json" keyword is present
  const hasJsonKeyword = options.messages.some(m => /json/i.test(m.content))
  
  if (!hasJsonKeyword) {
    console.error("❌ Missing 'json' keyword in messages:", options.messages)
    throw new Error("OpenAI requires 'json' keyword in messages when using response_format:'json_object'")
  }

  // Ensure we have a system prompt with JSON instruction
  const hasSystemPrompt = options.messages.some(m => m.role === 'system')
  if (!hasSystemPrompt) {
    options.messages.unshift({
      role: 'system',
      content: 'You are an AI assistant that always responds in valid JSON format only.'
    })
  }

  const response = await openai.chat.completions.create({
    model: options.model,
    messages: options.messages,
    response_format: { type: "json_object" },
    temperature: options.temperature || 0.3,
    max_tokens: options.max_tokens || 4000
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('No response content from OpenAI')
  }

  // Validate that response is valid JSON
  try {
    JSON.parse(content)
  } catch (parseError) {
    console.error('OpenAI returned invalid JSON:', content)
    throw new Error('OpenAI returned invalid JSON response')
  }

  return content
}

/**
 * Retry wrapper for OpenAI calls with specific error handling
 */
export async function retryOpenAICall<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      // Don't retry on specific 400 errors related to missing JSON keyword
      if (error instanceof Error && 
          error.message.includes('messages') && 
          error.message.includes('json')) {
        console.error('Fatal OpenAI error - not retrying:', error.message)
        throw error
      }
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1) // Exponential backoff
      console.warn(`OpenAI call failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms:`, error.message)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}

/**
 * Convenience function that combines safe JSON call with retry logic
 */
export async function robustOpenAIJSONCall(
  openai: OpenAI,
  options: Parameters<typeof safeOpenAIJSONCall>[1],
  maxRetries: number = 3
): Promise<string> {
  return retryOpenAICall(
    () => safeOpenAIJSONCall(openai, options),
    maxRetries
  )
}