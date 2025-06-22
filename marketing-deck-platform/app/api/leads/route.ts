import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server-client'
import { EventLogger } from '@/lib/services/event-logger'

export async function POST(request: NextRequest) {
  try {
    const { email, fullName, companyName, source = 'website' } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()
    
    // Get client info
    const clientInfo = EventLogger.getClientInfo(request)
    
    // Create the lead
    const { data, error } = await supabase
      .from('leads')
      .insert({
        email,
        full_name: fullName,
        company_name: companyName,
        source,
        ip_address: clientInfo.ip_address,
        user_agent: clientInfo.user_agent,
        status: 'new'
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

    // Log the lead creation
    await EventLogger.logLeadEvent(
      data.id,
      'lead_created',
      { email, fullName, companyName, source },
      clientInfo
    )
    
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error creating lead:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 