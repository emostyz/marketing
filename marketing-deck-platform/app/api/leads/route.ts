import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/client'
import { EventLogger } from '@/lib/services/event-logger'

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

    const supabase = await createServerClient()

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
      await EventLogger.logUserEvent(
        'lead_duplicate_attempt',
        {
          email,
          name,
          company,
          source,
          existing_lead_id: existingLead.id
        },
        {
          ip_address: clientIP,
          user_agent: userAgent,
          referer
        }
      )

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
        first_name: name ? name.split(' ')[0] : null,
        last_name: name ? name.split(' ').slice(1).join(' ') : null,
        company_name: company || null,
        lead_source: source,
        lead_status: 'new',
        lead_stage: 'prospect',
        ip_address: clientIP,
        user_agent: userAgent,
        referer_url: referer,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating lead:', error)
      
      // Log error event
      await EventLogger.logSystemEvent(
        'lead_creation_error',
        {
          error: error.message,
          email,
          name,
          company,
          source
        },
        'error',
        {
          ip_address: clientIP,
          user_agent: userAgent
        }
      )

      return NextResponse.json(
        { error: 'Failed to create lead' },
        { status: 500 }
      )
    }

    // Log successful lead creation
    await EventLogger.logUserEvent(
      'lead_created',
      {
        lead_id: lead.id,
        email,
        name,
        company,
        source
      },
      {
        ip_address: clientIP,
        user_agent: userAgent,
        referer
      }
    )

    // Log lead capture event
    await EventLogger.logLeadEvent(
      lead.id,
      'captured',
      {
        source,
        referer,
        user_agent: userAgent.substring(0, 500) // Truncate if too long
      },
      {
        ip_address: clientIP,
        user_agent: userAgent
      }
    )

    return NextResponse.json({
      success: true,
      data: lead
    })
  } catch (error) {
    console.error('Lead API error:', error)
    
    // Log system error
    await EventLogger.logSystemEvent(
      'lead_api_error',
      {
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      'critical',
      {
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      }
    )

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 