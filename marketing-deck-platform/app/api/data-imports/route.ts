import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import UserDataService from '@/lib/services/user-data-service'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status')

    // Track API usage
    await UserDataService.trackApiUsage(user.id, '/api/data-imports', 'GET')

    // Get user data imports
    let dataImports = await UserDataService.getUserDataImports(user.id, limit)

    // Apply filters
    if (status) {
      dataImports = dataImports.filter(di => di.processing_status === status)
    }

    // Track activity
    await UserDataService.trackUserActivity(user.id, {
      activity_type: 'data_imports_viewed',
      metadata: { 
        count: dataImports.length,
        filters: { status }
      }
    })

    return NextResponse.json({
      success: true,
      data: dataImports,
      count: dataImports.length
    })
  } catch (error) {
    console.error('Data imports API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const description = formData.get('description') as string

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      )
    }

    // Track API usage
    await UserDataService.trackApiUsage(user.id, '/api/data-imports', 'POST')

    // Upload file to Supabase Storage
    const fileName = `${user.id}/${Date.now()}-${file.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('data-imports')
      .upload(fileName, file)

    if (uploadError) {
      throw uploadError
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('data-imports')
      .getPublicUrl(fileName)

    // Create data import record
    const dataImport = await UserDataService.createDataImport(user.id, {
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      storage_path: fileName,
      public_url: publicUrl,
      description: description || '',
      processing_status: 'pending',
      processing_progress: 0
    })

    // Update user stats
    await UserDataService.updateUserStats(user.id)

    return NextResponse.json({
      success: true,
      data: dataImport
    })
  } catch (error) {
    console.error('Data imports API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 