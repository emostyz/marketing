// Test the enhanced insight generation
const testData = [
  { Date: '2024-01-01', Region: 'North America', Revenue: 45000, Units_Sold: 120, Product_Category: 'Electronics' },
  { Date: '2024-01-02', Region: 'Europe', Revenue: 38000, Units_Sold: 95, Product_Category: 'Electronics' },
  { Date: '2024-01-03', Region: 'Asia Pacific', Revenue: 52000, Units_Sold: 140, Product_Category: 'Software' },
  { Date: '2024-01-04', Region: 'North America', Revenue: 47000, Units_Sold: 125, Product_Category: 'Software' },
  { Date: '2024-01-05', Region: 'Europe', Revenue: 41000, Units_Sold: 110, Product_Category: 'Hardware' }
]

const context = {
  companyName: 'Test Company',
  industry: 'Technology',
  goal: 'Revenue optimization',
  audience: 'executives'
}

async function testInsights() {
  try {
    const response = await fetch('http://localhost:3001/api/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: testData,
        context: context
      })
    })

    const result = await response.json()
    console.log('Test Insights Result:', JSON.stringify(result, null, 2))
    
    if (result.data && result.data.insights) {
      console.log('\n=== GENERATED INSIGHTS ===')
      result.data.insights.insights.forEach((insight, i) => {
        console.log(`\n${i + 1}. ${insight.title}`)
        console.log(`   Description: ${insight.description}`)
        console.log(`   Business Impact: ${insight.businessImplication}`)
        console.log(`   Confidence: ${insight.confidence}%`)
      })
    }
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testInsights()