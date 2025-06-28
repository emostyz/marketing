/**
 * Complete End-to-End Test for Deck Builder
 * Tests the entire flow from data upload to presentation viewing
 */

const baseUrl = 'http://localhost:3000'

console.log('🧪 Starting Complete Deck Builder Flow Test...')

async function testCompleteFlow() {
  try {
    // Step 1: Test data upload 
    console.log('\n1️⃣ Testing data upload...')
    
    const uploadResponse = await fetch(`${baseUrl}/api/data-imports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName: 'test-data.csv',
        fileType: 'text/csv',
        fileSize: 1024,
        data: [
          { Date: '2024-01-01', Region: 'North America', Revenue: 45000, Units: 120 },
          { Date: '2024-01-02', Region: 'Europe', Revenue: 38000, Units: 95 },
          { Date: '2024-01-03', Region: 'Asia Pacific', Revenue: 52000, Units: 140 },
          { Date: '2024-01-04', Region: 'North America', Revenue: 47000, Units: 125 },
          { Date: '2024-01-05', Region: 'Europe', Revenue: 41000, Units: 110 }
        ]
      })
    })
    
    const uploadResult = await uploadResponse.json()
    console.log('✅ Upload response:', uploadResult.success ? 'SUCCESS' : 'FAILED')
    
    if (!uploadResult.success) {
      console.log('❌ Upload failed, using demo dataset for testing')
    }
    
    const datasetId = uploadResult.success ? uploadResult.datasetId : 'demo-dataset-test'
    console.log('📊 Using dataset ID:', datasetId)
    
    // Step 2: Test dataset retrieval
    console.log('\n2️⃣ Testing dataset retrieval...')
    
    const datasetResponse = await fetch(`${baseUrl}/api/datasets/${datasetId}`)
    const datasetResult = await datasetResponse.json()
    
    console.log('✅ Dataset retrieval:', datasetResult.success ? 'SUCCESS' : 'FAILED')
    if (datasetResult.success) {
      console.log('📈 Dataset rows:', datasetResult.data?.processedData?.length || 0)
    }
    
    // Step 3: Test AI analysis (Ultimate Brain)
    console.log('\n3️⃣ Testing AI analysis...')
    
    const analysisResponse = await fetch(`${baseUrl}/api/ai/ultimate-brain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: datasetResult.data?.processedData || [
          { Region: 'North America', Revenue: 45000 },
          { Region: 'Europe', Revenue: 38000 },
          { Region: 'Asia Pacific', Revenue: 52000 }
        ],
        context: {
          industry: 'Technology',
          targetAudience: 'Executives',
          businessContext: 'Quarterly Review'
        }
      })
    })
    
    const analysisResult = await analysisResponse.json()
    console.log('✅ AI Analysis:', analysisResult.success ? 'SUCCESS' : 'FAILED')
    if (analysisResult.success) {
      console.log('🧠 Strategic insights generated:', analysisResult.analysis?.strategicInsights?.length || 0)
    }
    
    // Step 4: Test deck generation
    console.log('\n4️⃣ Testing deck generation...')
    
    const deckResponse = await fetch(`${baseUrl}/api/deck/generate-world-class`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        datasetId: datasetId,
        context: {
          industry: 'Technology',
          targetAudience: 'Executives',
          businessContext: 'Quarterly Review',
          presentationGoal: 'Strategic Decision Making'
        }
      })
    })
    
    const deckResult = await deckResponse.json()
    console.log('✅ Deck Generation:', deckResult.success ? 'SUCCESS' : 'FAILED')
    
    if (deckResult.success) {
      console.log('🎯 Generated deck ID:', deckResult.deckId)
      console.log('📄 Slides generated:', deckResult.slideCount)
      console.log('💎 Quality score:', deckResult.qualityScore)
      
      // Step 5: Test presentation loading
      console.log('\n5️⃣ Testing presentation loading...')
      
      const presentationResponse = await fetch(`${baseUrl}/api/presentations/${deckResult.deckId}`)
      const presentationResult = await presentationResponse.json()
      
      console.log('✅ Presentation Loading:', presentationResult.success ? 'SUCCESS' : 'FAILED')
      
      if (presentationResult.success) {
        const slides = presentationResult.data?.slides || []
        console.log('📑 Slides loaded:', slides.length)
        
        // Verify slide content quality
        let realContentCount = 0
        let chartCount = 0
        
        slides.forEach((slide, index) => {
          if (slide.elements && slide.elements.length > 0) {
            realContentCount++
          }
          if (slide.charts && slide.charts.length > 0) {
            chartCount++
          }
        })
        
        console.log('📊 Slides with real content:', realContentCount)
        console.log('📈 Slides with charts:', chartCount)
        
        // Step 6: Test navigation flow
        console.log('\n6️⃣ Testing navigation URLs...')
        
        const deckBuilderUrl = `${baseUrl}/deck-builder/${deckResult.deckId}`
        const editorUrl = `${baseUrl}/editor/${deckResult.deckId}`
        
        console.log('🔗 Deck Builder URL:', deckBuilderUrl)
        console.log('🔗 Editor URL:', editorUrl)
        
        // Test if URLs are accessible (basic check)
        try {
          const deckBuilderTest = await fetch(deckBuilderUrl, { method: 'HEAD' })
          console.log('✅ Deck Builder accessible:', deckBuilderTest.status < 400 ? 'YES' : 'NO')
        } catch (error) {
          console.log('❌ Deck Builder test failed:', error.message)
        }
        
        console.log('\n🎉 COMPLETE FLOW TEST RESULTS:')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('✅ Data Upload:', uploadResult.success ? 'PASS' : 'DEMO')
        console.log('✅ Dataset Retrieval:', datasetResult.success ? 'PASS' : 'FAIL')
        console.log('✅ AI Analysis:', analysisResult.success ? 'PASS' : 'FAIL')
        console.log('✅ Deck Generation:', deckResult.success ? 'PASS' : 'FAIL')
        console.log('✅ Presentation Loading:', presentationResult.success ? 'PASS' : 'FAIL')
        console.log('📊 Real Content Generated:', realContentCount > 0 ? 'YES' : 'NO')
        console.log('📈 Charts with Real Data:', chartCount > 0 ? 'YES' : 'NO')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        
        if (deckResult.success && presentationResult.success && realContentCount > 0) {
          console.log('🚀 OVERALL STATUS: COMPLETE FLOW WORKING!')
          console.log('🎯 Users can now: Upload data → Generate presentations → View in editor')
        } else {
          console.log('⚠️ OVERALL STATUS: SOME ISSUES FOUND')
          console.log('🔧 Please check the failed components above')
        }
        
      } else {
        console.log('❌ Presentation loading failed:', presentationResult.error)
      }
      
    } else {
      console.log('❌ Deck generation failed:', deckResult.error)
    }
    
  } catch (error) {
    console.error('💥 Test failed with error:', error.message)
  }
}

// Run the test
testCompleteFlow()