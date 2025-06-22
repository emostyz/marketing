// Comprehensive API debug test
async function testAPIDebug() {
  console.log('🧪 Testing API with comprehensive debugging...\n');

  const testPayload = {
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
  };

  try {
    console.log('📤 Sending request to API...');
    console.log('Payload keys:', Object.keys(testPayload));
    
    const response = await fetch('http://localhost:3000/api/openai/enhanced-analyze', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });

    console.log('📥 Response received');
    console.log('Status:', response.status);
    console.log('Status text:', response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));

    const result = await response.json();
    console.log('Response body:', JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('✅ API test PASSED');
      return true;
    } else {
      console.log('❌ API test FAILED');
      return false;
    }

  } catch (error) {
    console.error('❌ API test ERROR:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return false;
  }
}

// Test server connectivity first
async function testServerConnectivity() {
  console.log('🔍 Testing server connectivity...\n');
  
  try {
    const response = await fetch('http://localhost:3000', {
      method: 'GET'
    });
    console.log('Main page status:', response.status);
    return response.ok;
  } catch (error) {
    console.log('Main page check failed:', error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting comprehensive API debugging...\n');
  
  const serverOk = await testServerConnectivity();
  if (!serverOk) {
    console.log('❌ Server not responding, please check if npm run dev is running');
    return;
  }
  
  console.log('✅ Server is responding\n');
  
  const apiOk = await testAPIDebug();
  
  console.log('\n📊 Final Results:');
  console.log('Server connectivity:', serverOk ? '✅ PASSED' : '❌ FAILED');
  console.log('API functionality:', apiOk ? '✅ PASSED' : '❌ FAILED');
  
  if (!apiOk) {
    console.log('\n🔧 Next steps:');
    console.log('1. Check the server logs for detailed error messages');
    console.log('2. Verify the OpenAI API key is loaded correctly');
    console.log('3. Check if the EnhancedBrainV2 class is importing correctly');
  }
}

runTests().catch(console.error); 