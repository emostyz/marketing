#!/usr/bin/env node

// Debug OpenAI API issues
const { exec } = require('child_process');

console.log('🔍 Debugging OpenAI API issue...\n');

// Test 1: Check if OpenAI API key is set
console.log('1. Checking OpenAI API key configuration...');
exec('grep OPENAI_API_KEY .env.local', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ No .env.local file or OPENAI_API_KEY not found');
    console.log('💡 Solution: Create .env.local file with OPENAI_API_KEY=your_key_here');
  } else {
    const keyLine = stdout.trim();
    if (keyLine.includes('OPENAI_API_KEY=sk-')) {
      console.log('✅ OpenAI API key found in .env.local');
    } else {
      console.log('⚠️ OPENAI_API_KEY found but may be invalid:', keyLine.substring(0, 30) + '...');
    }
  }
  
  // Test 2: Make a direct API call to OpenAI
  console.log('\n2. Testing direct OpenAI API call...');
  
  const testData = {
    data: [{ Revenue: 125430.50, Units_Sold: 234, Date: '2024-01-01' }],
    context: { 
      industry: 'technology', 
      companyName: 'Test Company',
      analysisType: 'insights_generation'
    },
    userFeedback: {},
    learningObjectives: ['Generate test insights']
  };
  
  const curlCommand = `curl -s -X POST "http://localhost:3000/api/ai/ultimate-brain" \
    -H "Content-Type: application/json" \
    -d '${JSON.stringify(testData).replace(/'/g, "'\\''")}' \
    --max-time 30`;
  
  exec(curlCommand, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ API call failed:', error.message);
      return;
    }
    
    try {
      const result = JSON.parse(stdout);
      if (result.success) {
        console.log('✅ OpenAI API working correctly!');
        console.log(`📊 Generated ${result.analysis.strategicInsights.length} insights`);
      } else {
        console.log('❌ API returned error:', result.error);
        if (result.openaiError) {
          console.log('🔧 This is specifically an OpenAI error');
          console.log('💡 Common solutions:');
          console.log('   - Check OpenAI API key is valid');
          console.log('   - Verify API key has sufficient credits');
          console.log('   - Check for rate limiting');
          console.log('   - Ensure API key has GPT-4 access');
        }
      }
    } catch (e) {
      console.log('❌ Failed to parse API response:', stdout.substring(0, 200));
    }
  });
});