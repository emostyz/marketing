import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createRouteHandlerClient({ cookies })

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // First, get the file info from database to get storage path
    const { data: fileData, error: fetchError } = await supabase
      .from('data_imports')
      .select('storage_path, user_id')
      .eq('id', id)
      .single()

    if (fetchError || !fileData) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Verify the user owns this file
    if (fileData.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('user-files')
      .remove([fileData.storage_path])

    if (storageError) {
      console.error('Storage deletion error:', storageError)
      // Continue with database deletion even if storage fails
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('data_imports')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id)

    if (dbError) {
      throw new Error(`Database deletion failed: ${dbError.message}`)
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Delete error:', error)
    return NextResponse.json({ 
      success: false,
      error: error.message || 'Deletion failed' 
    }, { status: 500 })
  }
}