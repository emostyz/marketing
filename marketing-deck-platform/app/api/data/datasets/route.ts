import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { ClientAuth } from '@/lib/auth/client-auth'
import { type Dataset } from '@/lib/data/data-intake-system'

export async function POST(request: NextRequest) {
  try {
    // Get user authentication
    const user = await ClientAuth.getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse request body
    const dataset: Dataset = await request.json()

    // Validate dataset
    if (!dataset.id || !dataset.filename) {
      return NextResponse.json(
        { success: false, error: 'Invalid dataset data' },
        { status: 400 }
      )
    }

    // Ensure user owns this dataset
    if (dataset.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Save to database
    const { error } = await supabase
      .from('datasets')
      .insert({
        user_id: dataset.userId,
        filename: dataset.filename,
        uploaded_at: dataset.uploadedAt.toISOString(),
        file_type: dataset.fileType,
        size_bytes: dataset.size,
        rows_count: dataset.rows,
        columns_data: dataset.columns,
        schema_data: dataset.schema,
        preview_data: dataset.preview,
        processed: dataset.processed,
        validation_errors: dataset.validationErrors || null,
        metadata: dataset.metadata
      })

    if (error) {
      console.error('Database insert error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to save dataset' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

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

export async function GET(request: NextRequest) {
  try {
    // Get user authentication
    const user = await ClientAuth.getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get datasets for user
    const { data, error } = await supabase
      .from('datasets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database select error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch datasets' },
        { status: 500 }
      )
    }

    // Transform to Dataset format
    const datasets = data.map(row => ({
      id: row.id,
      filename: row.filename,
      uploadedAt: new Date(row.uploaded_at),
      userId: row.user_id,
      fileType: row.file_type,
      size: row.size_bytes,
      rows: row.rows_count,
      columns: row.columns_data,
      schema: row.schema_data,
      preview: row.preview_data,
      processed: row.processed,
      validationErrors: row.validation_errors,
      metadata: row.metadata
    }))

    return NextResponse.json({ success: true, data: datasets })

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