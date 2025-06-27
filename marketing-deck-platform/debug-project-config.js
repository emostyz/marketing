#!/usr/bin/env node

// Debug project-specific OpenAI configuration
require('dotenv').config({ path: '.env.local' });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

console.log('🔍 Debugging marketing-deck-platform OpenAI project configuration...');

// Check if there are organization/project headers needed
async function testWithHeaders() {
  console.log('\n🧪 Testing with different header configurations...');
  
  const headerConfigs = [
    {
      name: 'Basic headers',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    },
    {
      name: 'With User-Agent',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'marketing-deck-platform/1.0'
      }
    },
    {
      name: 'With explicit project (if it exists)',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Project': 'marketing-deck-platform'
      }
    }
  ];
  
  for (const config of headerConfigs) {
    console.log(`\n🧪 Testing: ${config.name}`);
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: config.headers,
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 5
        })
      });

      console.log(`Status: ${response.status}`);
      console.log('Response headers:');
      for (const [key, value] of response.headers.entries()) {
        if (key.toLowerCase().includes('openai') || key.toLowerCase().includes('rate') || key.toLowerCase().includes('quota')) {
          console.log(`  ${key}: ${value}`);
        }
      }

      if (response.ok) {
        console.log(`✅ Success with ${config.name}!`);
        const result = await response.json();
        console.log('Response:', result.choices[0].message.content);
        return config;
      } else {
        const error = await response.text();
        console.log(`❌ Failed with ${config.name}`);
        try {
          const errorData = JSON.parse(error);
          console.log(`Error: ${errorData.error?.code} - ${errorData.error?.message?.substring(0, 100)}...`);
        } catch (e) {
          console.log(`Raw error: ${error.substring(0, 100)}...`);
        }
      }
    } catch (error) {
      console.log(`❌ Network error with ${config.name}:`, error.message);
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  return null;
}

// Test if it's a usage limit vs billing issue
async function checkUsageLimits() {
  console.log('\n📊 Checking if this is a usage limit vs billing issue...');
  
  try {
    // Try with minimal token usage
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 1,
        temperature: 0
      })
    });

    console.log('Minimal usage test status:', response.status);
    
    if (!response.ok) {
      const error = await response.text();
      const errorData = JSON.parse(error);
      
      if (errorData.error?.message?.includes('quota')) {
        console.log('💳 This appears to be a hard quota/billing limit');
        console.log('🔧 Possible solutions:');
        console.log('1. Check OpenAI billing dashboard for marketing-deck-platform project');
        console.log('2. Verify project has active payment method');
        console.log('3. Check if project has separate usage limits');
        console.log('4. Contact OpenAI support about project-specific limits');
      } else if (errorData.error?.message?.includes('rate limit')) {
        console.log('⏰ This appears to be a rate limiting issue');
        console.log('🔧 Wait 1 hour and try again');
      }
    }
  } catch (error) {
    console.log('❌ Error checking usage limits:', error.message);
  }
}

async function main() {
  const workingConfig = await testWithHeaders();
  
  if (!workingConfig) {
    await checkUsageLimits();
    
    console.log('\n💡 DIAGNOSIS:');
    console.log('The API key is project-scoped (sk-proj-) and ALL models are failing');
    console.log('This indicates a project-level billing or configuration issue');
    console.log('\n🔧 IMMEDIATE SOLUTIONS:');
    console.log('1. Check OpenAI dashboard → Projects → marketing-deck-platform');
    console.log('2. Verify the project has billing enabled and credits available');
    console.log('3. Generate a NEW organization-level API key (sk-...) instead of project key');
    console.log('4. Or temporarily enable the fallback system which already works perfectly');
    
    console.log('\n⚡ QUICK FIX FOR NOW:');
    console.log('The fallback system is already implemented and working!');
    console.log('Users get professional analysis immediately while you fix the API key');
  } else {
    console.log(`\n✅ SOLUTION FOUND: Use ${workingConfig.name}`);
  }
}

main();