// Universal AI Brain Controller - Easily switch between AI providers
// Supports OpenAI, Anthropic, Google, Azure, Ollama (local), and custom endpoints

export interface AIProvider {
  id: string
  name: string
  type: 'openai' | 'anthropic' | 'google' | 'azure' | 'ollama' | 'custom'
  endpoint?: string
  models: string[]
  tokenLimits: {
    input: number
    output: number
    context: number
  }
  features: {
    streaming: boolean
    jsonMode: boolean
    functionCalling: boolean
    vision: boolean
  }
  pricing?: {
    inputPer1k: number
    outputPer1k: number
    currency: string
  }
}

export interface AIRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string
  }>
  model?: string
  temperature?: number
  maxTokens?: number
  stream?: boolean
  jsonMode?: boolean
  functions?: any[]
}

export interface AIResponse {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  model: string
  provider: string
  finishReason: 'stop' | 'length' | 'function_call' | 'content_filter'
}

export interface BrainConfig {
  defaultProvider: string
  userApiKeys: Record<string, string>
  modelPreferences: Record<string, string>
  customEndpoints: Record<string, string>
  tokenManagement: {
    enableChunking: boolean
    maxChunkSize: number
    overlapTokens: number
  }
  fallbackProviders: string[]
  enterpriseMode: boolean
}

// Supported AI Providers Configuration
export const AI_PROVIDERS: Record<string, AIProvider> = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    type: 'openai',
    endpoint: 'https://api.openai.com/v1',
    models: ['gpt-4-turbo-preview', 'gpt-4-1106-preview', 'gpt-4', 'gpt-3.5-turbo'],
    tokenLimits: {
      input: 30000,
      output: 4096,
      context: 128000
    },
    features: {
      streaming: true,
      jsonMode: true,
      functionCalling: true,
      vision: true
    },
    pricing: {
      inputPer1k: 0.01,
      outputPer1k: 0.03,
      currency: 'USD'
    }
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic Claude',
    type: 'anthropic',
    endpoint: 'https://api.anthropic.com/v1',
    models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
    tokenLimits: {
      input: 100000,
      output: 4096,
      context: 200000
    },
    features: {
      streaming: true,
      jsonMode: false,
      functionCalling: true,
      vision: true
    },
    pricing: {
      inputPer1k: 0.015,
      outputPer1k: 0.075,
      currency: 'USD'
    }
  },
  google: {
    id: 'google',
    name: 'Google Gemini',
    type: 'google',
    endpoint: 'https://generativelanguage.googleapis.com/v1',
    models: ['gemini-pro', 'gemini-pro-vision', 'gemini-ultra'],
    tokenLimits: {
      input: 30720,
      output: 2048,
      context: 32768
    },
    features: {
      streaming: true,
      jsonMode: false,
      functionCalling: true,
      vision: true
    },
    pricing: {
      inputPer1k: 0.0005,
      outputPer1k: 0.0015,
      currency: 'USD'
    }
  },
  azure: {
    id: 'azure',
    name: 'Azure OpenAI',
    type: 'azure',
    models: ['gpt-4-turbo', 'gpt-4', 'gpt-35-turbo'],
    tokenLimits: {
      input: 30000,
      output: 4096,
      context: 128000
    },
    features: {
      streaming: true,
      jsonMode: true,
      functionCalling: true,
      vision: true
    }
  },
  ollama: {
    id: 'ollama',
    name: 'Ollama (Local)',
    type: 'ollama',
    endpoint: 'http://localhost:11434/api',
    models: ['llama2', 'llama2:13b', 'llama2:70b', 'codellama', 'mistral', 'neural-chat'],
    tokenLimits: {
      input: 4096,
      output: 2048,
      context: 4096
    },
    features: {
      streaming: true,
      jsonMode: false,
      functionCalling: false,
      vision: false
    },
    pricing: {
      inputPer1k: 0,
      outputPer1k: 0,
      currency: 'USD'
    }
  }
}

export class AIBrainController {
  private config: BrainConfig
  private tokenCounter: (text: string) => number

  constructor(config: BrainConfig) {
    this.config = config
    this.tokenCounter = this.createTokenCounter()
  }

  // Main method to send requests to any AI provider
  async sendRequest(request: AIRequest, providerId?: string): Promise<AIResponse> {
    const provider = providerId || this.config.defaultProvider
    const aiProvider = AI_PROVIDERS[provider]

    if (!aiProvider) {
      throw new Error(`Unknown AI provider: ${provider}`)
    }

    // Check token limits and chunk if necessary
    const processedRequest = await this.handleTokenLimits(request, aiProvider)

    try {
      return await this.executeRequest(processedRequest, aiProvider)
    } catch (error) {
      console.error(`Error with ${provider}:`, error)
      
      // Try fallback providers
      for (const fallbackId of this.config.fallbackProviders) {
        if (fallbackId !== provider) {
          try {
            console.log(`Trying fallback provider: ${fallbackId}`)
            return await this.executeRequest(processedRequest, AI_PROVIDERS[fallbackId])
          } catch (fallbackError) {
            console.error(`Fallback ${fallbackId} failed:`, fallbackError)
          }
        }
      }
      
      throw error
    }
  }

  // Handle token limits with intelligent chunking
  private async handleTokenLimits(request: AIRequest, provider: AIProvider): Promise<AIRequest> {
    const totalTokens = this.calculateRequestTokens(request)
    
    if (totalTokens <= provider.tokenLimits.input) {
      return request
    }

    if (!this.config.tokenManagement.enableChunking) {
      throw new Error(`Request exceeds token limit: ${totalTokens} > ${provider.tokenLimits.input}`)
    }

    console.log(`🔧 Token limit exceeded (${totalTokens}), applying intelligent chunking...`)
    return this.chunkRequest(request, provider)
  }

  private chunkRequest(request: AIRequest, provider: AIProvider): AIRequest {
    const maxChunkSize = this.config.tokenManagement.maxChunkSize || Math.floor(provider.tokenLimits.input * 0.8)
    const systemMessage = request.messages.find(m => m.role === 'system')
    const userMessages = request.messages.filter(m => m.role === 'user')
    
    if (userMessages.length === 0) {
      throw new Error('No user messages to chunk')
    }

    // Combine user messages and chunk them
    const combinedContent = userMessages.map(m => m.content).join('\n\n')
    const chunks = this.intelligentChunking(combinedContent, maxChunkSize)
    
    // For now, use the first chunk and add a note about truncation
    const truncatedContent = chunks[0] + (chunks.length > 1 ? '\n\n[Note: Content truncated for token limit. Analysis based on first portion.]' : '')
    
    return {
      ...request,
      messages: [
        ...(systemMessage ? [systemMessage] : []),
        { role: 'user', content: truncatedContent }
      ]
    }
  }

  private intelligentChunking(content: string, maxTokens: number): string[] {
    const chunks: string[] = []
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
    
    let currentChunk = ''
    let currentTokens = 0
    
    for (const sentence of sentences) {
      const sentenceTokens = this.tokenCounter(sentence)
      
      if (currentTokens + sentenceTokens > maxTokens && currentChunk.length > 0) {
        chunks.push(currentChunk.trim())
        currentChunk = sentence
        currentTokens = sentenceTokens
      } else {
        currentChunk += (currentChunk ? '. ' : '') + sentence
        currentTokens += sentenceTokens
      }
    }
    
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim())
    }
    
    return chunks
  }

  // Execute request based on provider type
  private async executeRequest(request: AIRequest, provider: AIProvider): Promise<AIResponse> {
    switch (provider.type) {
      case 'openai':
        return this.executeOpenAIRequest(request, provider)
      case 'anthropic':
        return this.executeAnthropicRequest(request, provider)
      case 'google':
        return this.executeGoogleRequest(request, provider)
      case 'azure':
        return this.executeAzureRequest(request, provider)
      case 'ollama':
        return this.executeOllamaRequest(request, provider)
      case 'custom':
        return this.executeCustomRequest(request, provider)
      default:
        throw new Error(`Unsupported provider type: ${provider.type}`)
    }
  }

  private async executeOpenAIRequest(request: AIRequest, provider: AIProvider): Promise<AIResponse> {
    const apiKey = this.config.userApiKeys[provider.id] || process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const response = await fetch(`${provider.endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: request.model || provider.models[0],
        messages: request.messages,
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || provider.tokenLimits.output,
        ...(request.jsonMode && provider.features.jsonMode ? { response_format: { type: 'json_object' } } : {})
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    return {
      content: data.choices[0]?.message?.content || '',
      usage: data.usage,
      model: data.model,
      provider: provider.id,
      finishReason: data.choices[0]?.finish_reason || 'stop'
    }
  }

  private async executeAnthropicRequest(request: AIRequest, provider: AIProvider): Promise<AIResponse> {
    const apiKey = this.config.userApiKeys[provider.id] || process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('Anthropic API key not configured')
    }

    const systemMessage = request.messages.find(m => m.role === 'system')?.content || ''
    const messages = request.messages.filter(m => m.role !== 'system')

    const response = await fetch(`${provider.endpoint}/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: request.model || provider.models[0],
        system: systemMessage,
        messages: messages,
        max_tokens: request.maxTokens || provider.tokenLimits.output,
        temperature: request.temperature || 0.7
      })
    })

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    return {
      content: data.content[0]?.text || '',
      usage: data.usage,
      model: data.model,
      provider: provider.id,
      finishReason: data.stop_reason || 'stop'
    }
  }

  private async executeGoogleRequest(request: AIRequest, provider: AIProvider): Promise<AIResponse> {
    const apiKey = this.config.userApiKeys[provider.id] || process.env.GOOGLE_API_KEY
    if (!apiKey) {
      throw new Error('Google API key not configured')
    }

    // Google Gemini has a different format
    const prompt = request.messages.map(m => `${m.role}: ${m.content}`).join('\n\n')

    const response = await fetch(`${provider.endpoint}/models/${request.model || provider.models[0]}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: request.temperature || 0.7,
          maxOutputTokens: request.maxTokens || provider.tokenLimits.output
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Google API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    return {
      content: data.candidates[0]?.content?.parts[0]?.text || '',
      usage: data.usageMetadata,
      model: request.model || provider.models[0],
      provider: provider.id,
      finishReason: data.candidates[0]?.finishReason || 'stop'
    }
  }

  private async executeAzureRequest(request: AIRequest, provider: AIProvider): Promise<AIResponse> {
    const apiKey = this.config.userApiKeys[provider.id] || process.env.AZURE_OPENAI_API_KEY
    const endpoint = this.config.customEndpoints[provider.id] || process.env.AZURE_OPENAI_ENDPOINT
    
    if (!apiKey || !endpoint) {
      throw new Error('Azure OpenAI API key and endpoint not configured')
    }

    const response = await fetch(`${endpoint}/openai/deployments/${request.model || 'gpt-4'}/chat/completions?api-version=2023-12-01-preview`, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: request.messages,
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || provider.tokenLimits.output
      })
    })

    if (!response.ok) {
      throw new Error(`Azure OpenAI API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    return {
      content: data.choices[0]?.message?.content || '',
      usage: data.usage,
      model: data.model,
      provider: provider.id,
      finishReason: data.choices[0]?.finish_reason || 'stop'
    }
  }

  private async executeOllamaRequest(request: AIRequest, provider: AIProvider): Promise<AIResponse> {
    const endpoint = this.config.customEndpoints[provider.id] || provider.endpoint

    const response = await fetch(`${endpoint}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: request.model || provider.models[0],
        prompt: request.messages.map(m => `${m.role}: ${m.content}`).join('\n\n'),
        stream: false
      })
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    return {
      content: data.response || '',
      model: request.model || provider.models[0],
      provider: provider.id,
      finishReason: 'stop'
    }
  }

  private async executeCustomRequest(request: AIRequest, provider: AIProvider): Promise<AIResponse> {
    const endpoint = this.config.customEndpoints[provider.id]
    const apiKey = this.config.userApiKeys[provider.id]
    
    if (!endpoint) {
      throw new Error('Custom endpoint not configured')
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: request.model || 'default',
        messages: request.messages,
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 2048
      })
    })

    if (!response.ok) {
      throw new Error(`Custom API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    return {
      content: data.choices?.[0]?.message?.content || data.content || data.response || '',
      model: request.model || 'custom',
      provider: provider.id,
      finishReason: 'stop'
    }
  }

  // Token counting utilities
  private createTokenCounter(): (text: string) => number {
    // Simplified token counting (roughly 4 characters per token for English)
    return (text: string) => Math.ceil(text.length / 4)
  }

  private calculateRequestTokens(request: AIRequest): number {
    return request.messages.reduce((total, message) => {
      return total + this.tokenCounter(message.content)
    }, 0)
  }

  // Configuration management
  updateConfig(newConfig: Partial<BrainConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  getAvailableProviders(): AIProvider[] {
    return Object.values(AI_PROVIDERS)
  }

  getProviderCapabilities(providerId: string): AIProvider | null {
    return AI_PROVIDERS[providerId] || null
  }

  // Enterprise features
  setUserApiKey(providerId: string, apiKey: string): void {
    this.config.userApiKeys[providerId] = apiKey
  }

  setCustomEndpoint(providerId: string, endpoint: string): void {
    this.config.customEndpoints[providerId] = endpoint
  }

  estimateCost(request: AIRequest, providerId: string): number {
    const provider = AI_PROVIDERS[providerId]
    if (!provider?.pricing) return 0

    const tokens = this.calculateRequestTokens(request)
    const outputTokens = request.maxTokens || 1000

    return (
      (tokens * provider.pricing.inputPer1k / 1000) +
      (outputTokens * provider.pricing.outputPer1k / 1000)
    )
  }
}