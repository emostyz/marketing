import { useAuth } from '@/lib/auth/auth-context'
import { useTierLimits } from '@/lib/hooks/useTierLimits'

export interface EnterpriseFeatures {
  customAI: boolean
  onPremiseDeployment: boolean
  prioritySupport: boolean
  advancedSecurity: boolean
  auditLogging: boolean
  customBranding: boolean
  ssoIntegration: boolean
  dedicatedAccountManager: boolean
}

export function useEnterpriseAccess() {
  const { user } = useAuth()
  const { subscription } = useTierLimits()

  // Check if user has enterprise subscription
  const isEnterprise = subscription?.plan === 'enterprise' || 
                      subscription?.tier === 'enterprise' ||
                      user?.tier === 'enterprise'

  // Enterprise features configuration
  const enterpriseFeatures: EnterpriseFeatures = {
    customAI: isEnterprise,
    onPremiseDeployment: isEnterprise,
    prioritySupport: isEnterprise,
    advancedSecurity: isEnterprise,
    auditLogging: isEnterprise,
    customBranding: isEnterprise,
    ssoIntegration: isEnterprise,
    dedicatedAccountManager: isEnterprise
  }

  // Get saved enterprise AI configuration
  const getEnterpriseAIConfig = () => {
    if (!isEnterprise) return null
    
    try {
      const saved = localStorage.getItem('enterprise_ai_config')
      return saved ? JSON.parse(saved) : null
    } catch (error) {
      console.warn('Failed to load enterprise AI config:', error)
      return null
    }
  }

  // Check if enterprise AI is configured and enabled
  const isEnterpriseAIEnabled = () => {
    const config = getEnterpriseAIConfig()
    return config?.enabled === true && config?.endpoint && config?.apiKey
  }

  // Get the appropriate API endpoint for AI requests
  const getAIEndpoint = () => {
    if (isEnterprise && isEnterpriseAIEnabled()) {
      const config = getEnterpriseAIConfig()
      return config.endpoint
    }
    return '/api/ai/analyze' // Default to our hosted AI
  }

  // Get AI configuration for requests
  const getAIConfig = () => {
    if (isEnterprise && isEnterpriseAIEnabled()) {
      const config = getEnterpriseAIConfig()
      return {
        endpoint: config.endpoint,
        apiKey: config.apiKey,
        model: config.model,
        maxTokens: config.maxTokens,
        temperature: config.temperature,
        headers: config.customHeaders || {}
      }
    }
    
    // Return default configuration
    return {
      endpoint: '/api/ai/analyze',
      model: 'gpt-4-turbo-preview',
      maxTokens: 4096,
      temperature: 0.7
    }
  }

  return {
    isEnterprise,
    enterpriseFeatures,
    getEnterpriseAIConfig,
    isEnterpriseAIEnabled,
    getAIEndpoint,
    getAIConfig
  }
}