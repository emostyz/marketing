import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user settings
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (settingsError && settingsError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Settings fetch error:', settingsError);
      return NextResponse.json(
        { error: 'Failed to fetch settings' },
        { status: 500 }
      );
    }

    // If no settings exist, create default ones
    if (!settings) {
      const { data: newSettings, error: createError } = await supabase
        .from('user_settings')
        .insert({
          user_id: user.id,
          theme_preference: 'system',
          email_notifications: true,
          marketing_emails: false,
          auto_save_interval: 30,
          default_export_format: 'pdf',
          ai_assistance_level: 'standard'
        })
        .select()
        .single();

      if (createError) {
        console.error('Settings creation error:', createError);
        return NextResponse.json(
          { error: 'Failed to create settings' },
          { status: 500 }
        );
      }

      return NextResponse.json({ settings: newSettings });
    }

    return NextResponse.json({ settings });

  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      themePreference,
      emailNotifications,
      marketingEmails,
      autoSaveInterval,
      defaultExportFormat,
      aiAssistanceLevel
    } = body;

    // Update user settings
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .update({
        theme_preference: themePreference,
        email_notifications: emailNotifications,
        marketing_emails: marketingEmails,
        auto_save_interval: autoSaveInterval,
        default_export_format: defaultExportFormat,
        ai_assistance_level: aiAssistanceLevel,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (settingsError) {
      console.error('Settings update error:', settingsError);
      return NextResponse.json(
        { error: 'Failed to update settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Settings updated successfully',
      settings
    });

  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}