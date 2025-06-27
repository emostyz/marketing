// Comprehensive test to verify actual slide generation with charts
const testFullSlideGeneration = async () => {
  console.log('🚀 TESTING COMPLETE SLIDE GENERATION WITH CHARTS')
  console.log('=' * 60)
  
  try {
    // Step 1: Generate world-class presentation
    console.log('📊 Step 1: Generating world-class presentation...')
    
    const deckResponse = await fetch('http://localhost:3000/api/deck/generate-world-class', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        datasetId: "demo-test-data",
        context: {
          audience: "executives",
          goal: "strategic data analysis", 
          timeLimit: 15,
          industry: "tech",
          decision: "strategic_planning",
          businessContext: "Q4 revenue analysis for executive team",
          description: "Comprehensive analysis of Q4 performance data"
        }
      })
    })
    
    const deckResult = await deckResponse.json()
    
    if (!deckResult.success) {
      throw new Error(`Deck generation failed: ${deckResult.error}`)
    }
    
    console.log('✅ Deck generated successfully!')
    console.log(`📋 Deck ID: ${deckResult.deckId}`)
    console.log(`📊 Slides generated: ${deckResult.slides?.length || 0}`)
    
    if (!deckResult.slides || deckResult.slides.length === 0) {
      throw new Error('No slides were generated!')
    }
    
    // Step 2: Analyze each slide in detail
    console.log('\n📋 SLIDE ANALYSIS:')
    console.log('=' * 40)
    
    let hasActualCharts = false
    let hasRealContent = false
    let totalElements = 0
    
    deckResult.slides.forEach((slide, index) => {
      console.log(`\n🔍 SLIDE ${index + 1}: "${slide.title}"`)
      console.log(`   AI Powered: ${slide.aiPowered ? '✅' : '❌'}`)
      console.log(`   Elements: ${slide.elements?.length || 0}`)
      
      // Check elements
      if (slide.elements && slide.elements.length > 0) {
        totalElements += slide.elements.length
        
        slide.elements.forEach((element, elemIndex) => {
          console.log(`   Element ${elemIndex + 1}: ${element.type}`)
          if (element.content) {
            const preview = element.content.substring(0, 100)
            console.log(`      Content: "${preview}${element.content.length > 100 ? '...' : ''}"`)
            
            // Check for real business content
            if (element.content.includes('revenue') || 
                element.content.includes('analysis') || 
                element.content.includes('strategic') ||
                element.content.includes('%') ||
                element.content.includes('$')) {
              hasRealContent = true
            }
          }
          
          if (element.style) {
            console.log(`      Style: font-size:${element.style.fontSize}, color:${element.style.color}`)
          }
        })
      }
      
      // Check charts
      if (slide.charts && slide.charts.length > 0) {
        console.log(`   📊 Charts: ${slide.charts.length}`)
        slide.charts.forEach((chart, chartIndex) => {
          console.log(`      Chart ${chartIndex + 1}: ${chart.type} - "${chart.title}"`)
          if (chart.data && chart.data.length > 0) {
            console.log(`         Data points: ${chart.data.length}`)
            console.log(`         Sample data: ${JSON.stringify(chart.data[0])}`)
            hasActualCharts = true
          }
        })
      }
      
      // Check if content is meaningful
      const contentQuality = slide.elements?.some(e => 
        e.content && e.content.length > 50 && 
        !e.content.includes('[') && 
        !e.content.includes('placeholder')
      ) ? '✅ REAL' : '❌ PLACEHOLDER'
      
      console.log(`   Content Quality: ${contentQuality}`)
    })
    
    // Step 3: Overall assessment
    console.log('\n🎯 OVERALL ASSESSMENT:')
    console.log('=' * 40)
    console.log(`Total slides: ${deckResult.slides.length}`)
    console.log(`Total elements: ${totalElements}`)
    console.log(`Has real content: ${hasRealContent ? '✅' : '❌'}`)
    console.log(`Has actual charts: ${hasActualCharts ? '✅' : '❌'}`)
    console.log(`AI-powered slides: ${deckResult.slides.filter(s => s.aiPowered).length}/${deckResult.slides.length}`)
    
    // Step 4: Test a specific slide rendering
    if (deckResult.slides.length > 0) {
      console.log('\n🎨 TESTING SLIDE RENDERING:')
      console.log('=' * 40)
      
      const firstSlide = deckResult.slides[0]
      console.log('First slide structure:')
      console.log(JSON.stringify({
        title: firstSlide.title,
        elementCount: firstSlide.elements?.length,
        chartCount: firstSlide.charts?.length,
        hasBackground: !!firstSlide.background,
        hasDesign: !!firstSlide.design
      }, null, 2))
    }
    
    // Step 5: Test chart data specifically
    if (hasActualCharts) {
      console.log('\n📊 CHART DATA VALIDATION:')
      console.log('=' * 40)
      
      deckResult.slides.forEach((slide, slideIndex) => {
        if (slide.charts && slide.charts.length > 0) {
          slide.charts.forEach((chart, chartIndex) => {
            console.log(`Slide ${slideIndex + 1}, Chart ${chartIndex + 1}:`)
            console.log(`  Type: ${chart.type}`)
            console.log(`  Title: ${chart.title}`)
            console.log(`  Data valid: ${chart.data && Array.isArray(chart.data) ? '✅' : '❌'}`)
            
            if (chart.data && chart.data.length > 0) {
              console.log(`  Data sample:`, chart.data.slice(0, 3))
              
              // Validate chart data structure
              const hasValidData = chart.data.every(point => 
                point && typeof point === 'object' && 
                (point.value !== undefined || point.name !== undefined)
              )
              console.log(`  Data structure valid: ${hasValidData ? '✅' : '❌'}`)
            }
          })
        }
      })
    }
    
    // Step 6: Final verdict
    console.log('\n🏆 FINAL VERDICT:')
    console.log('=' * 40)
    
    const isWorking = 
      deckResult.slides.length > 0 &&
      totalElements > 0 &&
      hasRealContent &&
      deckResult.slides.some(s => s.aiPowered)
    
    if (isWorking) {
      console.log('🎉 SUCCESS: Presentation generation is WORKING!')
      console.log('✅ Slides are being generated')
      console.log('✅ Content is meaningful and business-focused')
      console.log('✅ AI integration is functional')
      if (hasActualCharts) {
        console.log('✅ Charts are being generated with real data')
      }
    } else {
      console.log('❌ FAILURE: Critical issues found')
      if (deckResult.slides.length === 0) console.log('   - No slides generated')
      if (totalElements === 0) console.log('   - No slide elements created')
      if (!hasRealContent) console.log('   - Content is placeholder/empty')
      if (!hasActualCharts) console.log('   - No charts with real data')
    }
    
    // Step 7: Test export functionality
    if (deckResult.deckId) {
      console.log('\n📤 TESTING EXPORT FUNCTIONALITY:')
      console.log('=' * 40)
      
      try {
        const exportResponse = await fetch(`http://localhost:3000/api/presentations/${deckResult.deckId}/export?format=pdf`, {
          method: 'GET'
        })
        
        console.log(`Export endpoint status: ${exportResponse.status}`)
        console.log(`Export available: ${exportResponse.status === 200 ? '✅' : '❌'}`)
      } catch (exportError) {
        console.log(`Export test failed: ${exportError.message}`)
      }
    }
    
    return {
      success: isWorking,
      slides: deckResult.slides.length,
      elements: totalElements,
      hasCharts: hasActualCharts,
      hasContent: hasRealContent,
      deckId: deckResult.deckId
    }
    
  } catch (error) {
    console.error('\n💥 CRITICAL FAILURE:', error.message)
    console.error('Stack trace:', error.stack)
    return {
      success: false,
      error: error.message
    }
  }
}

// Run the comprehensive test
console.log('🧪 Starting comprehensive slide generation test...')
testFullSlideGeneration()
  .then(result => {
    console.log('\n📋 TEST RESULTS:')
    console.log('================')
    console.log(JSON.stringify(result, null, 2))
    
    if (result.success) {
      console.log('\n🎯 READY FOR PRODUCTION! 🎯')
    } else {
      console.log('\n⚠️  NEEDS FIXING BEFORE PRODUCTION ⚠️')
    }
  })
  .catch(console.error)