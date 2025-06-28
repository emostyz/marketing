import { NextRequest, NextResponse } from 'next/server'
import { generateEnhancedSlideContent, analyzeDataForTremorCharts } from '@/lib/ai/enhancedSlideGenerator'
import { PresentationManager, DataFlowManager } from '@/lib/presentations/presentation-helpers'
import { getDatasetForPresentation, getDatasetsForPresentation, extractDatasetIdsFromSession } from '@/lib/data/dataset-retrieval'
import { requireAuth } from '@/lib/auth/api-auth'

export async function POST(request: NextRequest) {
  try {
    console.log('📊 Starting presentation generation...')
    
    const requestData = await request.json()
    const { 
      step = 'generate', 
      title = 'AI-Generated Presentation',
      data = [],
      datasetIds = [],
      sessionData = null,
      qaResponses = null,
      generateWithAI = false,
      userId = null
    } = requestData

    console.log(`📊 Generation request: ${title}, DataPoints: ${data.length}, DatasetIDs: ${datasetIds.length}, AI: ${generateWithAI}`)

    // Get authenticated user info
    const user = await requireAuth()
    const isDemo = user.demo === true
    const actualUserId = userId || user.id

    let actualData: any[] = []
    let datasetInfo: any = null

    // Priority 1: Use real datasets from database
    if (datasetIds.length > 0 && !isDemo) {
      try {
        console.log('🔍 Fetching real datasets from database:', datasetIds)
        const datasetsResult = await getDatasetsForPresentation(datasetIds)
        actualData = datasetsResult.combinedData
        datasetInfo = {
          datasets: datasetsResult.datasets,
          totalRows: datasetsResult.totalRows,
          datasetCount: datasetsResult.datasetCount,
          source: 'database'
        }
        console.log(`✅ Retrieved ${actualData.length} rows from ${datasetsResult.datasetCount} datasets`)
      } catch (error) {
        console.warn('⚠️ Failed to fetch datasets from database, falling back:', error)
      }
    }

    // Priority 2: Extract dataset IDs from session data  
    if (actualData.length === 0 && sessionData) {
      const extractedIds = extractDatasetIdsFromSession(sessionData)
      if (extractedIds.length > 0 && !isDemo) {
        try {
          console.log('🔍 Using dataset IDs from session:', extractedIds)
          const datasetsResult = await getDatasetsForPresentation(extractedIds)
          actualData = datasetsResult.combinedData
          datasetInfo = {
            datasets: datasetsResult.datasets,
            totalRows: datasetsResult.totalRows,
            datasetCount: datasetsResult.datasetCount,
            source: 'session'
          }
          console.log(`✅ Retrieved ${actualData.length} rows from session datasets`)
        } catch (error) {
          console.warn('⚠️ Failed to fetch session datasets, falling back:', error)
        }
      }
    }

    // Priority 3: Use provided data array
    if (actualData.length === 0 && data.length > 0) {
      actualData = data
      datasetInfo = {
        totalRows: data.length,
        source: 'provided'
      }
      console.log(`📊 Using provided data: ${data.length} rows`)
    }

    // Priority 4: Use demo/session data for demo users
    if (actualData.length === 0 && sessionData?.files) {
      const sessionFiles = sessionData.files
      actualData = sessionFiles.reduce((acc: any[], file: any) => {
        if (file.data && Array.isArray(file.data)) {
          return acc.concat(file.data)
        }
        return acc
      }, [])
      datasetInfo = {
        totalRows: actualData.length,
        source: 'session_files'
      }
      console.log(`📊 Using session file data: ${actualData.length} rows`)
    }

    // Priority 5: Generate sample data only as last resort
    if (actualData.length === 0) {
      console.log('⚠️ No real data available, generating sample data as fallback')
      actualData = generateSampleData(qaResponses?.dataType || 'business')
      datasetInfo = {
        totalRows: actualData.length,
        source: 'sample',
        warning: 'No real data was available for analysis'
      }
    }

    console.log(`🔢 Final data summary:`, {
      rows: actualData.length,
      source: datasetInfo?.source,
      hasRealData: datasetInfo?.source !== 'sample'
    })

    // Process the upload data
    const processedData = DataFlowManager.processUploadData({
      title,
      data: actualData,
      qaResponses,
      metadata: {
        generateWithAI,
        processedAt: new Date().toISOString(),
        datasetInfo
      }
    })

    // Generate AI-powered slides using the uploaded data and Q&A context
    const aiSlides = await generateEnhancedSlideContent(actualData, title, qaResponses)
    console.log(`Generated ${aiSlides.length} AI slides`)
    
    // Analyze data for optimal chart recommendations with Tremor integration
    const analysis = analyzeDataForTremorCharts(actualData, qaResponses)
    console.log(`Analysis complete: ${analysis.chartType} chart recommended`)

    // Enhanced slides with proper IDs and configurations
    const slides = aiSlides.map((slide: any, index: number) => {
      const slideId = slide.id || `slide_${Date.now()}_${index}`
      
      if (slide.type === 'chart') {
        return {
          ...slide,
          id: slideId,
          chartType: slide.chartType || analysis.chartType,
          data: actualData,
          chartData: actualData,
          categories: slide.categories || Object.keys(actualData[0] || {}).slice(1),
          index: slide.index || Object.keys(actualData[0] || {})[0],
          tremorConfig: slide.tremorConfig || analysis.tremorConfig
        }
      }
      return {
        ...slide,
        id: slideId
      }
    })

    // Create presentation using enhanced manager
    const presentation = await DataFlowManager.generatePresentationFromAnalysis(
      { insights: analysis.insights, confidence: 85 },
      processedData,
      slides
    )
    
    // Save presentation if user is provided
    if (userId) {
      await PresentationManager.savePresentation(presentation, userId)
      console.log('✅ Presentation saved to database')
    }

    console.log('🎉 Presentation generation completed successfully')

    return NextResponse.json({ 
      success: true,
      presentation,
      slides, 
      analysis,
      message: generateWithAI ? 'AI-powered presentation with Q&A analysis generated successfully' : 'AI-powered presentation generated successfully',
      dataPoints: actualData.length,
      chartRecommendation: analysis.chartType,
      insights: analysis.insights,
      qaAnalysis: qaResponses ? true : false,
      tremorEnabled: true,
      presentationId: presentation.id,
      datasetInfo,
      usingRealData: datasetInfo?.source !== 'sample'
    })
  } catch (error) {
    console.error('Generate API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate presentation', 
        details: String(error),
        fallback: true
      }, 
      { status: 500 }
    )
  }
}

// Helper function to generate intelligent sample data
function generateSampleData(dataType: string = 'business') {
  const sampleData: Record<string, any[]> = {
    financial: [
      { Month: 'Jan', Revenue: 145000, Expenses: 85000, Profit: 60000, Margin: 41.4 },
      { Month: 'Feb', Revenue: 152000, Expenses: 89000, Profit: 63000, Margin: 41.4 },
      { Month: 'Mar', Revenue: 148000, Expenses: 87000, Profit: 61000, Margin: 41.2 },
      { Month: 'Apr', Revenue: 161000, Expenses: 92000, Profit: 69000, Margin: 42.9 },
      { Month: 'May', Revenue: 158000, Expenses: 91000, Profit: 67000, Margin: 42.4 },
      { Month: 'Jun', Revenue: 167000, Expenses: 94000, Profit: 73000, Margin: 43.7 }
    ],
    sales: [
      { Month: 'Jan', Leads: 1200, Conversions: 180, Revenue: 145000, AvgDeal: 806 },
      { Month: 'Feb', Leads: 1350, Conversions: 202, Revenue: 152000, AvgDeal: 752 },
      { Month: 'Mar', Leads: 1180, Conversions: 189, Revenue: 148000, AvgDeal: 783 },
      { Month: 'Apr', Leads: 1500, Conversions: 225, Revenue: 161000, AvgDeal: 716 },
      { Month: 'May', Leads: 1420, Conversions: 213, Revenue: 158000, AvgDeal: 742 },
      { Month: 'Jun', Leads: 1650, Conversions: 248, Revenue: 167000, AvgDeal: 673 }
    ],
    marketing: [
      { Campaign: 'Google Ads', Spend: 25000, Impressions: 450000, Clicks: 12500, Conversions: 180, CPA: 139 },
      { Campaign: 'Facebook', Spend: 18000, Impressions: 320000, Clicks: 9800, Conversions: 145, CPA: 124 },
      { Campaign: 'LinkedIn', Spend: 15000, Impressions: 180000, Clicks: 5400, Conversions: 98, CPA: 153 },
      { Campaign: 'Email', Spend: 5000, Impressions: 85000, Clicks: 3200, Conversions: 156, CPA: 32 }
    ],
    business: [
      { Month: 'Jan', Revenue: 45000, Leads: 1200, Conversion: 12 },
      { Month: 'Feb', Revenue: 52000, Leads: 1350, Conversion: 15 },
      { Month: 'Mar', Revenue: 48000, Leads: 1180, Conversion: 14 },
      { Month: 'Apr', Revenue: 61000, Leads: 1500, Conversion: 18 },
      { Month: 'May', Revenue: 58000, Leads: 1420, Conversion: 16 },
      { Month: 'Jun', Revenue: 67000, Leads: 1650, Conversion: 20 }
    ]
  }
  
  return sampleData[dataType] || sampleData.business
}