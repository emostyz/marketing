import { NextRequest, NextResponse } from 'next/server'
import { AuthSystem } from '@/lib/auth/auth-system'
import { BrainConfigManager } from '@/lib/ai/brain-config'
import { AI_PROVIDERS } from '@/lib/ai/brain-controller'

export async function GET(request: NextRequest) {
  try {
    const user = await AuthSystem.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const configManager = BrainConfigManager.getInstance()
    
    // Get current user configuration
    const brainConfig = await configManager.getBrainConfig(user.id.toString())
    
    // Get available providers
    const availableProviders = Object.values(AI_PROVIDERS).map(provider => ({
      id: provider.id,
      name: provider.name,
      type: provider.type,
      models: provider.models,
      features: provider.features,
      pricing: provider.pricing,
      tokenLimits: provider.tokenLimits
    }))

    // Check provider health
    const providerHealth = await configManager.checkProviderHealth(user.id.toString())

    // Get cost estimates
    const costEstimates = await configManager.estimateUsageCost(
      user.id.toString(),
      10, // 10 requests per day
      2000 // 2000 tokens per request
    )

    return NextResponse.json({
      success: true,
      currentConfig: {
        defaultProvider: brainConfig.defaultProvider,
        fallbackProviders: brainConfig.fallbackProviders,
        tokenManagement: brainConfig.tokenManagement,
        enterpriseMode: brainConfig.enterpriseMode
      },
      availableProviders,
      providerHealth,
      costEstimates,
      userApiKeys: Object.keys(brainConfig.userApiKeys), // Don't return actual keys
      customEndpoints: Object.keys(brainConfig.customEndpoints)
    })

  } catch (error) {
    console.error('Error fetching AI settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AI settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await AuthSystem.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      defaultProvider,
      customApiKeys = {},
      customEndpoints = {},
      modelPreferences = {},
      privacySettings = {
        allowDataLogging: true,
        preferLocalModels: false,
        requireOnPremise: false
      }
    } = await request.json()

    // Validate provider
    if (defaultProvider && !AI_PROVIDERS[defaultProvider]) {
      return NextResponse.json(
        { error: `Invalid provider: ${defaultProvider}` },
        { status: 400 }
      )
    }

    // Validate API keys format (don't store invalid keys)
    const validatedApiKeys: Record<string, string> = {}
    for (const [provider, key] of Object.entries(customApiKeys)) {
      if (typeof key === 'string' && key.length > 10) {
        validatedApiKeys[provider] = key
      }
    }

    // Validate endpoints format
    const validatedEndpoints: Record<string, string> = {}
    for (const [provider, endpoint] of Object.entries(customEndpoints)) {
      if (typeof endpoint === 'string' && (endpoint.startsWith('http://') || endpoint.startsWith('https://'))) {
        validatedEndpoints[provider] = endpoint
      }
    }

    const configManager = BrainConfigManager.getInstance()
    
    // Save user preferences
    await configManager.saveUserPreferences({
      userId: user.id.toString(),
      defaultProvider: defaultProvider || 'openai',
      customApiKeys: validatedApiKeys,
      customEndpoints: validatedEndpoints,
      modelPreferences,
      privacySettings
    })

    return NextResponse.json({
      success: true,
      message: 'AI settings updated successfully'
    })

  } catch (error) {
    console.error('Error updating AI settings:', error)
    return NextResponse.json(
      { error: 'Failed to update AI settings' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await AuthSystem.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { provider } = await request.json()

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider is required' },
        { status: 400 }
      )
    }

    const configManager = BrainConfigManager.getInstance()
    const brainConfig = await configManager.getBrainConfig(user.id.toString())

    // Remove API key and endpoint for provider
    delete brainConfig.userApiKeys[provider]
    delete brainConfig.customEndpoints[provider]

    // Update preferences
    await configManager.saveUserPreferences({
      userId: user.id.toString(),
      defaultProvider: brainConfig.defaultProvider,
      customApiKeys: brainConfig.userApiKeys,
      customEndpoints: brainConfig.customEndpoints,
      modelPreferences: brainConfig.modelPreferences,
      privacySettings: {
        allowDataLogging: true,
        preferLocalModels: false,
        requireOnPremise: false
      }
    })

    return NextResponse.json({
      success: true,
      message: `Removed configuration for ${provider}`
    })

  } catch (error) {
    console.error('Error removing AI provider:', error)
    return NextResponse.json(
      { error: 'Failed to remove AI provider' },
      { status: 500 }
    )
  }
}