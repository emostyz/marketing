import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/api-auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('📥 Loading dataset:', id)

    // Handle demo datasets
    if (id.startsWith('demo-')) {
      console.log('🎭 Loading demo dataset...', id)
      
      // Return demo data that matches what's expected
      const demoData = [
        { Date: '2024-01-01', Region: 'North America', Revenue: 45230.50, Units_Sold: 180, Product_Category: 'Software' },
        { Date: '2024-01-02', Region: 'Europe', Revenue: 38750.25, Units_Sold: 95, Product_Category: 'Hardware' },
        { Date: '2024-01-03', Region: 'Asia Pacific', Revenue: 52100.75, Units_Sold: 210, Product_Category: 'Services' },
        { Date: '2024-01-04', Region: 'Latin America', Revenue: 29840.00, Units_Sold: 85, Product_Category: 'Support' },
        { Date: '2024-01-05', Region: 'Middle East', Revenue: 41850.30, Units_Sold: 125, Product_Category: 'Training' },
        { Date: '2024-01-06', Region: 'North America', Revenue: 48900.80, Units_Sold: 195, Product_Category: 'Software' },
        { Date: '2024-01-07', Region: 'Europe', Revenue: 33250.60, Units_Sold: 78, Product_Category: 'Hardware' },
        { Date: '2024-01-08', Region: 'Asia Pacific', Revenue: 59200.40, Units_Sold: 240, Product_Category: 'Services' },
        { Date: '2024-01-09', Region: 'Latin America', Revenue: 26780.90, Units_Sold: 92, Product_Category: 'Support' },
        { Date: '2024-01-10', Region: 'Middle East', Revenue: 44320.15, Units_Sold: 142, Product_Category: 'Training' }
      ]
      
      return NextResponse.json({
        success: true,
        data: {
          id: id,
          filename: 'Demo Dataset',
          processedData: demoData
        }
      })
    }

    // For real datasets, require auth
    const user = await requireAuth()

    // Try to load from datasets table first (new Supabase format)
    let dataset = null
    const { data: supabaseDataset, error: supabaseError } = await supabase
      .from('datasets')
      .select('*')
      .eq('id', id)
      .eq('userId', user.id)
      .single()

    if (!supabaseError && supabaseDataset) {
      dataset = {
        id: supabaseDataset.id,
        filename: supabaseDataset.filename,
        processedData: supabaseDataset.processedData || []
      }
      console.log('✅ Dataset found in datasets table:', dataset.filename, '- Rows:', dataset.processedData.length)
    } else {
      console.log('📋 Trying data_imports table (legacy format)...')
      
      // Try data_imports table (legacy drizzle format)
      try {
        const { db } = await import('@/lib/db/drizzle')
        const { dataImports } = await import('@/lib/db/schema')
        const { eq } = await import('drizzle-orm')
        
        const [dataImport] = await db
          .select()
          .from(dataImports)
          .where(eq(dataImports.id, parseInt(id)))
          .limit(1)

        if (dataImport) {
          dataset = {
            id: dataImport.id.toString(),
            filename: dataImport.fileName,
            processedData: dataImport.rawData || []
          }
          console.log('✅ Dataset found in data_imports table:', dataset.filename, '- Rows:', dataset.processedData.length)
        }
      } catch (error) {
        console.error('Error accessing data_imports table:', error)
      }
    }

    if (!dataset) {
      console.error('❌ Dataset not found in either table:', id)
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: dataset
    })

  } catch (error) {
    console.error('Error loading dataset:', error)
    return NextResponse.json(
      { error: 'Failed to load dataset' },
      { status: 500 }
    )
  }
}