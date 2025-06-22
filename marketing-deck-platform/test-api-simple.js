// Simple test for the enhanced analyze API
async function testAPI() {
  console.log('🧪 Testing Enhanced Analyze API...\n')

  try {
    const response = await fetch('http://localhost:3000/api/openai/enhanced-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [
          { month: 'Jan', sales: 100, profit: 20 },
          { month: 'Feb', sales: 120, profit: 25 },
          { month: 'Mar', sales: 140, profit: 30 }
        ],
        context: {
          businessGoals: 'Increase sales and profitability',
          targetAudience: 'executive',
          keyQuestions: ['What are the growth trends?'],
          industry: 'Technology',
          dataDescription: 'Monthly sales and profit data',
          influencingFactors: ['Market conditions']
        },
        timeFrame: {
          primaryPeriod: { start: '2024-01-01', end: '2024-03-31', label: 'Q1 2024' },
          analysisType: 'm/m'
        },
        requirements: {
          slideCount: 3,
          targetDuration: 5,
          structure: 'ai_suggested',
          keyPoints: ['Growth trends'],
          audienceType: 'executive',
          presentationStyle: 'formal'
        },
        userFeedback: []
      })
    })

    console.log('Response status:', response.status)
    const result = await response.json()
    console.log('Response body:', JSON.stringify(result, null, 2))

    if (result.success) {
      console.log('✅ API test PASSED')
      return true
    } else {
      console.log('❌ API test FAILED:', result.error)
      return false
    }

  } catch (error) {
    console.log('❌ API test ERROR:', error.message)
    return false
  }
}

testAPI() 