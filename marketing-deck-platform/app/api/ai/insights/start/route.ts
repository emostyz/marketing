import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { analysisType = 'insights_generation' } = body

    const supabase = createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Create new session ID
    const sessionId = uuidv4()

    // Insert into processing queue
    const { error: insertError } = await supabase
      .from('ai_processing_queue')
      .insert({
        id: sessionId,
        user_id: user.id,
        pipeline_stage: 'first_pass_analysis',
        status: 'pending',
        input_data: {
          analysisType,
          startTime: new Date().toISOString()
        },
        priority: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('Database insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create insights session' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      sessionId,
      status: 'pending',
      stage: 'first_pass_analysis',
      message: 'Preparing to analyze your data for insights...'
    })

  } catch (error) {
    console.error('Insights start error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}