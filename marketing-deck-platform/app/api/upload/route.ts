import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
// @ts-ignore
import pptx2json from 'pptx2json'

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const formData = await request.formData()
  const file = formData.get('file') as File
  
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let pptxStructure = null
  if (file.name.endsWith('.pptx')) {
    // Parse pptx file to extract slide structure
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    try {
      pptxStructure = await pptx2json(buffer)
    } catch (e) {
      return NextResponse.json({ error: 'Failed to parse PPTX: ' + (e as Error).message }, { status: 400 })
    }
  }

  // Process file (in production, you'd upload to storage)
  const fileData = await file.text()
  
  // Save to database
  const { data, error } = await supabase
    .from('data_imports')
    .insert({
      user_id: session.user.id,
      file_name: file.name,
      file_type: file.type,
      raw_data: { content: fileData, pptxStructure },
      status: 'completed'
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data, pptxStructure })
}