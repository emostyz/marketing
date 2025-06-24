import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserWithDemo } from '@/lib/auth/api-auth'

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

    // Get authenticated user with demo fallback
    const { user, isDemo } = await getAuthenticatedUserWithDemo()
    const userId = user.id
    
    console.log('🔍 Upload request from:', isDemo ? 'Demo user' : 'Authenticated user', userId)
    console.log('📁 Files to process:', files.map(f => `${f.name} (${f.size} bytes)`).join(', '))

    // Process each file
    const processedFiles = []
    const savedDatasets = []
    
    for (const file of files) {
      let processedFile: any = {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      }

      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        const text = await file.text()
        const lines = text.split('\n')
        const headers = lines[0]?.split(',').map(h => h.trim()) || []
        const data = lines.slice(1).filter(line => line.trim()).map(line => {
          const values = line.split(',').map(v => v.trim())
          const row: any = {}
          headers.forEach((header, index) => {
            row[header] = values[index] || ''
          })
          return row
        })
        const columns: Array<{ name: string; type: string }> = headers.map(h => ({ name: h, type: 'text' }))
        processedFile = {
          ...processedFile,
          fileType: 'csv',
          headers,
          columns,
          data,
          rowCount: data.length
        }
      } else if (file.type.includes('spreadsheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        // For Excel files, we'll return basic info and suggest CSV conversion
        processedFile = {
          ...processedFile,
          fileType: 'excel',
          message: 'Excel files detected. For best results, please convert to CSV format.'
        }
      } else if (file.type === 'application/json' || file.name.endsWith('.json')) {
        const text = await file.text()
        const data = JSON.parse(text)
        let columns: Array<{ name: string; type: string }> = []
        if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
          columns = Object.keys(data[0]).map(k => ({ name: k, type: typeof data[0][k] }))
        }
        processedFile = {
          ...processedFile,
          fileType: 'json',
          columns,
          data,
          rowCount: Array.isArray(data) ? data.length : 1
        }
      } else {
        processedFile = {
          ...processedFile,
          fileType: 'unsupported',
          message: 'Unsupported file type. Please upload CSV, Excel, or JSON files.'
        }
      }

      processedFiles.push(processedFile)

      // For demo mode or any mode, create a dataset entry for session storage
      if (processedFile.fileType !== 'unsupported') {
        savedDatasets.push({
          id: isDemo ? `demo-${Date.now()}` : `upload-${Date.now()}`,
          fileName: file.name,
          fileType: processedFile.fileType,
          fileSize: file.size,
          folder: projectName,
          status: 'completed',
          demo: isDemo,
          data: processedFile.data || processedFile
        })
        console.log('✅ Processed file:', file.name, 'Type:', processedFile.fileType)
      } else {
        console.log('❌ Unsupported file:', file.name)
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
      totalRowsProcessed: processedFiles.reduce((sum, f) => sum + (f.rowCount || 0), 0)
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
