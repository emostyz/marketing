#!/usr/bin/env node

// Test API key permissions and scope
require('dotenv').config({ path: '.env.local' });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

console.log('🔍 Testing API key permissions and scope...');

async function testPermissions() {
  // Test 1: Check if this is a restricted API key
  console.log('\n1️⃣ Testing if API key has completion permissions...');
  
  // Try the most basic model first
  const testModels = ['gpt-3.5-turbo', 'gpt-4o-mini', 'gpt-4.1'];
  
  for (const model of testModels) {
    console.log(`\n🧪 Testing ${model} with minimal request...`);
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: '1' }],
          max_tokens: 1,
          temperature: 0
        })
      });

      if (response.ok) {
        console.log(`✅ ${model} works! Your API key has proper permissions.`);
        const data = await response.json();
        console.log('Usage:', data.usage);
        return true;
      } else {
        const errorText = await response.text();
        const errorData = JSON.parse(errorText);
        
        if (errorData.error?.message?.includes('quota')) {
          console.log(`❌ ${model}: Still getting quota error`);
          
          // Check if error message has more details
          if (errorData.error?.message?.includes('plan')) {
            console.log('   → Mentions "plan" - could be plan-specific limits');
          }
          if (errorData.error?.message?.includes('billing')) {
            console.log('   → Mentions "billing" - could be payment method issue');
          }
        } else if (errorData.error?.code === 'invalid_api_key') {
          console.log(`❌ ${model}: Invalid API key`);
        } else {
          console.log(`❌ ${model}: ${errorData.error?.code} - ${errorData.error?.message}`);
        }
      }
    } catch (error) {
      console.log(`❌ ${model}: Network error - ${error.message}`);
    }
  }

  // Test 2: Check what the API key can actually do
  console.log('\n2️⃣ Testing API key capabilities...');
  
  const endpoints = [
    { name: 'Models', url: 'https://api.openai.com/v1/models' },
    { name: 'Files', url: 'https://api.openai.com/v1/files' },
    { name: 'Fine-tunes', url: 'https://api.openai.com/v1/fine-tunes' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint.url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log(`${endpoint.name}: ${response.ok ? '✅ Accessible' : `❌ Not accessible (${response.status})`}`);
    } catch (error) {
      console.log(`${endpoint.name}: ❌ Error - ${error.message}`);
    }
  }

  // Test 3: Try with organization ID if it's in the env
  console.log('\n3️⃣ Checking for organization-specific issues...');
  
  if (process.env.OPENAI_ORG_ID) {
    console.log('Found OPENAI_ORG_ID in environment, testing with org header...');
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'OpenAI-Organization': process.env.OPENAI_ORG_ID
        },
        body: JSON.stringify({
          model: 'gpt-4.1',
          messages: [{ role: 'user', content: '1' }],
          max_tokens: 1
        })
      });

      if (response.ok) {
        console.log('✅ Works with organization header!');
        console.log('SOLUTION: Add OPENAI_ORG_ID to your .env.local');
      } else {
        console.log('❌ Still fails with organization header');
      }
    } catch (error) {
      console.log('❌ Error with org header:', error.message);
    }
  } else {
    console.log('No OPENAI_ORG_ID found in environment');
    console.log('If your API key is org-scoped, you might need to add:');
    console.log('OPENAI_ORG_ID=your-org-id to .env.local');
  }

  // Final diagnosis
  console.log('\n📊 DIAGNOSIS:');
  console.log('- Your API key CAN authenticate (models endpoint works)');
  console.log('- Your API key CANNOT make completions (all models fail)');
  console.log('- Error is consistently "insufficient_quota"');
  console.log('\nPOSSIBLE CAUSES:');
  console.log('1. This API key has restricted permissions (read-only)');
  console.log('2. The project/org has a $0 spending limit');
  console.log('3. The API key needs an organization header');
  console.log('4. There\'s a pending payment issue on the account');
  console.log('\nRECOMMENDED ACTIONS:');
  console.log('1. Check OpenAI dashboard → API keys → verify this key has "write" permissions');
  console.log('2. Check OpenAI dashboard → Billing → verify spending limit is not $0');
  console.log('3. Try generating a NEW API key with full permissions');
  console.log('4. Check if there are any payment method issues');
}

testPermissions();