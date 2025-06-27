#!/usr/bin/env node

// Test gpt-4.1 directly with detailed debugging
require('dotenv').config({ path: '.env.local' });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

console.log('🔍 Testing gpt-4.1 with detailed debugging...');
console.log('API Key:', OPENAI_API_KEY?.substring(0, 20) + '...');

async function testDirectly() {
  // First, let's check if gpt-4.1 is even a valid model
  console.log('\n1️⃣ Checking available models...');
  
  try {
    const modelsResponse = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (modelsResponse.ok) {
      const models = await modelsResponse.json();
      const modelIds = models.data.map(m => m.id);
      console.log('✅ Can access models endpoint');
      console.log('Total models available:', modelIds.length);
      
      // Check if gpt-4.1 exists
      const hasGpt41 = modelIds.includes('gpt-4.1');
      console.log('Has gpt-4.1?', hasGpt41);
      
      // Look for similar models
      const gpt4Models = modelIds.filter(id => id.includes('gpt-4'));
      console.log('GPT-4 models available:', gpt4Models);
      
      // Check for gpt-4-1106-preview (might be what you meant?)
      const hasGpt41106 = modelIds.includes('gpt-4-1106-preview');
      console.log('Has gpt-4-1106-preview?', hasGpt41106);
      
    } else {
      console.log('❌ Cannot access models endpoint');
    }
  } catch (error) {
    console.log('❌ Error checking models:', error.message);
  }

  // Test with gpt-4.1 exactly as requested
  console.log('\n2️⃣ Testing gpt-4.1 completion...');
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10
      })
    });

    console.log('Response status:', response.status);
    const responseText = await response.text();
    
    if (response.ok) {
      console.log('✅ gpt-4.1 works!');
      const data = JSON.parse(responseText);
      console.log('Response:', data.choices[0].message.content);
    } else {
      console.log('❌ gpt-4.1 failed');
      try {
        const errorData = JSON.parse(responseText);
        console.log('Error type:', errorData.error?.type);
        console.log('Error code:', errorData.error?.code);
        console.log('Error message:', errorData.error?.message);
        
        if (errorData.error?.code === 'model_not_found') {
          console.log('\n⚠️  IMPORTANT: gpt-4.1 is not a valid OpenAI model!');
          console.log('Did you mean one of these?');
          console.log('- gpt-4');
          console.log('- gpt-4-1106-preview');
          console.log('- gpt-4-turbo-preview');
          console.log('- gpt-4-0125-preview');
        }
      } catch (e) {
        console.log('Raw error:', responseText);
      }
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }

  // Test with standard gpt-4 to compare
  console.log('\n3️⃣ Testing standard gpt-4 for comparison...');
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10
      })
    });

    if (response.ok) {
      console.log('✅ gpt-4 works!');
      const data = await response.json();
      console.log('Response:', data.choices[0].message.content);
    } else {
      console.log('❌ gpt-4 also failed with status:', response.status);
      const error = await response.text();
      console.log('Error:', error);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

testDirectly();