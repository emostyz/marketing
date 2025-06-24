import { NextRequest, NextResponse } from 'next/server'
import { AdminAuth } from '@/lib/auth/admin-auth'
import { createServerSupabaseClient } from '@/lib/supabase/server-client'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { isAdmin, admin } = await AdminAuth.requireAdmin(request)
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { 
      email, 
      full_name, 
      company_name, 
      user_role, 
      subscription_tier, 
      message 
    } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Generate invitation token
    const invitationToken = randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

    // Store invitation in database
    const { data: invitation, error: inviteError } = await supabase
      .from('user_invitations')
      .insert({
        email: email.toLowerCase(),
        full_name: full_name || null,
        company_name: company_name || null,
        user_role: user_role || 'user',
        subscription_tier: subscription_tier || 'free',
        invitation_token: invitationToken,
        expires_at: expiresAt.toISOString(),
        invited_by: admin?.id || 'direct-admin',
        personal_message: message || null,
        status: 'pending'
      })
      .select()
      .single()

    if (inviteError) {
      console.error('Error creating invitation:', inviteError)
      return NextResponse.json(
        { error: 'Failed to create invitation' },
        { status: 500 }
      )
    }

    // In a real implementation, you would send an email here
    // For now, we'll just simulate the email sending
    const invitationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/signup?invitation=${invitationToken}`
    
    // Mock email content
    const emailContent = {
      to: email,
      subject: `You're invited to join ${process.env.NEXT_PUBLIC_APP_NAME || 'AEDRIN'}`,
      body: `
        Hello ${full_name || 'there'},
        
        You've been invited to join ${process.env.NEXT_PUBLIC_APP_NAME || 'AEDRIN'} by an administrator.
        
        ${message ? `Personal message: ${message}` : ''}
        
        Click the link below to create your account:
        ${invitationUrl}
        
        Your account will be set up with:
        - Role: ${user_role}
        - Subscription: ${subscription_tier}
        ${company_name ? `- Company: ${company_name}` : ''}
        
        This invitation expires in 7 days.
        
        Best regards,
        The ${process.env.NEXT_PUBLIC_APP_NAME || 'AEDRIN'} Team
      `
    }

    // Log the invitation for development (remove in production)
    console.log('🔗 User Invitation Created:')
    console.log('📧 Email:', email)
    console.log('🔑 Token:', invitationToken)
    console.log('🌐 URL:', invitationUrl)
    console.log('📝 Email Content:', emailContent)

    // TODO: Integrate with actual email service (SendGrid, AWS SES, etc.)
    // await sendInvitationEmail(emailContent)

    // Log admin action
    if (admin) {
      await AdminAuth.logAdminActivity(
        admin.id,
        'user_invitation_sent',
        { 
          email,
          user_role,
          subscription_tier,
          invitation_id: invitation.id
        },
        'invitation',
        invitation.id,
        request
      )
    }

    return NextResponse.json({
      success: true,
      message: `Invitation sent successfully to ${email}`,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        expires_at: invitation.expires_at,
        invitation_url: invitationUrl // Only for development
      }
    })
  } catch (error) {
    console.error('Admin user invitation error:', error)
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    )
  }
}

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

    // Get all pending invitations
    const { data: invitations, error } = await supabase
      .from('user_invitations')
      .select(`
        id,
        email,
        full_name,
        company_name,
        user_role,
        subscription_tier,
        status,
        created_at,
        expires_at,
        invited_by
      `)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch invitations' },
        { status: 500 }
      )
    }

    // Log admin action
    if (admin) {
      await AdminAuth.logAdminActivity(
        admin.id,
        'invitations_viewed',
        { total_invitations: invitations?.length || 0 },
        'invitations',
        undefined,
        request
      )
    }

    return NextResponse.json({ invitations: invitations || [] })
  } catch (error) {
    console.error('Admin invitations fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    )
  }
}