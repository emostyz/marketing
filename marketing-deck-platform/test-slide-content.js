// Test script to check slide content generation
const testSlideContent = async () => {
  console.log('🧪 Testing slide content generation...')
  
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
    
    if (result.success) {
      console.log('✅ Deck generated successfully!')
      console.log('📊 Slides generated:', result.slides.length)
      
      // Check first slide content quality
      if (result.slides.length > 0) {
        const firstSlide = result.slides[0]
        console.log('\n🔍 First slide analysis:')
        console.log('Title:', firstSlide.title)
        console.log('Elements:', firstSlide.elements?.length || 0)
        
        if (firstSlide.elements && firstSlide.elements.length > 0) {
          const firstElement = firstSlide.elements[0]
          console.log('\n📝 First element content:')
          console.log('Type:', firstElement.type)
          console.log('Content:', firstElement.content?.substring(0, 200) + '...')
          
          // Check if content is actually meaningful or just placeholders
          if (firstElement.content) {
            const isPlaceholder = firstElement.content.includes('[') || 
                                 firstElement.content.includes('placeholder') ||
                                 firstElement.content.includes('TODO') ||
                                 firstElement.content.includes('Lorem')
            
            console.log('Content Quality:', isPlaceholder ? '❌ PLACEHOLDER' : '✅ REAL CONTENT')
          }
        }
        
        // Check for AI features
        console.log('\n🤖 AI Features:')
        console.log('AI Powered:', firstSlide.aiPowered || false)
        console.log('Editor Features:', Object.keys(firstSlide.editorFeatures || {}))
        console.log('Design Elements:', Object.keys(firstSlide.design || {}))
      }
    } else {
      console.log('❌ Deck generation failed:', result.error)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testSlideContent().catch(console.error)