import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { FileParser } from '@/lib/data/file-parser'
import { AuthSystem } from '@/lib/auth/auth-system'
// @ts-ignore
import pptx2json from 'pptx2json'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File
  
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  try {
    // Check authentication - try Supabase first, fallback to mock auth
    let userId: string
    let useSupabase = false
    
    try {
      const supabase = createRouteHandlerClient({ cookies })
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user?.id) {
        userId = session.user.id
        useSupabase = true
      } else {
        throw new Error('No Supabase session')
      }
    } catch (supabaseError) {
      // Fallback to mock auth system
      const user = await AuthSystem.getCurrentUser()
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      userId = user.id.toString()
    }

    // Parse the file data using our advanced parser
    let parsedDataset = null
    let fileContent = null
    let pptxStructure = null

    // Determine file type and parse accordingly
    const fileType = file.type || file.name.split('.').pop()?.toLowerCase()
    
    if (fileType?.includes('csv') || file.name.endsWith('.csv') ||
        fileType?.includes('excel') || fileType?.includes('spreadsheet') || 
        file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      
      // Parse structured data files
      try {
        parsedDataset = await FileParser.parseFile(file)
        console.log('📊 File parsed successfully:', {
          fileName: parsedDataset.fileName,
          rowCount: parsedDataset.rowCount,
          columns: parsedDataset.columns.length,
          dataQuality: parsedDataset.insights.dataQuality,
          timeSeriesDetected: parsedDataset.insights.timeSeriesDetected
        })
      } catch (parseError) {
        console.error('❌ File parsing failed:', parseError)
        return NextResponse.json({ 
          error: `Failed to parse file: ${parseError instanceof Error ? parseError.message : 'Unknown error'}` 
        }, { status: 400 })
      }
    } else if (file.type.includes('text') || file.name.endsWith('.json')) {
      // Handle text files
      fileContent = await file.text()
    } else if (file.name.endsWith('.pptx')) {
      // Handle PowerPoint files
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      try {
        pptxStructure = await pptx2json(buffer)
      } catch (e) {
        console.error('Failed to parse PPTX:', e)
      }
    }

    let publicUrl = ''
    let storagePath = ''

    // Try to upload to Supabase storage if available
    if (useSupabase) {
      try {
        const supabase = createRouteHandlerClient({ cookies })
        const fileExt = file.name.split('.').pop()
        const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

        const arrayBuffer = await file.arrayBuffer()
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('user-files')
          .upload(fileName, arrayBuffer, {
            contentType: file.type,
            upsert: false
          })

        if (!uploadError) {
          const { data: { publicUrl: url } } = supabase.storage
            .from('user-files')
            .getPublicUrl(fileName)
          
          publicUrl = url
          storagePath = fileName
        }
      } catch (storageError) {
        console.warn('Supabase storage failed, continuing without cloud storage:', storageError)
      }
    }

    // Prepare response data
    const uploadResult = {
      id: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: publicUrl || `local://${file.name}`,
      storagePath,
      parsedData: parsedDataset,
      fileContent,
      pptxStructure,
      uploadedAt: new Date().toISOString(),
      status: 'completed'
    }

    // Try to save to database if Supabase is available
    if (useSupabase && parsedDataset) {
      try {
        const supabase = createRouteHandlerClient({ cookies })
        await supabase
          .from('data_imports')
          .insert({
            user_id: userId,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            storage_path: storagePath,
            public_url: publicUrl,
            raw_data: parsedDataset ? { 
              dataset: parsedDataset,
              insights: parsedDataset.insights 
            } : (fileContent ? { content: fileContent } : null),
            pptx_structure: pptxStructure,
            status: 'completed'
          })
      } catch (dbError) {
        console.warn('Database save failed, continuing without persistence:', dbError)
      }
    }

    // Store in session storage as backup
    try {
      const sessionData = {
        step: 'file_upload',
        data: {
          uploadedFiles: [uploadResult],
          latestUpload: uploadResult
        },
        timestamp: new Date().toISOString()
      }

      // Save to presentation session
      await fetch(`${request.nextUrl.origin}/api/presentations/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      })
    } catch (sessionError) {
      console.warn('Session save failed:', sessionError)
    }

    return NextResponse.json({ 
      success: true,
      data: uploadResult,
      file: {
        id: uploadResult.id,
        name: file.name,
        size: file.size,
        type: file.type,
        url: uploadResult.url,
        storagePath
      },
      parsedData: parsedDataset,
      insights: parsedDataset?.insights,
      pptxStructure
    })

  } catch (error: any) {
    console.error('❌ Upload error:', error)
    return NextResponse.json({ 
      success: false,
      error: error.message || 'Upload failed' 
    }, { status: 500 })
  }
}