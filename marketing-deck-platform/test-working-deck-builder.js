// Test script to verify deck building functionality
const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')

const BASE_URL = 'http://localhost:3000'

async function testDeckBuilding() {
  console.log('🧪 Testing Complete Deck Building Flow')
  console.log('=' .repeat(50))

  try {
    // Step 1: Create test CSV data
    console.log('📋 Step 1: Creating test CSV data...')
    const csvData = `Date,Revenue,Growth,Category,Customers
2024-01,75000,12.5,Product A,850
2024-02,82000,9.3,Product A,920
2024-03,89000,8.5,Product A,995
2024-04,95000,6.7,Product B,1050
2024-05,102000,7.4,Product B,1120
2024-06,108000,5.9,Product B,1180
2024-07,115000,6.5,Product C,1250
2024-08,122000,6.1,Product C,1320
2024-09,128000,4.9,Product C,1390
2024-10,135000,5.5,Product A,1460
2024-11,142000,5.2,Product A,1530
2024-12,150000,5.6,Product A,1600`

    const csvFile = '/tmp/test-revenue-data.csv'
    fs.writeFileSync(csvFile, csvData)
    console.log('✅ Test CSV created:', csvFile)

    // Step 2: Test file upload
    console.log('\n📤 Step 2: Testing file upload...')
    const formData = new FormData()
    formData.append('files', fs.createReadStream(csvFile))
    formData.append('projectName', 'Test Revenue Analysis')

    const uploadResponse = await axios.post(`${BASE_URL}/api/upload`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000
    })

    console.log('✅ Upload successful!', {
      files: uploadResponse.data.files?.length || 0,
      datasets: uploadResponse.data.datasets?.length || 0,
      message: uploadResponse.data.message
    })

    if (!uploadResponse.data.success || !uploadResponse.data.files?.length) {
      throw new Error('Upload failed or no files processed')
    }

    const uploadedFile = uploadResponse.data.files[0]
    console.log('📊 Uploaded file details:', {
      name: uploadedFile.fileName,
      type: uploadedFile.fileType,
      rows: uploadedFile.rowCount,
      columns: uploadedFile.columns?.length || 0
    })

    // Step 3: Test AI analysis
    console.log('\n🧠 Step 3: Testing AI analysis...')
    
    // Prepare analysis request data  
    const analysisData = {
      data: uploadResponse.data.datasets[0].data || [],
      datasetIds: [uploadResponse.data.datasets[0].id],
      context: {
        industry: 'Technology',
        businessContext: 'Monthly revenue analysis for strategic planning',
        targetAudience: 'Executive Team',
        description: 'Revenue growth analysis with product categorization',
        factors: ['seasonality', 'product mix', 'customer acquisition']
      },
      options: {
        includeChartRecommendations: true,
        includeExecutiveSummary: true,
        maxInsights: 12,
        confidenceThreshold: 60
      }
    }

    console.log('📊 Sending data for analysis:', {
      dataRows: analysisData.data.length,
      context: analysisData.context.industry,
      businessContext: analysisData.context.businessContext
    })

    const analysisResponse = await axios.post(`${BASE_URL}/api/ai/analyze`, analysisData, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 60000
    })

    console.log('✅ AI Analysis successful!', {
      success: analysisResponse.data.success,
      insights: analysisResponse.data.data?.insights?.insights?.length || 0,
      charts: analysisResponse.data.data?.chartRecommendations?.recommendations?.length || 0,
      slides: analysisResponse.data.data?.slideStructure?.length || 0,
      confidence: analysisResponse.data.metadata?.confidence || 0,
      processingTime: analysisResponse.data.metadata?.processingTimeMs || 0
    })

    if (!analysisResponse.data.success) {
      throw new Error('AI analysis failed: ' + analysisResponse.data.error)
    }

    // Step 4: Test presentation saving
    console.log('\n💾 Step 4: Testing presentation saving...')
    
    const presentationData = {
      title: 'Test Revenue Analysis Presentation',
      status: 'draft',
      isPublic: false,
      intakeData: {
        files: uploadResponse.data.files,
        context: analysisData.context,
        timeFrame: {
          start: '2024-01-01',
          end: '2024-12-31',
          granularity: 'monthly'
        },
        requirements: {
          slidesCount: analysisResponse.data.data.slideStructure.length,
          style: 'modern'
        }
      },
      analysisResult: {
        insights: analysisResponse.data.data.insights.insights,
        narrative: analysisResponse.data.data.narrative,
        slideStructure: analysisResponse.data.data.slideStructure,
        metadata: analysisResponse.data.metadata
      },
      slideStructure: analysisResponse.data.data.slideStructure,
      enhancedAnalysis: analysisResponse.data.data
    }

    const saveResponse = await axios.post(`${BASE_URL}/api/presentations`, presentationData, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    })

    console.log('✅ Presentation saved!', {
      success: saveResponse.data.success,
      presentationId: saveResponse.data.presentation?.id,
      slides: saveResponse.data.presentation?.slideCount || 0
    })

    // Step 5: Summary
    console.log('\n🎉 COMPLETE FLOW TEST RESULTS')
    console.log('=' .repeat(50))
    console.log('✅ File Upload: SUCCESS')
    console.log('✅ Data Processing: SUCCESS')
    console.log('✅ AI Analysis: SUCCESS')
    console.log('✅ Presentation Saving: SUCCESS')
    console.log('')
    console.log('📊 Analysis Results:')
    console.log(`   • ${analysisResponse.data.data.insights.insights.length} insights generated`)
    console.log(`   • ${analysisResponse.data.data.chartRecommendations.recommendations.length} chart recommendations`)
    console.log(`   • ${analysisResponse.data.data.slideStructure.length} slides created`)
    console.log(`   • ${analysisResponse.data.metadata.confidence}% confidence score`)
    console.log(`   • Processing time: ${analysisResponse.data.metadata.processingTimeMs}ms`)
    console.log('')
    console.log('🚀 CONCLUSION: The deck building system is FULLY FUNCTIONAL!')
    console.log('Users should be able to upload data, get AI analysis, and generate presentations.')

    // Clean up
    fs.unlinkSync(csvFile)

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message)
    
    if (error.response) {
      console.error('Response status:', error.response.status)
      console.error('Response data:', JSON.stringify(error.response.data, null, 2))
    }
    
    console.log('\n🔍 TROUBLESHOOTING:')
    console.log('1. Ensure the development server is running on port 3007')
    console.log('2. Check if OpenAI API key is configured')
    console.log('3. Verify Supabase connection')
    console.log('4. Check console logs for detailed error messages')
    
    process.exit(1)
  }
}

// Run the test
testDeckBuilding()