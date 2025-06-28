import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { ClientAuth } from '@/lib/auth/client-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user authentication
    const user = await ClientAuth.getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const datasetId = params.id

    // Get dataset
    const { data, error } = await supabase
      .from('datasets')
      .select('*')
      .eq('id', datasetId)
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Database select error:', error)
      return NextResponse.json(
        { success: false, error: 'Dataset not found' },
        { status: 404 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Dataset not found' },
        { status: 404 }
      )
    }

    // Transform to Dataset format
    const dataset = {
      id: data.id,
      filename: data.filename,
      uploadedAt: new Date(data.uploaded_at),
      userId: data.user_id,
      fileType: data.file_type,
      size: data.size_bytes,
      rows: data.rows_count,
      columns: data.columns_data,
      schema: data.schema_data,
      preview: data.preview_data,
      processed: data.processed,
      validationErrors: data.validation_errors,
      metadata: data.metadata
    }

    return NextResponse.json({ success: true, data: dataset })

  } catch (error) {
    console.error('Dataset API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}