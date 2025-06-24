import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server-client'
import { db } from '@/lib/db/drizzle'
import { dataImports } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const folder = searchParams.get('folder')
    
    // Get authenticated user
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get user's datasets
    let datasets
    if (folder) {
      // Get datasets in specific folder
      datasets = await db
        .select()
        .from(dataImports)
        .where(and(
          eq(dataImports.userId, userId),
          eq(dataImports.folder, folder)
        ))
        .orderBy(desc(dataImports.uploadedAt))
    } else {
      // Get all datasets
      datasets = await db
        .select()
        .from(dataImports)
        .where(eq(dataImports.userId, userId))
        .orderBy(desc(dataImports.uploadedAt))
    }

    // Group datasets by folder
    const datasetsByFolder = datasets.reduce((acc: any, dataset) => {
      const folderName = dataset.folder || 'Uncategorized'
      if (!acc[folderName]) {
        acc[folderName] = []
      }
      acc[folderName].push(dataset)
      return acc
    }, {})

    return NextResponse.json({ 
      datasets,
      datasetsByFolder,
      folders: Object.keys(datasetsByFolder)
    })

  } catch (error) {
    console.error('Error fetching datasets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch datasets' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { fileName, fileType, fileSize, folder, projectName, data } = await request.json()
    
    // Get authenticated user
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Create dataset record
    const [dataset] = await db
      .insert(dataImports)
      .values({
        userId,
        fileName,
        fileType,
        fileSize,
        folder: folder || projectName || 'Uncategorized',
        storagePath: `datasets/${userId}/${Date.now()}_${fileName}`,
        rawData: data,
        status: 'completed'
      })
      .returning()

    return NextResponse.json({ 
      success: true,
      dataset,
      message: 'Dataset saved successfully'
    })

  } catch (error) {
    console.error('Error saving dataset:', error)
    return NextResponse.json(
      { error: 'Failed to save dataset' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { datasetId, folder, fileName } = await request.json()
    
    // Get authenticated user
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Update dataset
    const updateData: any = {}
    if (folder !== undefined) updateData.folder = folder
    if (fileName !== undefined) updateData.fileName = fileName

    const [updatedDataset] = await db
      .update(dataImports)
      .set(updateData)
      .where(and(
        eq(dataImports.id, datasetId),
        eq(dataImports.userId, userId)
      ))
      .returning()

    if (!updatedDataset) {
      return NextResponse.json(
        { error: 'Dataset not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true,
      dataset: updatedDataset,
      message: 'Dataset updated successfully'
    })

  } catch (error) {
    console.error('Error updating dataset:', error)
    return NextResponse.json(
      { error: 'Failed to update dataset' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const datasetId = searchParams.get('datasetId')
    
    if (!datasetId) {
      return NextResponse.json(
        { error: 'Dataset ID required' },
        { status: 400 }
      )
    }
    
    // Get authenticated user
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Delete dataset
    const [deletedDataset] = await db
      .delete(dataImports)
      .where(and(
        eq(dataImports.id, parseInt(datasetId)),
        eq(dataImports.userId, userId)
      ))
      .returning()

    if (!deletedDataset) {
      return NextResponse.json(
        { error: 'Dataset not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Dataset deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting dataset:', error)
    return NextResponse.json(
      { error: 'Failed to delete dataset' },
      { status: 500 }
    )
  }
} 