import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, company, source = 'homepage' } = body

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Get client IP and user agent
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const referer = request.headers.get('referer') || 'unknown'

    // Check if lead already exists
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id')
      .eq('email', email)
      .single()

    if (existingLead) {
      // Log duplicate attempt
      await supabase.from('user_events').insert({
        event_type: 'lead_duplicate_attempt',
        event_data: {
          email,
          name,
          company,
          source,
          existing_lead_id: existingLead.id
        },
        ip_address: clientIP,
        user_agent: userAgent,
        referer,
        session_id: request.headers.get('x-session-id') || null
      })

      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Create new lead
    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        email,
        name: name || null,
        company: company || null,
        source,
        status: 'new',
        ip_address: clientIP,
        user_agent: userAgent,
        referer,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating lead:', error)
      
      // Log error event
      await supabase.from('system_events').insert({
        event_type: 'lead_creation_error',
        event_data: {
          error: error.message,
          email,
          name,
          company,
          source
        },
        ip_address: clientIP,
        user_agent: userAgent,
        severity: 'error'
      })

      return NextResponse.json(
        { error: 'Failed to create lead' },
        { status: 500 }
      )
    }

    // Log successful lead creation
    await supabase.from('user_events').insert({
      event_type: 'lead_created',
      event_data: {
        lead_id: lead.id,
        email,
        name,
        company,
        source
      },
      ip_address: clientIP,
      user_agent: userAgent,
      referer,
      session_id: request.headers.get('x-session-id') || null
    })

    // Log lead capture event
    await supabase.from('lead_events').insert({
      lead_id: lead.id,
      event_type: 'captured',
      event_data: {
        source,
        referer,
        user_agent: userAgent.substring(0, 500) // Truncate if too long
      },
      ip_address: clientIP,
      user_agent: userAgent,
      created_at: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      data: lead
    })
  } catch (error) {
    console.error('Lead API error:', error)
    
    // Log system error
    const supabase = createRouteHandlerClient({ cookies })
    
    await supabase.from('system_events').insert({
      event_type: 'lead_api_error',
      event_data: {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : null
      },
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      severity: 'critical'
    })

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 