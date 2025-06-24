/**
 * Master Brain System - Swappable AI Provider Architecture
 * Allows backend or enterprise users to swap AI providers seamlessly
 */

import { createClient } from '@supabase/supabase-js';

export interface BrainProvider {
  id: string;
  name: string;
  displayName: string;
  type: 'openai' | 'anthropic' | 'local' | 'custom';
  config: {
    apiKey?: string;
    baseUrl?: string;
    model: string;
    maxTokens: number;
    temperature: number;
    systemPrompt: string;
    customHeaders?: Record<string, string>;
  };
  isActive: boolean;
  priority: number; // Higher number = higher priority for fallback
}

export interface BrainRequest {
  userId: string;
  organizationId?: string;
  data: any[];
  context: {
    industry: string;
    targetAudience: string;
    businessContext: string;
    description: string;
    factors?: string[];
  };
  timeFrame: any;
  requirements: any;
  userTier: 'demo' | 'starter' | 'professional' | 'enterprise';
}

export interface BrainResponse {
  success: boolean;
  result?: any;
  error?: string;
  metadata?: {
    provider: string;
    model: string;
    tokensUsed: number;
    cost: number;
    processingTime: number;
    fallbackUsed?: boolean;
  };
}

export class MasterBrain {
  private supabase: ReturnType<typeof createClient>;
  private providers: Map<string, BrainProvider> = new Map();
  private fallbackChain: string[] = [];

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * Initialize brain with available providers
   */
  async initialize(organizationId?: string): Promise<void> {
    try {
      // Load system default providers
      await this.loadSystemProviders();

      // Load organization-specific providers if enterprise
      if (organizationId) {
        await this.loadOrganizationProviders(organizationId);
      }

      // Build fallback chain based on priority
      this.buildFallbackChain();

    } catch (error) {
      console.error('Master brain initialization error:', error);
      // Load emergency fallback
      await this.loadEmergencyFallback();
    }
  }

  /**
   * Process analysis request with automatic provider selection and fallback
   */
  async processAnalysis(request: BrainRequest): Promise<BrainResponse> {
    const startTime = Date.now();
    let lastError: Error | null = null;

    // Get appropriate providers for user tier
    const availableProviders = this.getProvidersForTier(request.userTier);

    if (availableProviders.length === 0) {
      return {
        success: false,
        error: 'No AI providers available for your tier'
      };
    }

    // Try each provider in order
    for (const providerId of availableProviders) {
      const provider = this.providers.get(providerId);
      if (!provider || !provider.isActive) continue;

      try {
        const result = await this.processWithProvider(provider, request);
        
        // Log successful usage
        await this.logUsage(request.userId, provider, result.metadata || {}, true);

        return {
          ...result,
          metadata: {
            ...result.metadata,
            provider: provider.displayName,
            processingTime: Date.now() - startTime,
            fallbackUsed: availableProviders.indexOf(providerId) > 0
          }
        };

      } catch (error) {
        console.error(`Provider ${provider.name} failed:`, error);
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // Log failed attempt
        await this.logUsage(request.userId, provider, { error: error instanceof Error ? error.message : 'Unknown error' }, false);
        
        // Continue to next provider
        continue;
      }
    }

    // All providers failed
    return {
      success: false,
      error: lastError?.message || 'All AI providers failed',
      metadata: {
        provider: 'none',
        processingTime: Date.now() - startTime,
        fallbackUsed: true
      }
    };
  }

  /**
   * Load or reload providers for organization (Enterprise feature)
   */
  async reloadProviders(organizationId: string, requestedBy: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if user has permission to reload providers
      const hasPermission = await this.checkReloadPermission(requestedBy, organizationId);
      if (!hasPermission) {
        return { success: false, error: 'Insufficient permissions to reload providers' };
      }

      // Clear current organization providers
      this.clearOrganizationProviders(organizationId);

      // Reload from database
      await this.loadOrganizationProviders(organizationId);

      // Rebuild fallback chain
      this.buildFallbackChain();

      // Log the reload
      await this.logBrainEvent(organizationId, requestedBy, 'providers_reloaded', {
        providerCount: this.providers.size,
        reloadedAt: new Date().toISOString()
      });

      return { success: true };

    } catch (error) {
      console.error('Reload providers error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Update brain configuration (Enterprise only)
   */
  async updateBrainConfig(
    organizationId: string,
    config: {
      providers: BrainProvider[];
      systemPrompts?: Record<string, string>;
      fallbackStrategy?: 'sequential' | 'parallel' | 'cost-optimized';
    },
    updatedBy: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Verify enterprise permissions
      const isEnterprise = await this.checkEnterpriseAccess(organizationId);
      if (!isEnterprise) {
        return { success: false, error: 'Enterprise subscription required for custom brain configuration' };
      }

      // Validate provider configurations
      for (const provider of config.providers) {
        const validation = await this.validateProviderConfig(provider);
        if (!validation.isValid) {
          return { success: false, error: `Invalid provider config for ${provider.name}: ${validation.error}` };
        }
      }

      // Save configuration to database
      const { error } = await this.supabase
        .from('organization_brain_configs')
        .upsert({
          organization_id: organizationId,
          config: config,
          updated_by: updatedBy,
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw new Error(`Failed to save brain config: ${error.message}`);
      }

      // Reload providers with new configuration
      await this.reloadProviders(organizationId, updatedBy);

      return { success: true };

    } catch (error) {
      console.error('Update brain config error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get brain status and configuration
   */
  async getBrainStatus(organizationId?: string): Promise<{
    providers: Array<{
      id: string;
      name: string;
      status: 'active' | 'inactive' | 'error';
      lastUsed?: Date;
      usage24h: number;
      avgResponseTime: number;
    }>;
    fallbackChain: string[];
    configuration: any;
  }> {
    try {
      const providerStatus = [];

      for (const [id, provider] of this.providers) {
        // Get usage stats for last 24h
        const { data: usage } = await this.supabase
          .from('brain_usage_logs')
          .select('*')
          .eq('provider_id', id)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const usage24h = usage?.length || 0;
      const avgResponseTime = usage?.reduce((sum, u) => sum + (u.response_time || 0), 0) / (usage?.length || 1);

        providerStatus.push({
          id,
          name: provider.displayName,
          status: provider.isActive ? 'active' : 'inactive',
          lastUsed: usage?.[0] ? new Date(usage[0].created_at) : undefined,
          usage24h,
          avgResponseTime
        });
      }

      return {
        providers: providerStatus,
        fallbackChain: this.fallbackChain,
        configuration: organizationId ? await this.getOrganizationConfig(organizationId) : null
      };

    } catch (error) {
      console.error('Get brain status error:', error);
      return {
        providers: [],
        fallbackChain: [],
        configuration: null
      };
    }
  }

  /**
   * Private methods
   */
  private async loadSystemProviders(): Promise<void> {
    // Load default system providers
    const defaultProviders: BrainProvider[] = [
      {
        id: 'system_openai_gpt4',
        name: 'system_openai_gpt4',
        displayName: 'OpenAI GPT-4 (System)',
        type: 'openai',
        config: {
          apiKey: process.env.OPENAI_API_KEY || '',
          baseUrl: 'https://api.openai.com/v1',
          model: 'gpt-4-turbo-preview',
          maxTokens: 4096,
          temperature: 0.7,
          systemPrompt: this.getDefaultSystemPrompt()
        },
        isActive: !!process.env.OPENAI_API_KEY,
        priority: 100
      },
      {
        id: 'system_openai_gpt35',
        name: 'system_openai_gpt35',
        displayName: 'OpenAI GPT-3.5 (Fallback)',
        type: 'openai',
        config: {
          apiKey: process.env.OPENAI_API_KEY || '',
          baseUrl: 'https://api.openai.com/v1',
          model: 'gpt-3.5-turbo',
          maxTokens: 4096,
          temperature: 0.7,
          systemPrompt: this.getDefaultSystemPrompt()
        },
        isActive: !!process.env.OPENAI_API_KEY,
        priority: 80
      }
    ];

    for (const provider of defaultProviders) {
      this.providers.set(provider.id, provider);
    }
  }

  private async loadOrganizationProviders(organizationId: string): Promise<void> {
    try {
      // Load custom providers from database
      const { data: config } = await this.supabase
        .from('organization_brain_configs')
        .select('config')
        .eq('organization_id', organizationId)
        .single();

      if (config?.config?.providers) {
        for (const provider of config.config.providers) {
          this.providers.set(provider.id, {
            ...provider,
            id: `org_${organizationId}_${provider.id}`
          });
        }
      }

      // Load AI provider configurations
      const { data: aiConfigs } = await this.supabase
        .from('ai_provider_configs')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_active', true);

      for (const aiConfig of aiConfigs || []) {
        const provider: BrainProvider = {
          id: `ai_${aiConfig.provider_id}`,
          name: aiConfig.provider_id,
          displayName: `${aiConfig.provider_id} (Organization)`,
          type: aiConfig.provider_id as any,
          config: {
            ...aiConfig.config,
            systemPrompt: this.getDefaultSystemPrompt()
          },
          isActive: true,
          priority: 90
        };

        this.providers.set(provider.id, provider);
      }

      // Load local LLM configurations
      const { data: localConfigs } = await this.supabase
        .from('local_llm_configs')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('status', 'active');

      for (const localConfig of localConfigs || []) {
        const provider: BrainProvider = {
          id: `local_${localConfig.model_name}`,
          name: localConfig.model_name,
          displayName: `${localConfig.model_name} (Local)`,
          type: 'local',
          config: {
            baseUrl: localConfig.server_url,
            model: localConfig.model_name,
            maxTokens: 4096,
            temperature: 0.7,
            systemPrompt: this.getDefaultSystemPrompt()
          },
          isActive: true,
          priority: 95 // Local LLMs get high priority for enterprise
        };

        this.providers.set(provider.id, provider);
      }

    } catch (error) {
      console.error('Load organization providers error:', error);
    }
  }

  private buildFallbackChain(): void {
    // Sort providers by priority (highest first)
    const sortedProviders = Array.from(this.providers.values())
      .filter(p => p.isActive)
      .sort((a, b) => b.priority - a.priority);

    this.fallbackChain = sortedProviders.map(p => p.id);
  }

  private getProvidersForTier(userTier: string): string[] {
    switch (userTier) {
      case 'demo':
        // Demo users get limited access to system providers only
        return this.fallbackChain.filter(id => id.startsWith('system_')).slice(0, 2);
      
      case 'starter':
        // Starter gets system providers
        return this.fallbackChain.filter(id => id.startsWith('system_'));
      
      case 'professional':
        // Professional gets system + some AI providers
        return this.fallbackChain.filter(id => 
          id.startsWith('system_') || id.startsWith('ai_')
        );
      
      case 'enterprise':
        // Enterprise gets everything including local LLMs
        return this.fallbackChain;
      
      default:
        return this.fallbackChain.filter(id => id.startsWith('system_')).slice(0, 1);
    }
  }

  private async processWithProvider(provider: BrainProvider, request: BrainRequest): Promise<BrainResponse> {
    const startTime = Date.now();

    try {
      let result: any;
      let tokensUsed = 0;
      let cost = 0;

      switch (provider.type) {
        case 'openai':
          result = await this.processWithOpenAI(provider, request);
          tokensUsed = result.usage?.total_tokens || 0;
          cost = this.calculateOpenAICost(tokensUsed, provider.config.model);
          break;

        case 'anthropic':
          result = await this.processWithAnthropic(provider, request);
          tokensUsed = result.usage?.input_tokens + result.usage?.output_tokens || 0;
          cost = this.calculateAnthropicCost(tokensUsed, provider.config.model);
          break;

        case 'local':
          result = await this.processWithLocalLLM(provider, request);
          tokensUsed = result.usage?.total_tokens || 0;
          cost = 0; // Local LLMs have no cost
          break;

        case 'custom':
          result = await this.processWithCustomProvider(provider, request);
          tokensUsed = result.usage?.total_tokens || 0;
          cost = 0; // Custom providers manage their own costs
          break;

        default:
          throw new Error(`Unsupported provider type: ${provider.type}`);
      }

      return {
        success: true,
        result: result.content || result,
        metadata: {
          provider: provider.name,
          model: provider.config.model,
          tokensUsed,
          cost,
          processingTime: Date.now() - startTime
        }
      };

    } catch (error) {
      throw error;
    }
  }

  private async processWithOpenAI(provider: BrainProvider, request: BrainRequest): Promise<any> {
    const OpenAI = (await import('openai')).default;
    const openai = new OpenAI({
      apiKey: provider.config.apiKey,
      baseURL: provider.config.baseUrl
    });

    const messages = [
      {
        role: 'system' as const,
        content: provider.config.systemPrompt
      },
      {
        role: 'user' as const,
        content: this.buildPrompt(request)
      }
    ];

    const response = await openai.chat.completions.create({
      model: provider.config.model,
      messages,
      max_tokens: provider.config.maxTokens,
      temperature: provider.config.temperature,
    });

    return {
      content: JSON.parse(response.choices[0].message.content || '{}'),
      usage: response.usage
    };
  }

  private async processWithAnthropic(provider: BrainProvider, request: BrainRequest): Promise<any> {
    // Anthropic implementation
    const response = await fetch(provider.config.baseUrl || 'https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': provider.config.apiKey || '',
        'anthropic-version': '2023-06-01',
        ...provider.config.customHeaders
      },
      body: JSON.stringify({
        model: provider.config.model,
        max_tokens: provider.config.maxTokens,
        temperature: provider.config.temperature,
        system: provider.config.systemPrompt,
        messages: [{
          role: 'user',
          content: this.buildPrompt(request)
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const result = await response.json();
    return {
      content: JSON.parse(result.content[0].text),
      usage: result.usage
    };
  }

  private async processWithLocalLLM(provider: BrainProvider, request: BrainRequest): Promise<any> {
    // Local LLM implementation (Ollama compatible)
    const response = await fetch(`${provider.config.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...provider.config.customHeaders
      },
      body: JSON.stringify({
        model: provider.config.model,
        prompt: `${provider.config.systemPrompt}\n\nUser: ${this.buildPrompt(request)}\n\nAssistant:`,
        stream: false,
        options: {
          temperature: provider.config.temperature,
          num_ctx: provider.config.maxTokens
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Local LLM error: ${response.status}`);
    }

    const result = await response.json();
    return {
      content: JSON.parse(result.response),
      usage: { total_tokens: result.eval_count + result.prompt_eval_count }
    };
  }

  private async processWithCustomProvider(provider: BrainProvider, request: BrainRequest): Promise<any> {
    // Custom provider implementation - follows OpenAI-compatible API
    const response = await fetch(`${provider.config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.config.apiKey}`,
        ...provider.config.customHeaders
      },
      body: JSON.stringify({
        model: provider.config.model,
        messages: [
          { role: 'system', content: provider.config.systemPrompt },
          { role: 'user', content: this.buildPrompt(request) }
        ],
        max_tokens: provider.config.maxTokens,
        temperature: provider.config.temperature
      })
    });

    if (!response.ok) {
      throw new Error(`Custom provider error: ${response.status}`);
    }

    const result = await response.json();
    return {
      content: JSON.parse(result.choices[0].message.content),
      usage: result.usage
    };
  }

  private buildPrompt(request: BrainRequest): string {
    // Use the same prompt building logic as enhanced-brain-v2
    return JSON.stringify({
      data: request.data,
      context: request.context,
      timeFrame: request.timeFrame,
      requirements: request.requirements
    });
  }

  private getDefaultSystemPrompt(): string {
    return `You are an expert business analyst and presentation designer. Your task is to analyze data and create compelling business presentations with actionable insights.

Always respond with valid JSON in this exact format:
{
  "insights": [{"title": "string", "description": "string", "impact": "high|medium|low"}],
  "narrative": {"theme": "string", "storyline": "string"},
  "slideStructure": [{"title": "string", "type": "string", "content": {"summary": "string"}}],
  "keyMetrics": [{"name": "string", "value": "string", "trend": "string"}]
}

Focus on finding non-obvious insights and creating a compelling narrative that drives business decisions.`;
  }

  private calculateOpenAICost(tokens: number, model: string): number {
    const rates: Record<string, { input: number; output: number }> = {
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-4-turbo-preview': { input: 0.01, output: 0.03 },
      'gpt-3.5-turbo': { input: 0.001, output: 0.002 }
    };

    const rate = rates[model] || rates['gpt-3.5-turbo'];
    return (tokens / 1000) * ((rate.input + rate.output) / 2);
  }

  private calculateAnthropicCost(tokens: number, model: string): number {
    const rates: Record<string, { input: number; output: number }> = {
      'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
      'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 }
    };

    const rate = rates[model] || rates['claude-3-sonnet-20240229'];
    return (tokens / 1000) * ((rate.input + rate.output) / 2);
  }

  private async validateProviderConfig(provider: BrainProvider): Promise<{ isValid: boolean; error?: string }> {
    try {
      // Basic validation
      if (!provider.config.model) {
        return { isValid: false, error: 'Model is required' };
      }

      if (provider.type !== 'local' && !provider.config.apiKey) {
        return { isValid: false, error: 'API key is required for non-local providers' };
      }

      // Test connection (simplified)
      if (provider.type === 'local' && provider.config.baseUrl) {
        try {
          const response = await fetch(`${provider.config.baseUrl}/api/tags`, { 
            method: 'GET',
            signal: AbortSignal.timeout(5000)
          });
          if (!response.ok) {
            return { isValid: false, error: 'Cannot connect to local LLM server' };
          }
        } catch {
          return { isValid: false, error: 'Local LLM server unreachable' };
        }
      }

      return { isValid: true };

    } catch (error) {
      return { 
        isValid: false, 
        error: error instanceof Error ? error.message : 'Unknown validation error' 
      };
    }
  }

  private async loadEmergencyFallback(): Promise<void> {
    // Load minimal fallback provider
    const emergencyProvider: BrainProvider = {
      id: 'emergency_fallback',
      name: 'emergency_fallback',
      displayName: 'Emergency Fallback',
      type: 'openai',
      config: {
        apiKey: process.env.OPENAI_API_KEY || 'missing',
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-3.5-turbo',
        maxTokens: 1000,
        temperature: 0.7,
        systemPrompt: 'You are a helpful assistant. Respond with simple JSON analysis.'
      },
      isActive: !!process.env.OPENAI_API_KEY,
      priority: 1
    };

    this.providers.set(emergencyProvider.id, emergencyProvider);
    this.fallbackChain = [emergencyProvider.id];
  }

  private clearOrganizationProviders(organizationId: string): void {
    for (const [id, provider] of this.providers) {
      if (id.startsWith(`org_${organizationId}_`) || 
          id.startsWith('ai_') || 
          id.startsWith('local_')) {
        this.providers.delete(id);
      }
    }
  }

  private async checkReloadPermission(userId: string, organizationId: string): Promise<boolean> {
    const { data: member } = await this.supabase
      .from('team_members')
      .select('role')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .single();

    return member?.role === 'admin' || member?.role === 'owner';
  }

  private async checkEnterpriseAccess(organizationId: string): Promise<boolean> {
    const { data: subscription } = await this.supabase
      .from('organization_subscriptions')
      .select('plan')
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .single();

    return subscription?.plan === 'enterprise';
  }

  private async getOrganizationConfig(organizationId: string): Promise<any> {
    const { data: config } = await this.supabase
      .from('organization_brain_configs')
      .select('config')
      .eq('organization_id', organizationId)
      .single();

    return config?.config || null;
  }

  private async logUsage(
    userId: string, 
    provider: BrainProvider, 
    metadata: any, 
    success: boolean
  ): Promise<void> {
    await this.supabase
      .from('brain_usage_logs')
      .insert({
        user_id: userId,
        provider_id: provider.id,
        provider_name: provider.name,
        success,
        tokens_used: metadata.tokensUsed || 0,
        cost: metadata.cost || 0,
        response_time: metadata.processingTime || 0,
        error_message: metadata.error,
        created_at: new Date().toISOString()
      });
  }

  private async logBrainEvent(
    organizationId: string,
    userId: string,
    eventType: string,
    eventData: any
  ): Promise<void> {
    await this.supabase
      .from('brain_events')
      .insert({
        organization_id: organizationId,
        user_id: userId,
        event_type: eventType,
        event_data: eventData,
        created_at: new Date().toISOString()
      });
  }
}

export default MasterBrain;