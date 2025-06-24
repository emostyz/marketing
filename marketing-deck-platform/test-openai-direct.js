#!/usr/bin/env node

/**
 * Direct OpenAI API Test
 * Tests if the OpenAI API key is working correctly
 */

const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

async function testOpenAIAPI() {
  console.log('🧠 Testing OpenAI API Direct Connection');
  console.log('='.repeat(50));
  
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ No OpenAI API key found in environment variables');
    return;
  }
  
  console.log('✅ OpenAI API key found:', apiKey.substring(0, 20) + '...');
  
  try {
    console.log('🔄 Making test request to OpenAI API...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: 'Analyze this sample data: Revenue Q1: $100K, Q2: $120K. Provide 2 key insights in JSON format with insights array containing objects with title and description fields.'
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ OpenAI API Error (${response.status}):`, errorText);
      return;
    }
    
    const result = await response.json();
    console.log('✅ OpenAI API Response received successfully!');
    console.log('📊 Response content:', result.choices[0].message.content);
    
    // Test with a simpler model
    console.log('\n🔄 Testing with GPT-3.5-turbo...');
    const response2 = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: 'Hello! Can you confirm this API connection is working?'
          }
        ],
        max_tokens: 100
      })
    });
    
    if (!response2.ok) {
      const errorText = await response2.text();
      console.error(`❌ GPT-3.5 API Error (${response2.status}):`, errorText);
      return;
    }
    
    const result2 = await response2.json();
    console.log('✅ GPT-3.5-turbo response:', result2.choices[0].message.content);
    
    console.log('\n🎯 OpenAI API is working correctly!');
    
  } catch (error) {
    console.error('❌ Error testing OpenAI API:', error.message);
    if (error.cause) {
      console.error('❌ Cause:', error.cause);
    }
  }
}

// Run the test
testOpenAIAPI().catch(console.error);