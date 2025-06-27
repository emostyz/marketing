import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getAuthenticatedUserWithDemo } from '@/lib/auth/api-auth'
import UserDataService from '@/lib/services/user-data-service'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user with demo support
    const { user } = await getAuthenticatedUserWithDemo()

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
    // Get authenticated user with demo support
    const { user } = await getAuthenticatedUserWithDemo()

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

    // For demo purposes, we'll store basic metadata without file upload
    const fileName = `${Date.now()}-${file.name}`

    // Create data import record
    const dataImport = await UserDataService.createDataImport(user.id, {
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      storage_path: fileName,
      public_url: '', // No actual file storage for demo
      description: description || '',
      processing_status: 'completed', // Mark as completed immediately for demo
      processing_progress: 100
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