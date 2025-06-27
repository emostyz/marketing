#!/usr/bin/env node

// Test the AI analysis directly
console.log('🧪 Testing AI analysis endpoint directly...');

async function testAIAnalysis() {
  try {
    const testData = [
      { revenue: 1000, month: 'Jan', customers: 50 },
      { revenue: 1200, month: 'Feb', customers: 60 },
      { revenue: 1100, month: 'Mar', customers: 55 }
    ];
    
    const context = {
      companyName: 'Test Company',
      industry: 'Technology'
    };
    
    console.log('📊 Sending request to AI analysis endpoint...');
    
    const response = await fetch('http://localhost:3001/api/ai/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: testData,
        context: context
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ AI Analysis Success!');
      console.log('Success:', result.success);
      console.log('Insights count:', result.data?.insights?.insights?.length || 0);
      console.log('Slides count:', result.data?.slideStructure?.length || 0);
      console.log('Processing time:', result.metadata?.processingTimeMs || 'unknown');
      console.log('Fallback mode:', result.metadata?.fallbackMode || false);
    } else {
      const errorText = await response.text();
      console.log('❌ AI Analysis Failed');
      console.log('Error response:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

testAIAnalysis();