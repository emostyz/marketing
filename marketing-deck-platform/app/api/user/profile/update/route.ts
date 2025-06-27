import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import { EventLogger } from '@/lib/services/event-logger';
import { ProfileService } from '@/lib/services/profile-service';

// Input validation helper
function validateProfileInput(data: any) {
  const errors: string[] = [];
  
  // Validate string lengths
  if (data.name && data.name.length > 100) errors.push('Name must be less than 100 characters');
  if (data.bio && data.bio.length > 1000) errors.push('Bio must be less than 1000 characters');
  if (data.companyName && data.companyName.length > 100) errors.push('Company name must be less than 100 characters');
  if (data.jobTitle && data.jobTitle.length > 100) errors.push('Job title must be less than 100 characters');
  if (data.phone && data.phone.length > 20) errors.push('Phone must be less than 20 characters');
  if (data.masterSystemPrompt && data.masterSystemPrompt.length > 2000) errors.push('System prompt must be less than 2000 characters');
  
  // Validate URLs
  if (data.profilePictureUrl && data.profilePictureUrl.length > 0) {
    try {
      new URL(data.profilePictureUrl);
    } catch {
      errors.push('Profile picture URL is invalid');
    }
  }
  
  if (data.logoUrl && data.logoUrl.length > 0) {
    try {
      new URL(data.logoUrl);
    } catch {
      errors.push('Logo URL is invalid');
    }
  }
  
  // Validate email format in phone field (common mistake)
  if (data.phone && data.phone.includes('@')) {
    errors.push('Phone field should not contain an email address');
  }
  
  // Validate arrays
  if (data.keyMetrics && !Array.isArray(data.keyMetrics)) {
    errors.push('Key metrics must be an array');
  }
  
  if (data.keyMetrics && data.keyMetrics.length > 20) {
    errors.push('Maximum 20 key metrics allowed');
  }
  
  return errors;
}

export async function POST(request: NextRequest) {
  return handleProfileUpdate(request);
}

export async function PUT(request: NextRequest) {
  return handleProfileUpdate(request);
}

async function handleProfileUpdate(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Get client info for logging
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      // Log unauthorized access attempt
      await EventLogger.logUserEvent(
        'profile_update_unauthorized',
        {
          error: userError?.message || 'No user found'
        },
        {
          ip_address: clientIP,
          user_agent: userAgent
        }
      );

      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      // Log JSON parsing error
      await EventLogger.logUserEvent(
        'profile_update_json_error',
        {
          error: 'Invalid JSON in request body'
        },
        {
          ip_address: clientIP,
          user_agent: userAgent,
          user_id: user.id
        }
      );

      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate input
    const validationErrors = validateProfileInput(body);
    if (validationErrors.length > 0) {
      // Log validation failure
      await EventLogger.logUserEvent(
        'profile_update_validation_failed',
        {
          errors: validationErrors,
          attempted_data: body
        },
        {
          ip_address: clientIP,
          user_agent: userAgent,
          user_id: user.id
        }
      );

      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    // Get current profile for comparison
    const profileService = new ProfileService()
    const currentProfile = await profileService.retrieveProfile(user.id)

    const {
      name,
      bio,
      companyName,
      jobTitle,
      phone,
      industry,
      targetAudience,
      businessContext,
      masterSystemPrompt,
      profilePictureUrl,
      keyMetrics,
      brandColors,
      logoUrl
    } = body;

    // Prepare update object with only defined values
    const updateData: any = {};

    // Track what fields are being changed
    const changedFields: string[] = [];

    // Only include fields that are actually being updated
    if (name !== undefined) {
      updateData.full_name = name;
      if (currentProfile?.full_name !== name) changedFields.push('full_name');
    }
    if (bio !== undefined) {
      updateData.bio = bio;
      if (currentProfile?.bio !== bio) changedFields.push('bio');
    }
    if (companyName !== undefined) {
      updateData.company_name = companyName;
      if (currentProfile?.company_name !== companyName) changedFields.push('company_name');
    }
    if (jobTitle !== undefined) {
      updateData.job_title = jobTitle;
      if (currentProfile?.job_title !== jobTitle) changedFields.push('job_title');
    }
    if (phone !== undefined) {
      updateData.phone = phone;
      if (currentProfile?.phone !== phone) changedFields.push('phone');
    }
    if (industry !== undefined) {
      updateData.industry = industry;
      if (currentProfile?.industry !== industry) changedFields.push('industry');
    }
    if (targetAudience !== undefined) {
      updateData.target_audience = targetAudience;
      if (currentProfile?.target_audience !== targetAudience) changedFields.push('target_audience');
    }
    if (businessContext !== undefined) {
      updateData.business_context = businessContext;
      if (currentProfile?.business_context !== businessContext) changedFields.push('business_context');
    }
    if (masterSystemPrompt !== undefined) {
      updateData.master_system_prompt = masterSystemPrompt;
      if (currentProfile?.master_system_prompt !== masterSystemPrompt) changedFields.push('master_system_prompt');
    }
    if (profilePictureUrl !== undefined) {
      updateData.profile_picture_url = profilePictureUrl;
      if (currentProfile?.profile_picture_url !== profilePictureUrl) changedFields.push('profile_picture_url');
    }
    if (keyMetrics !== undefined) {
      updateData.key_metrics = keyMetrics;
      if (JSON.stringify(currentProfile?.key_metrics) !== JSON.stringify(keyMetrics)) changedFields.push('key_metrics');
    }
    if (brandColors !== undefined) {
      updateData.brand_colors = brandColors;
      if (JSON.stringify(currentProfile?.brand_colors) !== JSON.stringify(brandColors)) changedFields.push('brand_colors');
    }
    if (logoUrl !== undefined) {
      updateData.logo_url = logoUrl;
      if (currentProfile?.logo_url !== logoUrl) changedFields.push('logo_url');
    }

    // If no changes, return early
    if (changedFields.length === 0) {
      return NextResponse.json(
        { message: 'No changes detected', profile: currentProfile },
        { status: 200 }
      );
    }

    // Update profile using the profile service
    const updatedProfile = await profileService.updateProfile(user.id, updateData);

    if (!updatedProfile) {
      // Log update failure
      await EventLogger.logUserEvent(
        'profile_update_failed',
        {
          error: 'Failed to update profile in database',
          attempted_updates: updateData
        },
        {
          ip_address: clientIP,
          user_agent: userAgent,
          user_id: user.id
        }
      );

      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    // Log successful update
    await EventLogger.logUserEvent(
      'profile_updated',
      {
        changed_fields: changedFields,
        update_summary: Object.keys(updateData)
      },
      {
        ip_address: clientIP,
        user_agent: userAgent,
        user_id: user.id
      }
    );

    return NextResponse.json(
      { 
        message: 'Profile updated successfully',
        profile: updatedProfile,
        changedFields
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Profile update error:', error);
    
    // Log system error
    await EventLogger.logSystemEvent(
      'profile_update_system_error',
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }
    );

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}