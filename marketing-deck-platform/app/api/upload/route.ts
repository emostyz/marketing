import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { processDataFile } from '@/lib/data/enhanced-file-processor'
import { storeDataset } from '@/lib/data/dataset-storage'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files: File[] = []
    const projectName = formData.get('projectName') as string || 'Uncategorized'
    
    // Extract files from form data
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        files.push(value)
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    // Get auth from cookies/headers
    const authHeader = request.headers.get('Authorization')
    const cookieHeader = request.headers.get('Cookie') || ''
    
    let authToken = null
    if (authHeader && authHeader.startsWith('Bearer ')) {
      authToken = authHeader.slice(7)
    } else {
      const cookiePatterns = [
        /sb-waddrfstpqkvdfwbxvfw-auth-token=([^;]+)/,
        /sb-qezexjgyvzwanfrgqaio-auth-token=([^;]+)/
      ]
      
      for (const pattern of cookiePatterns) {
        const match = cookieHeader.match(pattern)
        if (match) {
          authToken = match[1]
          break
        }
      }
    }
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      }
    )
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const isDemo = false
    const userId = user.id
    
    console.log('🔍 Upload request from:', isDemo ? 'Demo user' : 'Authenticated user', userId)
    console.log('📁 Files to process:', files.map(f => `${f.name} (${f.size} bytes)`).join(', '))

    // Process each file using enhanced processor
    const processedFiles = []
    const savedDatasets = []
    
    for (const file of files) {
      try {
        // Use the enhanced file processor
        const processedData = await processDataFile(file)
        
        // Store in database (for real users) or create session entry (for demo)
        let datasetId: string
        
        if (!isDemo) {
          // Store in Supabase for authenticated users
          datasetId = await storeDataset(userId, processedData, projectName)
        } else {
          // For demo users, create a temporary ID
          datasetId = `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }

        // Create response object
        const processedFile = {
          id: datasetId,
          fileName: file.name,
          fileType: processedData.fileType,
          fileSize: file.size,
          columns: processedData.columns.map(col => ({
            name: col.name,
            type: col.type
          })),
          rowCount: processedData.rowCount,
          processingTime: processedData.metadata.processingTime,
          sampleData: processedData.data.slice(0, 5), // First 5 rows for preview
          statistics: {
            totalColumns: processedData.columns.length,
            totalRows: processedData.rowCount,
            dataTypes: processedData.columns.reduce((acc: any, col) => {
              acc[col.type] = (acc[col.type] || 0) + 1
              return acc
            }, {})
          }
        }

        processedFiles.push(processedFile)

        // Create dataset entry for session/presentation context
        savedDatasets.push({
          id: datasetId,
          fileName: file.name,
          fileType: processedData.fileType,
          fileSize: file.size,
          folder: projectName,
          status: 'completed',
          demo: isDemo,
          data: processedData.data,
          columns: processedData.columns
        })

        console.log('✅ Processed and stored file:', {
          fileName: file.name,
          fileType: processedData.fileType,
          datasetId,
          rowCount: processedData.rowCount,
          columns: processedData.columns.length,
          processingTime: `${processedData.metadata.processingTime}ms`
        })

      } catch (error) {
        console.error('❌ Error processing file:', file.name, error)
        
        // Add error info to response
        processedFiles.push({
          fileName: file.name,
          fileType: 'error',
          fileSize: file.size,
          error: error instanceof Error ? error.message : 'Unknown processing error'
        })
      }
    }

    // Also save to session for presentation context
    try {
      await fetch(`${request.nextUrl.origin}/api/presentations/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'data-upload',
          data: { files: processedFiles },
          projectName,
          timestamp: new Date().toISOString()
        })
      })
    } catch (error) {
      console.error('Error saving to session:', error)
    }

    console.log('🎉 Upload completed successfully')
    console.log('📊 Summary:', {
      processedFiles: processedFiles.length,
      savedDatasets: savedDatasets.length,
      fileTypesProcessed: [...new Set(processedFiles.map(f => f.fileType))],
      totalRowsProcessed: processedFiles.reduce((sum, f) => sum + (f.rowCount || 0), 0),
      totalColumns: processedFiles.reduce((sum, f) => sum + (f.columns?.length || 0), 0),
      errors: processedFiles.filter(f => f.fileType === 'error').length
    })

    return NextResponse.json({
      success: true,
      files: processedFiles,
      datasets: savedDatasets,
      totalFiles: files.length,
      message: 'Files processed and saved successfully'
    })

  } catch (error) {
    console.error('❌ Upload error:', error)

    return NextResponse.json(
      { 
        error: 'Failed to process files',
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
