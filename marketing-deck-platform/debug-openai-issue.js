#!/usr/bin/env node

// Debug why OpenAI is giving false quota errors
require('dotenv').config({ path: '.env.local' });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

console.log('🔍 Debugging OpenAI false quota error...');
console.log('Key present:', !!OPENAI_API_KEY);
console.log('Key length:', OPENAI_API_KEY?.length);
console.log('Key starts with:', OPENAI_API_KEY?.substring(0, 20));

async function debugDetailedRequest() {
  try {
    console.log('\n🧪 Making detailed request to debug headers and response...');
    
    const requestBody = {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 10
    };
    
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Node.js OpenAI Client'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('\n📋 Response Details:');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    console.log('\n📊 Response Headers:');
    for (const [key, value] of response.headers.entries()) {
      console.log(`${key}: ${value}`);
    }

    const responseText = await response.text();
    console.log('\n📄 Response Body:');
    console.log(responseText);

    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText);
        console.log('\n🔍 Parsed Error:');
        console.log('Type:', errorData.error?.type);
        console.log('Code:', errorData.error?.code);  
        console.log('Message:', errorData.error?.message);
        console.log('Param:', errorData.error?.param);
        
        // Check if this looks like a real quota issue vs something else
        if (errorData.error?.code === 'insufficient_quota') {
          console.log('\n🤔 This says insufficient_quota, but you checked and have quota...');
          console.log('Possible causes:');
          console.log('1. API key permissions/scopes issue');
          console.log('2. Organization/project billing setup');
          console.log('3. API key from wrong organization');
          console.log('4. OpenAI service issue');
        }
      } catch (e) {
        console.log('❌ Could not parse error as JSON');
      }
    } else {
      console.log('✅ Request succeeded!');
      try {
        const data = JSON.parse(responseText);
        console.log('Response data:', data);
      } catch (e) {
        console.log('Could not parse response as JSON');
      }
    }

  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

async function testDifferentModels() {
  console.log('\n🔄 Testing different models to isolate the issue...');
  
  const models = ['gpt-3.5-turbo', 'gpt-4o-mini', 'gpt-4'];
  
  for (const model of models) {
    console.log(`\n🤖 Testing ${model}...`);
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 5
        })
      });

      if (response.ok) {
        console.log(`✅ ${model} works!`);
        const data = await response.json();
        console.log('Usage:', data.usage);
        return model; // Return first working model
      } else {
        const error = await response.text();
        console.log(`❌ ${model} failed:`, response.status);
        try {
          const errorData = JSON.parse(error);
          console.log(`   Error: ${errorData.error?.code} - ${errorData.error?.message}`);
        } catch (e) {
          console.log(`   Raw error: ${error.substring(0, 100)}...`);
        }
      }
    } catch (error) {
      console.log(`❌ ${model} network error:`, error.message);
    }
  }
  
  return null;
}

async function testOrganizationHeader() {
  console.log('\n🏢 Testing with explicit organization header (if needed)...');
  
  // Sometimes API keys need explicit organization headers
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        // 'OpenAI-Organization': 'your-org-id-here' // Uncomment if you have org ID
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Test' }],
        max_tokens: 5
      })
    });

    if (response.ok) {
      console.log('✅ Works with org header approach');
      return true;
    } else {
      console.log('❌ Still fails with org header approach');
      return false;
    }
  } catch (error) {
    console.log('❌ Network error with org header test:', error.message);
    return false;
  }
}

async function main() {
  await debugDetailedRequest();
  const workingModel = await testDifferentModels();
  
  if (!workingModel) {
    await testOrganizationHeader();
    
    console.log('\n💡 Recommendations:');
    console.log('1. Check if API key is from correct OpenAI organization');
    console.log('2. Verify API key has completion permissions (not just model access)');
    console.log('3. Check if there are any usage limits per model');
    console.log('4. Try generating a new API key');
    console.log('5. Check OpenAI status page for service issues');
  } else {
    console.log(`\n✅ Solution found: ${workingModel} model works!`);
  }
}

main();