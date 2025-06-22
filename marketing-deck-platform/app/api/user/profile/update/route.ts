import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

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

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate input
    const validationErrors = validateProfileInput(body);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

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
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Only include fields that are actually being updated
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (companyName !== undefined) updateData.company_name = companyName;
    if (jobTitle !== undefined) updateData.job_title = jobTitle;
    if (phone !== undefined) updateData.phone = phone;
    if (industry !== undefined) updateData.industry = industry;
    if (targetAudience !== undefined) updateData.target_audience = targetAudience;
    if (businessContext !== undefined) updateData.business_context = businessContext;
    if (masterSystemPrompt !== undefined) updateData.master_system_prompt = masterSystemPrompt;
    if (profilePictureUrl !== undefined) updateData.profile_picture_url = profilePictureUrl;
    if (logoUrl !== undefined) updateData.logo_url = logoUrl;
    if (keyMetrics !== undefined) updateData.key_metrics = keyMetrics;
    if (brandColors !== undefined) updateData.brand_colors = brandColors;

    // Update user profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (profileError) {
      console.error('Profile update error:', profileError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile: profileData
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}