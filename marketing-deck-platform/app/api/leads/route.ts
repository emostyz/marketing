import { NextRequest, NextResponse } from 'next/server'

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

    // For now, just log the lead and return success
    // This allows the form to work without database setup
    console.log('📧 New lead captured:', {
      email,
      name,
      company,
      source,
      timestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      userAgent: request.headers.get('user-agent')
    })

    // TODO: Uncomment this when database is set up
    /*
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check if lead already exists
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id')
      .eq('email', email)
      .single()

    if (existingLead) {
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
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        user_agent: request.headers.get('user-agent'),
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating lead:', error)
      return NextResponse.json(
        { error: 'Failed to create lead' },
        { status: 500 }
      )
    }
    */

    return NextResponse.json({
      success: true,
      data: {
        id: `temp_${Date.now()}`,
        email,
        name,
        company,
        source,
        created_at: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Lead API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 