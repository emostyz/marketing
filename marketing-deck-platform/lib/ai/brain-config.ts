// AI Brain Configuration Management
// Handles provider selection, user preferences, and enterprise settings

import { BrainConfig, AIProvider, AI_PROVIDERS } from './brain-controller'

export interface UserAIPreferences {
  userId: string
  defaultProvider: string
  customApiKeys: Record<string, string>
  customEndpoints: Record<string, string>
  modelPreferences: Record<string, string>
  budgetLimits?: {
    dailyLimit: number
    monthlyLimit: number
    warningThreshold: number
  }
  privacySettings: {
    allowDataLogging: boolean
    preferLocalModels: boolean
    requireOnPremise: boolean
  }
  enterpriseSettings?: {
    approvedProviders: string[]
    mandatoryProvider?: string
    costCenter?: string
    auditLogging: boolean
  }
}

export class BrainConfigManager {
  private static instance: BrainConfigManager
  private configs: Map<string, BrainConfig> = new Map()

  static getInstance(): BrainConfigManager {
    if (!BrainConfigManager.instance) {
      BrainConfigManager.instance = new BrainConfigManager()
    }
    return BrainConfigManager.instance
  }

  // Get configuration for a user (with fallbacks)
  async getBrainConfig(userId?: string): Promise<BrainConfig> {
    const configKey = userId || 'default'
    
    if (this.configs.has(configKey)) {
      return this.configs.get(configKey)!
    }

    // Load user preferences
    const userPrefs = userId ? await this.loadUserPreferences(userId) : null
    
    // Create configuration
    const config: BrainConfig = {
      defaultProvider: this.determineDefaultProvider(userPrefs),
      userApiKeys: userPrefs?.customApiKeys || {},
      modelPreferences: userPrefs?.modelPreferences || {},
      customEndpoints: userPrefs?.customEndpoints || {},
      tokenManagement: {
        enableChunking: true,
        maxChunkSize: 25000, // Conservative for OpenAI 30k limit
        overlapTokens: 200
      },
      fallbackProviders: this.determineFallbackProviders(userPrefs),
      enterpriseMode: this.isEnterpriseUser(userPrefs)
    }

    this.configs.set(configKey, config)
    return config
  }

  // Determine the best default provider based on user preferences and availability
  private determineDefaultProvider(userPrefs?: UserAIPreferences): string {
    if (userPrefs?.enterpriseSettings?.mandatoryProvider) {
      return userPrefs.enterpriseSettings.mandatoryProvider
    }

    if (userPrefs?.defaultProvider && this.isProviderAvailable(userPrefs.defaultProvider, userPrefs)) {
      return userPrefs.defaultProvider
    }

    // Privacy-first users prefer local models
    if (userPrefs?.privacySettings?.preferLocalModels) {
      return 'ollama'
    }

    // Enterprise users requiring on-premise
    if (userPrefs?.privacySettings?.requireOnPremise) {
      return userPrefs.customEndpoints.custom ? 'custom' : 'ollama'
    }

    // Default fallback hierarchy
    const preferenceOrder = ['openai', 'anthropic', 'google', 'azure', 'ollama']
    
    for (const provider of preferenceOrder) {
      if (this.isProviderAvailable(provider, userPrefs)) {
        return provider
      }
    }

    return 'openai' // Final fallback
  }

  private determineFallbackProviders(userPrefs?: UserAIPreferences): string[] {
    const approved = userPrefs?.enterpriseSettings?.approvedProviders || Object.keys(AI_PROVIDERS)
    
    return approved.filter(provider => 
      provider !== (userPrefs?.defaultProvider || 'openai') &&
      this.isProviderAvailable(provider, userPrefs)
    )
  }

  private isProviderAvailable(providerId: string, userPrefs?: UserAIPreferences): boolean {
    const provider = AI_PROVIDERS[providerId]
    if (!provider) return false

    // Check enterprise restrictions
    if (userPrefs?.enterpriseSettings?.approvedProviders) {
      if (!userPrefs.enterpriseSettings.approvedProviders.includes(providerId)) {
        return false
      }
    }

    // Check if API key is available (for cloud providers)
    if (provider.type !== 'ollama' && provider.type !== 'custom') {
      const hasApiKey = userPrefs?.customApiKeys[providerId] || 
                       process.env[`${providerId.toUpperCase()}_API_KEY`] ||
                       process.env.OPENAI_API_KEY // Fallback for OpenAI-compatible
      
      if (!hasApiKey) return false
    }

    // Check privacy requirements
    if (userPrefs?.privacySettings?.requireOnPremise) {
      return provider.type === 'ollama' || provider.type === 'custom'
    }

    return true
  }

  private isEnterpriseUser(userPrefs?: UserAIPreferences): boolean {
    return !!(userPrefs?.enterpriseSettings?.approvedProviders || 
              userPrefs?.enterpriseSettings?.mandatoryProvider ||
              userPrefs?.enterpriseSettings?.auditLogging)
  }

  // Load user preferences from database
  private async loadUserPreferences(userId: string): Promise<UserAIPreferences | null> {
    try {
      // This would load from your database
      // For now, return mock data based on environment
      const mockPrefs: UserAIPreferences = {
        userId,
        defaultProvider: process.env.DEFAULT_AI_PROVIDER || 'openai',
        customApiKeys: {},
        customEndpoints: {},
        modelPreferences: {},
        privacySettings: {
          allowDataLogging: true,
          preferLocalModels: false,
          requireOnPremise: false
        }
      }

      return mockPrefs
    } catch (error) {
      console.error('Failed to load user AI preferences:', error)
      return null
    }
  }

  // Save user preferences
  async saveUserPreferences(prefs: UserAIPreferences): Promise<void> {
    try {
      // This would save to your database
      console.log('Saving AI preferences for user:', prefs.userId)
      
      // Update cached config
      const config = await this.getBrainConfig(prefs.userId)
      config.defaultProvider = prefs.defaultProvider
      config.userApiKeys = prefs.customApiKeys
      config.customEndpoints = prefs.customEndpoints
      config.modelPreferences = prefs.modelPreferences
      
      this.configs.set(prefs.userId, config)
    } catch (error) {
      console.error('Failed to save user AI preferences:', error)
      throw error
    }
  }

  // Enterprise admin functions
  async setEnterprisePolicy(policy: {
    approvedProviders: string[]
    mandatoryProvider?: string
    budgetLimits?: {
      dailyLimit: number
      monthlyLimit: number
    }
    auditLogging: boolean
  }): Promise<void> {
    // This would typically be stored in enterprise settings table
    console.log('Setting enterprise AI policy:', policy)
  }

  // Get provider recommendations based on use case
  getProviderRecommendations(useCase: 'analysis' | 'creative' | 'coding' | 'chat'): string[] {
    const recommendations = {
      analysis: ['openai', 'anthropic', 'google'], // Best for data analysis
      creative: ['anthropic', 'openai', 'google'], // Best for creative writing
      coding: ['openai', 'anthropic', 'google'],   // Best for code generation
      chat: ['openai', 'anthropic', 'ollama']      // Best for conversational AI
    }

    return recommendations[useCase] || ['openai']
  }

  // Cost estimation for different providers
  async estimateUsageCost(
    userId: string, 
    requestsPerDay: number, 
    avgTokensPerRequest: number
  ): Promise<Record<string, number>> {
    const costs: Record<string, number> = {}
    
    for (const [providerId, provider] of Object.entries(AI_PROVIDERS)) {
      if (provider.pricing) {
        const dailyInputTokens = requestsPerDay * avgTokensPerRequest
        const dailyOutputTokens = requestsPerDay * 1000 // Estimate
        
        const dailyCost = (
          (dailyInputTokens * provider.pricing.inputPer1k / 1000) +
          (dailyOutputTokens * provider.pricing.outputPer1k / 1000)
        )
        
        costs[providerId] = dailyCost * 30 // Monthly estimate
      }
    }
    
    return costs
  }

  // Health check for all configured providers
  async checkProviderHealth(userId?: string): Promise<Record<string, boolean>> {
    const config = await this.getBrainConfig(userId)
    const health: Record<string, boolean> = {}
    
    for (const providerId of [config.defaultProvider, ...config.fallbackProviders]) {
      try {
        // Simple health check - this would ping each provider
        health[providerId] = await this.pingProvider(providerId, config)
      } catch (error) {
        health[providerId] = false
      }
    }
    
    return health
  }

  private async pingProvider(providerId: string, config: BrainConfig): Promise<boolean> {
    // This would implement actual health checks for each provider
    // For now, just check if we have credentials
    const provider = AI_PROVIDERS[providerId]
    if (!provider) return false
    
    if (provider.type === 'ollama') {
      // Check if Ollama is running locally
      try {
        const response = await fetch(provider.endpoint + '/api/tags', { 
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        })
        return response.ok
      } catch {
        return false
      }
    }
    
    // For cloud providers, check if API key exists
    return !!(config.userApiKeys[providerId] || process.env[`${providerId.toUpperCase()}_API_KEY`])
  }

  // Clear cache (useful for testing)
  clearCache(): void {
    this.configs.clear()
  }
}