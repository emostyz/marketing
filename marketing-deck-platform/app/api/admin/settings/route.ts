import { NextRequest, NextResponse } from 'next/server'
import { AdminAuth } from '@/lib/auth/admin-auth'
import { createServerSupabaseClient } from '@/lib/supabase/server-client'

export async function GET(request: NextRequest) {
  try {
    const { isAdmin, admin } = await AdminAuth.requireAdmin(request)
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const supabase = await createServerSupabaseClient()
    
    // Get all platform settings
    const { data: settingsData, error } = await supabase
      .from('platform_settings')
      .select('setting_key, setting_value, setting_type')

    if (error) {
      console.error('Error fetching settings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch settings' },
        { status: 500 }
      )
    }

    // Organize settings by type
    const settings = {
      general: {
        site_name: 'AEDRIN',
        site_tagline: 'Transform Your Data Into Stunning Presentations',
        contact_email: 'support@aedrin.com'
      },
      features: {
        ai_analysis: true,
        templates: true,
        exports: true,
        collaboration: true
      },
      limits: {
        max_file_size: 50,
        max_presentations_per_user: 100
      },
      ui: {
        default_theme: 'professional',
        primary_color: '#3B82F6',
        secondary_color: '#8B5CF6'
      },
      api: {
        openai_key: process.env.OPENAI_API_KEY || '',
        openai_model: 'gpt-4',
        anthropic_key: '',
        anthropic_model: 'claude-3-sonnet',
        google_key: '',
        google_model: 'gemini-pro',
        active_provider: 'openai'
      }
    }

    // Override with database values
    settingsData?.forEach(setting => {
      const [category, key] = setting.setting_key.split('.')
      if (settings[category as keyof typeof settings] && key) {
        try {
          const value = JSON.parse(setting.setting_value)
          ;(settings[category as keyof typeof settings] as any)[key] = value
        } catch {
          // If JSON parsing fails, use as string
          ;(settings[category as keyof typeof settings] as any)[key] = setting.setting_value
        }
      } else {
        // Handle top-level settings
        try {
          const value = JSON.parse(setting.setting_value)
          const category = setting.setting_type as keyof typeof settings
          if (settings[category]) {
            const settingKey = setting.setting_key.replace(/^[^.]*\./, '')
            ;(settings[category] as any)[settingKey || setting.setting_key] = value
          }
        } catch {
          // Handle as needed
        }
      }
    })

    // Log admin action
    if (admin) {
      await AdminAuth.logAdminActivity(
        admin.id,
        'settings_viewed',
        {},
        'settings',
        undefined,
        request
      )
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Admin settings fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { isAdmin, admin } = await AdminAuth.requireAdmin(request)
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const settings = await request.json()
    const supabase = await createServerSupabaseClient()

    // Update platform settings in database
    const settingUpdates = []

    for (const [category, categorySettings] of Object.entries(settings)) {
      for (const [key, value] of Object.entries(categorySettings as any)) {
        settingUpdates.push({
          setting_key: `${category}.${key}`,
          setting_value: JSON.stringify(value),
          setting_type: category,
          updated_by: admin?.id
        })
      }
    }

    // Batch upsert settings
    const { error: upsertError } = await supabase
      .from('platform_settings')
      .upsert(settingUpdates, { 
        onConflict: 'setting_key',
        ignoreDuplicates: false 
      })

    if (upsertError) {
      console.error('Error updating settings:', upsertError)
      return NextResponse.json(
        { error: 'Failed to update settings' },
        { status: 500 }
      )
    }

    // Update environment variables for API keys
    if (settings.api) {
      try {
        await updateEnvironmentVariables(settings.api)
      } catch (envError) {
        console.error('Error updating environment variables:', envError)
        // Continue execution - this is not critical
      }
    }

    // Update configuration files if needed
    if (settings.general || settings.ui) {
      try {
        await updateConfigurationFiles(settings)
      } catch (configError) {
        console.error('Error updating configuration files:', configError)
        // Continue execution
      }
    }

    // Log admin action
    if (admin) {
      await AdminAuth.logAdminActivity(
        admin.id,
        'settings_updated',
        { 
          categories_updated: Object.keys(settings),
          settings_count: settingUpdates.length
        },
        'settings',
        undefined,
        request
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Settings updated successfully'
    })
  } catch (error) {
    console.error('Admin settings update error:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}

async function updateEnvironmentVariables(apiSettings: any) {
  // This would update .env.local file in a real implementation
  // For now, we'll just log the changes
  console.log('Environment variables to update:', {
    OPENAI_API_KEY: apiSettings.openai_key ? '[UPDATED]' : '[REMOVED]',
    ANTHROPIC_API_KEY: apiSettings.anthropic_key ? '[UPDATED]' : '[REMOVED]',
    GOOGLE_API_KEY: apiSettings.google_key ? '[UPDATED]' : '[REMOVED]'
  })
}

async function updateConfigurationFiles(settings: any) {
  // This would update configuration files and trigger rebuilds
  // For now, we'll just log the changes
  console.log('Configuration files to update:', {
    homepage: settings.general ? 'Update site name and tagline' : 'No changes',
    theme: settings.ui ? 'Update colors and theme' : 'No changes'
  })
}