/**
 * AI Provider Management System
 * Handles switching between different AI providers (OpenAI, Claude, Local LLM)
 */

import { createClient } from '@supabase/supabase-js';

export interface AIProvider {
  id: string;
  name: string;
  displayName: string;
  description: string;
  models: AIModel[];
  requiresApiKey: boolean;
  supportedFeatures: AIFeature[];
  pricing: {
    inputTokens: number; // per 1k tokens
    outputTokens: number; // per 1k tokens
    currency: string;
  };
  limits: {
    maxTokens: number;
    requestsPerMinute: number;
    requestsPerDay: number;
  };
  enterpriseOnly: boolean;
  isLocalLLM: boolean;
}

export interface AIModel {
  id: string;
  name: string;
  displayName: string;
  description: string;
  contextWindow: number;
  maxOutputTokens: number;
  capabilities: string[];
  costMultiplier: number;
  isDefault: boolean;
}

export interface AIFeature {
  id: string;
  name: string;
  description: string;
  category: 'analysis' | 'generation' | 'processing' | 'advanced';
}

export interface AIProviderConfig {
  providerId: string;
  apiKey?: string;
  baseUrl?: string;
  organizationId?: string;
  customHeaders?: Record<string, string>;
  rateLimit?: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };
  fallbackProvider?: string;
}

export interface LocalLLMConfig {
  modelPath: string;
  modelName: string;
  serverUrl: string;
  authToken?: string;
  hardware: {
    gpu: boolean;
    memoryGB: number;
    threads: number;
  };
  performance: {
    batchSize: number;
    contextLength: number;
    temperature: number;
  };
}

export class AIProviderManager {
  private supabase: ReturnType<typeof createClient>;

  // Available AI providers
  private static readonly AI_PROVIDERS: Record<string, AIProvider> = {
    'openai': {
      id: 'openai',
      name: 'openai',
      displayName: 'OpenAI',
      description: 'Industry-leading AI models including GPT-4 and GPT-3.5',
      requiresApiKey: true,
      enterpriseOnly: false,
      isLocalLLM: false,
      models: [
        {
          id: 'gpt-3.5-turbo',
          name: 'gpt-3.5-turbo',
          displayName: 'GPT-3.5 Turbo',
          description: 'Fast, efficient model for most tasks',
          contextWindow: 16385,
          maxOutputTokens: 4096,
          capabilities: ['text-generation', 'analysis', 'summarization'],
          costMultiplier: 1.0,
          isDefault: true
        },
        {
          id: 'gpt-4',
          name: 'gpt-4',
          displayName: 'GPT-4',
          description: 'Most capable model for complex reasoning',
          contextWindow: 8192,
          maxOutputTokens: 4096,
          capabilities: ['text-generation', 'analysis', 'summarization', 'complex-reasoning'],
          costMultiplier: 20.0,
          isDefault: false
        },
        {
          id: 'gpt-4-turbo',
          name: 'gpt-4-turbo-preview',
          displayName: 'GPT-4 Turbo',
          description: 'Latest GPT-4 with improved performance and lower cost',
          contextWindow: 128000,
          maxOutputTokens: 4096,
          capabilities: ['text-generation', 'analysis', 'summarization', 'complex-reasoning', 'large-context'],
          costMultiplier: 10.0,
          isDefault: false
        }
      ],
      supportedFeatures: [
        { id: 'streaming', name: 'Streaming Responses', description: 'Real-time response streaming', category: 'processing' },
        { id: 'function-calling', name: 'Function Calling', description: 'Structured function calls', category: 'advanced' },
        { id: 'json-mode', name: 'JSON Mode', description: 'Guaranteed JSON output', category: 'processing' }
      ],
      pricing: {
        inputTokens: 0.0015,
        outputTokens: 0.002,
        currency: 'USD'
      },
      limits: {
        maxTokens: 128000,
        requestsPerMinute: 3500,
        requestsPerDay: 10000
      }
    },
    'anthropic': {
      id: 'anthropic',
      name: 'anthropic',
      displayName: 'Anthropic Claude',
      description: 'Claude models known for safety and helpfulness',
      requiresApiKey: true,
      enterpriseOnly: false,
      isLocalLLM: false,
      models: [
        {
          id: 'claude-3-sonnet',
          name: 'claude-3-sonnet-20240229',
          displayName: 'Claude 3 Sonnet',
          description: 'Balanced performance and speed',
          contextWindow: 200000,
          maxOutputTokens: 4096,
          capabilities: ['text-generation', 'analysis', 'summarization', 'large-context'],
          costMultiplier: 3.0,
          isDefault: true
        },
        {
          id: 'claude-3-opus',
          name: 'claude-3-opus-20240229',
          displayName: 'Claude 3 Opus',
          description: 'Most intelligent Claude model',
          contextWindow: 200000,
          maxOutputTokens: 4096,
          capabilities: ['text-generation', 'analysis', 'summarization', 'complex-reasoning', 'large-context'],
          costMultiplier: 15.0,
          isDefault: false
        }
      ],
      supportedFeatures: [
        { id: 'large-context', name: 'Large Context', description: '200K+ token context window', category: 'processing' },
        { id: 'safety-focused', name: 'Safety Focused', description: 'Enhanced safety and reliability', category: 'advanced' }
      ],
      pricing: {
        inputTokens: 0.003,
        outputTokens: 0.015,
        currency: 'USD'
      },
      limits: {
        maxTokens: 200000,
        requestsPerMinute: 1000,
        requestsPerDay: 5000
      }
    },
    'local-llm': {
      id: 'local-llm',
      name: 'local-llm',
      displayName: 'Local LLM',
      description: 'Self-hosted local language models for maximum privacy',
      requiresApiKey: false,
      enterpriseOnly: true,
      isLocalLLM: true,
      models: [
        {
          id: 'llama-2-70b',
          name: 'llama-2-70b-chat',
          displayName: 'Llama 2 70B Chat',
          description: 'Open source conversational AI model',
          contextWindow: 4096,
          maxOutputTokens: 2048,
          capabilities: ['text-generation', 'analysis', 'summarization'],
          costMultiplier: 0,
          isDefault: true
        },
        {
          id: 'codellama-34b',
          name: 'codellama-34b-instruct',
          displayName: 'Code Llama 34B',
          description: 'Code-specialized language model',
          contextWindow: 16384,
          maxOutputTokens: 2048,
          capabilities: ['text-generation', 'code-generation', 'analysis'],
          costMultiplier: 0,
          isDefault: false
        },
        {
          id: 'mistral-7b',
          name: 'mistral-7b-instruct',
          displayName: 'Mistral 7B Instruct',
          description: 'Efficient and capable open source model',
          contextWindow: 8192,
          maxOutputTokens: 2048,
          capabilities: ['text-generation', 'analysis', 'summarization'],
          costMultiplier: 0,
          isDefault: false
        }
      ],
      supportedFeatures: [
        { id: 'privacy', name: 'Complete Privacy', description: 'No data leaves your infrastructure', category: 'advanced' },
        { id: 'custom-models', name: 'Custom Models', description: 'Support for custom fine-tuned models', category: 'advanced' },
        { id: 'offline', name: 'Offline Operation', description: 'Works without internet connection', category: 'advanced' }
      ],
      pricing: {
        inputTokens: 0,
        outputTokens: 0,
        currency: 'USD'
      },
      limits: {
        maxTokens: 16384,
        requestsPerMinute: 60,
        requestsPerDay: 10000
      }
    }
  };

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * Get all available AI providers
   */
  getAvailableProviders(userPlan?: string): AIProvider[] {
    const providers = Object.values(AIProviderManager.AI_PROVIDERS);
    
    // Filter by plan if specified
    if (userPlan && userPlan !== 'enterprise') {
      return providers.filter(p => !p.enterpriseOnly);
    }
    
    return providers;
  }

  /**
   * Get provider by ID
   */
  getProvider(providerId: string): AIProvider | null {
    return AIProviderManager.AI_PROVIDERS[providerId] || null;
  }

  /**
   * Configure AI provider for organization
   */
  async configureProvider(
    organizationId: string,
    config: AIProviderConfig,
    configuredBy: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate provider exists
      const provider = this.getProvider(config.providerId);
      if (!provider) {
        return { success: false, error: 'Invalid AI provider' };
      }

      // Check if user has enterprise plan for local LLM
      if (provider.enterpriseOnly) {
        const hasEnterprise = await this.checkEnterprisePlan(organizationId);
        if (!hasEnterprise) {
          return { success: false, error: 'Enterprise plan required for this AI provider' };
        }
      }

      // Validate API key if required
      if (provider.requiresApiKey && !config.apiKey) {
        return { success: false, error: 'API key is required for this provider' };
      }

      // Test provider connection
      const connectionTest = await this.testProviderConnection(config);
      if (!connectionTest.success) {
        return { success: false, error: connectionTest.error };
      }

      // Encrypt API key before storing
      const encryptedConfig = await this.encryptProviderConfig(config);

      // Save configuration
      const { error } = await this.supabase
        .from('ai_provider_configs')
        .upsert({
          organization_id: organizationId,
          provider_id: config.providerId,
          config: encryptedConfig,
          configured_by: configuredBy,
          last_tested_at: new Date().toISOString(),
          is_active: true,
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw new Error(`Failed to save provider config: ${error.message}`);
      }

      // Log configuration
      await this.logAIEvent(organizationId, configuredBy, 'provider_configured', {
        provider_id: config.providerId,
        has_api_key: !!config.apiKey
      });

      return { success: true };

    } catch (error) {
      console.error('Configure provider error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Switch active AI provider for organization
   */
  async switchProvider(
    organizationId: string,
    providerId: string,
    modelId: string,
    switchedBy: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate provider and model
      const provider = this.getProvider(providerId);
      if (!provider) {
        return { success: false, error: 'Invalid AI provider' };
      }

      const model = provider.models.find(m => m.id === modelId);
      if (!model) {
        return { success: false, error: 'Invalid AI model' };
      }

      // Check if provider is configured
      const { data: config } = await this.supabase
        .from('ai_provider_configs')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('provider_id', providerId)
        .eq('is_active', true)
        .single();

      if (!config && provider.requiresApiKey) {
        return { success: false, error: 'Provider not configured. Please configure API settings first.' };
      }

      // Update organization's active AI settings
      const { error } = await this.supabase
        .from('organizations')
        .update({
          ai_provider: providerId,
          ai_model: modelId,
          ai_settings_updated_by: switchedBy,
          updated_at: new Date().toISOString()
        })
        .eq('id', organizationId);

      if (error) {
        throw new Error(`Failed to switch provider: ${error.message}`);
      }

      // Log the switch
      await this.logAIEvent(organizationId, switchedBy, 'provider_switched', {
        provider_id: providerId,
        model_id: modelId
      });

      return { success: true };

    } catch (error) {
      console.error('Switch provider error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Setup local LLM (Enterprise only)
   */
  async setupLocalLLM(
    organizationId: string,
    config: LocalLLMConfig,
    configuredBy: string
  ): Promise<{ success: boolean; installUrl?: string; error?: string }> {
    try {
      // Verify enterprise plan
      const hasEnterprise = await this.checkEnterprisePlan(organizationId);
      if (!hasEnterprise) {
        return { success: false, error: 'Enterprise plan required for local LLM support' };
      }

      // Validate hardware requirements
      const hardwareCheck = this.validateHardwareRequirements(config);
      if (!hardwareCheck.isValid) {
        return { success: false, error: hardwareCheck.message };
      }

      // Test local LLM connection
      const connectionTest = await this.testLocalLLMConnection(config);
      if (!connectionTest.success) {
        return { success: false, error: connectionTest.error };
      }

      // Save local LLM configuration
      const { error } = await this.supabase
        .from('local_llm_configs')
        .upsert({
          organization_id: organizationId,
          model_name: config.modelName,
          model_path: config.modelPath,
          server_url: config.serverUrl,
          hardware_config: config.hardware,
          performance_config: config.performance,
          configured_by: configuredBy,
          status: 'active',
          last_tested_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        });

      if (error) {
        throw new Error(`Failed to save local LLM config: ${error.message}`);
      }

      // Generate installation guide URL
      const installUrl = this.generateInstallationGuide(config);

      // Log setup
      await this.logAIEvent(organizationId, configuredBy, 'local_llm_configured', {
        model_name: config.modelName,
        hardware: config.hardware
      });

      return { 
        success: true, 
        installUrl 
      };

    } catch (error) {
      console.error('Setup local LLM error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get organization's current AI configuration
   */
  async getOrganizationAIConfig(organizationId: string): Promise<{
    provider: AIProvider | null;
    model: AIModel | null;
    config: any;
    isLocalLLM: boolean;
  }> {
    try {
      // Get organization's AI settings
      const { data: org } = await this.supabase
        .from('organizations')
        .select('ai_provider, ai_model')
        .eq('id', organizationId)
        .single();

      if (!org?.ai_provider) {
        return { provider: null, model: null, config: null, isLocalLLM: false };
      }

      const provider = this.getProvider(org.ai_provider);
      if (!provider) {
        return { provider: null, model: null, config: null, isLocalLLM: false };
      }

      const model = provider.models.find(m => m.id === org.ai_model) || provider.models[0];

      // Get provider configuration
      let config = null;
      if (provider.requiresApiKey || provider.isLocalLLM) {
        const { data: configData } = await this.supabase
          .from(provider.isLocalLLM ? 'local_llm_configs' : 'ai_provider_configs')
          .select('*')
          .eq('organization_id', organizationId)
          .eq(provider.isLocalLLM ? 'status' : 'is_active', provider.isLocalLLM ? 'active' : true)
          .single();

        config = configData;
      }

      return {
        provider,
        model,
        config,
        isLocalLLM: provider.isLocalLLM
      };

    } catch (error) {
      console.error('Get AI config error:', error);
      return { provider: null, model: null, config: null, isLocalLLM: false };
    }
  }

  /**
   * Get usage statistics for AI providers
   */
  async getProviderUsageStats(
    organizationId: string,
    timeframe: 'day' | 'week' | 'month' = 'month'
  ): Promise<{
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    byProvider: Record<string, {
      requests: number;
      tokens: number;
      cost: number;
    }>;
  }> {
    try {
      const startDate = this.getStartDate(timeframe);

      const { data: usage } = await this.supabase
        .from('ai_usage_logs')
        .select('*')
        .eq('organization_id', organizationId)
        .gte('created_at', startDate.toISOString());

      if (!usage) {
        return { totalRequests: 0, totalTokens: 0, totalCost: 0, byProvider: {} };
      }

      const stats = {
        totalRequests: usage.length,
        totalTokens: usage.reduce((sum, u) => sum + u.tokens_used, 0),
        totalCost: usage.reduce((sum, u) => sum + u.cost, 0),
        byProvider: {} as Record<string, any>
      };

      // Group by provider
      for (const log of usage) {
        if (!stats.byProvider[log.provider_id as string]) {
          stats.byProvider[log.provider_id as string] = {
            requests: 0,
            tokens: 0,
            cost: 0
          };
        }

        stats.byProvider[log.provider_id as string].requests++;
        stats.byProvider[log.provider_id as string].tokens += log.tokens_used as number;
        stats.byProvider[log.provider_id as string].cost += log.cost as number;
      }

      return stats;

    } catch (error) {
      console.error('Get usage stats error:', error);
      return { totalRequests: 0, totalTokens: 0, totalCost: 0, byProvider: {} };
    }
  }

  /**
   * Private helper methods
   */
  private async checkEnterprisePlan(organizationId: string): Promise<boolean> {
    try {
      const { data: subscription } = await this.supabase
        .from('organization_subscriptions')
        .select('plan')
        .eq('organization_id', organizationId)
        .eq('status', 'active')
        .single();

      return subscription?.plan === 'enterprise';

    } catch (error) {
      return false;
    }
  }

  private async testProviderConnection(config: AIProviderConfig): Promise<{ success: boolean; error?: string }> {
    try {
      // This would make a test API call to validate the configuration
      // For now, we'll simulate the test
      if (config.providerId === 'openai' && config.apiKey?.startsWith('sk-')) {
        return { success: true };
      }
      if (config.providerId === 'anthropic' && config.apiKey?.startsWith('sk-ant-')) {
        return { success: true };
      }

      return { success: false, error: 'Invalid API key format' };

    } catch (error) {
      return { success: false, error: 'Connection test failed' };
    }
  }

  private async testLocalLLMConnection(config: LocalLLMConfig): Promise<{ success: boolean; error?: string }> {
    try {
      // This would test the local LLM server connection
      // For now, we'll simulate the test
      if (config.serverUrl && config.modelName) {
        return { success: true };
      }

      return { success: false, error: 'Invalid local LLM configuration' };

    } catch (error) {
      return { success: false, error: 'Local LLM connection test failed' };
    }
  }

  private validateHardwareRequirements(config: LocalLLMConfig): { isValid: boolean; message?: string } {
    // Minimum requirements for local LLM
    const minRequirements = {
      memoryGB: 16,
      threads: 4
    };

    if (config.hardware.memoryGB < minRequirements.memoryGB) {
      return { 
        isValid: false, 
        message: `Minimum ${minRequirements.memoryGB}GB RAM required for local LLM` 
      };
    }

    if (config.hardware.threads < minRequirements.threads) {
      return { 
        isValid: false, 
        message: `Minimum ${minRequirements.threads} CPU threads required` 
      };
    }

    return { isValid: true };
  }

  private async encryptProviderConfig(config: AIProviderConfig): Promise<any> {
    // This would encrypt sensitive data like API keys
    // For now, we'll just return the config (in production, encrypt the API key)
    return {
      ...config,
      apiKey: config.apiKey ? `encrypted_${config.apiKey.slice(-4)}` : undefined
    };
  }

  private generateInstallationGuide(config: LocalLLMConfig): string {
    // Generate a URL to installation documentation
    return `${process.env.NEXT_PUBLIC_APP_URL}/docs/local-llm/setup?model=${config.modelName}`;
  }

  private getStartDate(timeframe: 'day' | 'week' | 'month'): Date {
    const now = new Date();
    switch (timeframe) {
      case 'day':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  private async logAIEvent(
    organizationId: string,
    userId: string,
    eventType: string,
    eventData: any
  ): Promise<void> {
    await this.supabase
      .from('ai_events')
      .insert({
        organization_id: organizationId,
        user_id: userId,
        event_type: eventType,
        event_data: eventData,
        created_at: new Date().toISOString()
      });
  }
}

export default AIProviderManager;