import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server-client'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileName, fileSize, fileType } = body

    if (!fileName) {
      return NextResponse.json(
        { error: 'File name is required' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

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
        pipeline_stage: 'data_intake',
        status: 'pending',
        input_data: {
          fileName,
          fileSize,
          fileType,
          startTime: new Date().toISOString()
        },
        priority: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('Database insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create progress session' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      sessionId,
      status: 'pending',
      stage: 'data_intake',
      message: 'Preparing to process your file...'
    })

  } catch (error) {
    console.error('Data intake start error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}