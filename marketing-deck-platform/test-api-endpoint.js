#!/usr/bin/env node

/**
 * Test the Enhanced Analysis API Endpoint
 */

const testData = {
  "data": [
    {
      "Date": "2024-01-01",
      "Revenue": 125000,
      "Customer_Acquisition_Cost": 45,
      "Customer_Lifetime_Value": 1200,
      "Marketing_Spend": 25000,
      "Customer_Satisfaction": 4.2,
      "Churn_Rate": 0.05,
      "Sales_Team_Size": 12
    },
    {
      "Date": "2024-02-01", 
      "Revenue": 132000,
      "Customer_Acquisition_Cost": 42,
      "Customer_Lifetime_Value": 1250,
      "Marketing_Spend": 28000,
      "Customer_Satisfaction": 4.3,
      "Churn_Rate": 0.04,
      "Sales_Team_Size": 12
    },
    {
      "Date": "2024-03-01",
      "Revenue": 145000,
      "Customer_Acquisition_Cost": 38,
      "Customer_Lifetime_Value": 1300,
      "Marketing_Spend": 32000,
      "Customer_Satisfaction": 4.4,
      "Churn_Rate": 0.03,
      "Sales_Team_Size": 13
    }
  ],
  "context": {
    "industry": "SaaS Technology",
    "targetAudience": "C-Suite Executives", 
    "businessContext": "Strategic revenue optimization analysis",
    "description": "Deep dive into SaaS metrics to uncover hidden drivers"
  },
  "timeFrame": {
    "start": "2024-01-01",
    "end": "2024-03-01",
    "dataFrequency": "monthly",
    "analysisType": "strategic"
  },
  "requirements": {
    "slidesCount": 6,
    "presentationDuration": 15,
    "style": "strategic"
  }
}

console.log('🧪 Testing Enhanced Analysis API Endpoint')
console.log('========================================')

async function testEndpoint() {
  try {
    console.log('📡 Sending request to enhanced-analyze endpoint...')
    
    const response = await fetch('http://localhost:3001/api/openai/enhanced-analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })

    console.log('📊 Response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.log('❌ Error response:', errorText)
      return
    }

    const result = await response.json()
    console.log('✅ Success! Analysis complete:')
    console.log('  - Insights found:', result.result?.insights?.length || 0)
    console.log('  - Slides generated:', result.result?.slideStructure?.length || 0)
    
    if (result.result?.insights?.length > 0) {
      console.log('\n📋 Sample insights:')
      result.result.insights.slice(0, 3).forEach((insight, i) => {
        console.log(`  ${i + 1}. ${insight.title} (${insight.type})`)
        console.log(`     Confidence: ${insight.confidence}%`)
      })
    }

    if (result.metadata?.deepInsights) {
      console.log('\n🔍 Deep insights metadata:')
      console.log('  - Deep insights count:', result.metadata.deepInsights.deepInsightsCount)
      console.log('  - Hidden drivers count:', result.metadata.deepInsights.hiddenDriversCount)
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Only run if called directly
if (require.main === module) {
  testEndpoint()
}