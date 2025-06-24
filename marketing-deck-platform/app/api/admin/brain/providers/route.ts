import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')
    
    // Verify user authentication
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    // Get organization brain configuration
    const { data: brainConfig } = await supabase
      .from('organization_brain_configs')
      .select('config')
      .eq('organization_id', organizationId)
      .single()

    // Get AI provider configurations
    const { data: aiConfigs } = await supabase
      .from('ai_provider_configs')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)

    // Get local LLM configurations
    const { data: localConfigs } = await supabase
      .from('local_llm_configs')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('status', 'active')

    const providers = []

    // Add brain config providers
    if (brainConfig?.config?.providers) {
      providers.push(...brainConfig.config.providers)
    }

    // Add AI provider configs
    for (const aiConfig of aiConfigs || []) {
      providers.push({
        id: `ai_${aiConfig.provider_id}`,
        name: aiConfig.provider_id,
        displayName: `${aiConfig.provider_id} (Organization)`,
        type: aiConfig.provider_id,
        config: aiConfig.config,
        isActive: true,
        priority: 90
      })
    }

    // Add local LLM configs
    for (const localConfig of localConfigs || []) {
      providers.push({
        id: `local_${localConfig.model_name}`,
        name: localConfig.model_name,
        displayName: `${localConfig.model_name} (Local)`,
        type: 'local',
        config: {
          baseUrl: localConfig.server_url,
          model: localConfig.model_name,
          maxTokens: 4096,
          temperature: 0.7,
          systemPrompt: 'You are an expert business analyst.'
        },
        isActive: true,
        priority: 95
      })
    }

    return NextResponse.json({
      success: true,
      providers
    })

  } catch (error) {
    console.error('Get brain providers error:', error)
    return NextResponse.json({ 
      error: 'Failed to get brain providers',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}