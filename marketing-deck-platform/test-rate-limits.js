#!/usr/bin/env node

// Test if this is a rate limit vs quota issue
require('dotenv').config({ path: '.env.local' });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

console.log('🕒 Testing OpenAI rate limits vs quota...');

async function testWithDelay() {
  for (let attempt = 1; attempt <= 3; attempt++) {
    console.log(`\n🧪 Attempt ${attempt}/3`);
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Say hi' }],
          max_tokens: 5
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Success on attempt ${attempt}:`, result.choices[0].message.content);
        console.log('Usage:', result.usage);
        return true;
      } else {
        const error = await response.text();
        console.log(`❌ Attempt ${attempt} failed (${response.status}):`, error);
        
        // Check rate limit headers
        console.log('Rate limit headers:');
        console.log('- x-ratelimit-limit-requests:', response.headers.get('x-ratelimit-limit-requests'));
        console.log('- x-ratelimit-remaining-requests:', response.headers.get('x-ratelimit-remaining-requests'));
        console.log('- x-ratelimit-reset-requests:', response.headers.get('x-ratelimit-reset-requests'));
        console.log('- x-ratelimit-limit-tokens:', response.headers.get('x-ratelimit-limit-tokens'));
        console.log('- x-ratelimit-remaining-tokens:', response.headers.get('x-ratelimit-remaining-tokens'));
        console.log('- x-ratelimit-reset-tokens:', response.headers.get('x-ratelimit-reset-tokens'));
        
        if (response.status === 429) {
          const errorData = JSON.parse(error);
          if (errorData.error.code === 'rate_limit_exceeded') {
            console.log('⏰ This is a rate limit - waiting 60 seconds...');
            await new Promise(resolve => setTimeout(resolve, 60000));
          } else if (errorData.error.code === 'insufficient_quota') {
            console.log('💳 This is a quota/billing issue - not a rate limit');
            return false;
          }
        }
      }
    } catch (error) {
      console.log(`❌ Network error on attempt ${attempt}:`, error.message);
    }
    
    if (attempt < 3) {
      console.log('⏸️  Waiting 30 seconds before next attempt...');
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
  }
  
  return false;
}

// Also test with a different model in case gpt-3.5-turbo quota is exhausted
async function testDifferentModel() {
  console.log('\n🔄 Testing with gpt-4o-mini (cheaper model)...');
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 5
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ gpt-4o-mini works:', result.choices[0].message.content);
      return true;
    } else {
      const error = await response.text();
      console.log('❌ gpt-4o-mini failed:', response.status, error);
      return false;
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
    return false;
  }
}

async function main() {
  const success1 = await testWithDelay();
  if (!success1) {
    const success2 = await testDifferentModel();
    if (!success2) {
      console.log('\n💡 Recommendation: Check OpenAI billing dashboard for quota status');
      console.log('🔗 https://platform.openai.com/usage');
    }
  }
}

main();