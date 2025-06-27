// Detailed slide content investigation
const testDetailedSlideContent = async () => {
  console.log('🔍 Investigating detailed slide content generation...')
  
  try {
    const response = await fetch('http://localhost:3000/api/deck/generate-world-class', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        datasetId: "demo-test-data",
        context: {
          audience: "executives",
          goal: "strategic data analysis", 
          timeLimit: 15,
          industry: "tech",
          decision: "strategic_planning"
        }
      })
    })
    
    const result = await response.json()
    
    if (result.success && result.slides) {
      console.log(`✅ Generated ${result.slides.length} slides`)
      
      // Analyze each slide in detail
      result.slides.forEach((slide, index) => {
        console.log(`\n--- SLIDE ${index + 1}: ${slide.title} ---`)
        console.log('AI Powered:', slide.aiPowered)
        console.log('Elements:', slide.elements?.length || 0)
        
        if (slide.elements) {
          slide.elements.forEach((element, elemIndex) => {
            console.log(`\nElement ${elemIndex + 1}:`)
            console.log('  Type:', element.type)
            console.log('  Content length:', element.content?.length || 0)
            
            if (element.content) {
              // Show first 150 chars of content
              const preview = element.content.substring(0, 150)
              console.log('  Content preview:', preview + (element.content.length > 150 ? '...' : ''))
              
              // Analyze content quality
              const hasPlaceholders = /\[.*\]|placeholder|lorem|ipsum|TODO|FIXME|xxx/i.test(element.content)
              const hasRealData = /revenue|growth|analysis|strategic|performance|market|customer|business/i.test(element.content)
              const hasNumbers = /\d+%|\$\d+|[0-9,]+/i.test(element.content)
              
              console.log('  Quality indicators:')
              console.log('    Has placeholders:', hasPlaceholders ? '❌' : '✅')
              console.log('    Has business terms:', hasRealData ? '✅' : '❌')
              console.log('    Has data/numbers:', hasNumbers ? '✅' : '❌')
              
              // Check if content is substantive
              const wordCount = element.content.split(/\s+/).length
              console.log('    Word count:', wordCount)
              console.log('    Substantive:', wordCount > 5 ? '✅' : '❌')
            }
            
            // Check styling and positioning
            if (element.style) {
              console.log('  Styling:')
              console.log('    Font size:', element.style.fontSize || 'default')
              console.log('    Color:', element.style.color || 'default')
              console.log('    Background:', element.style.backgroundColor || 'default')
            }
            
            if (element.position) {
              console.log('  Position:', `x: ${element.position.x}, y: ${element.position.y}`)
            }
          })
        }
        
        // Check if slide has charts/visualizations
        if (slide.charts) {
          console.log('\nCharts/Visualizations:', slide.charts.length)
          slide.charts.forEach((chart, chartIndex) => {
            console.log(`  Chart ${chartIndex + 1}: ${chart.type} - ${chart.title}`)
          })
        }
        
        // Check AI reasoning
        if (slide.metadata?.aiReasoning) {
          console.log('\nAI Reasoning:', slide.metadata.aiReasoning.substring(0, 100) + '...')
        }
      })
      
      // Overall assessment
      console.log('\n=== OVERALL ASSESSMENT ===')
      
      const totalElements = result.slides.reduce((sum, slide) => sum + (slide.elements?.length || 0), 0)
      const elementsWithContent = result.slides.reduce((sum, slide) => 
        sum + (slide.elements?.filter(e => e.content && e.content.length > 10).length || 0), 0)
      
      console.log('Total elements:', totalElements)
      console.log('Elements with substantial content:', elementsWithContent)
      console.log('Content coverage:', `${Math.round(elementsWithContent / totalElements * 100)}%`)
      
      // Check if OpenAI is really being used
      const aiPoweredSlides = result.slides.filter(s => s.aiPowered).length
      console.log('AI-powered slides:', `${aiPoweredSlides}/${result.slides.length}`)
      
      // Final verdict
      const isWorking = elementsWithContent > totalElements * 0.7 && aiPoweredSlides > 0
      console.log('\n🎯 VERDICT:', isWorking ? '✅ SLIDES ARE PROPERLY GENERATED' : '❌ SLIDES NEED IMPROVEMENT')
      
    } else {
      console.log('❌ Failed to generate slides:', result.error)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testDetailedSlideContent().catch(console.error)