#!/usr/bin/env node

// Test OpenAI API key directly
require('dotenv').config({ path: '.env.local' });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

console.log('🔍 Testing OpenAI API key from .env.local...');
console.log('Key present:', !!OPENAI_API_KEY);
console.log('Key length:', OPENAI_API_KEY ? OPENAI_API_KEY.length : 0);
console.log('Key prefix:', OPENAI_API_KEY ? OPENAI_API_KEY.substring(0, 10) + '...' : 'N/A');

if (!OPENAI_API_KEY) {
  console.error('❌ No OpenAI API key found in environment variables');
  process.exit(1);
}

// Test API call
async function testOpenAI() {
  try {
    console.log('🧪 Testing OpenAI API call...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: 'Say "Hello, World!" and confirm the API is working'
          }
        ],
        max_tokens: 50
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API Error:', response.status, errorText);
      
      if (response.status === 401) {
        console.error('🔑 Invalid API key or authentication failed');
      } else if (response.status === 429) {
        console.error('⏰ Rate limit exceeded');
      } else if (response.status === 403) {
        console.error('🚫 Forbidden - check API key permissions');
      }
      
      return false;
    }

    const result = await response.json();
    console.log('✅ OpenAI API working!');
    console.log('Response:', result.choices[0].message.content);
    return true;
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
    return false;
  }
}

testOpenAI().then(success => {
  if (success) {
    console.log('🎉 OpenAI API key is working correctly!');
  } else {
    console.log('💥 OpenAI API key is not working properly');
    process.exit(1);
  }
});