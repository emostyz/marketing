#!/usr/bin/env node

// Check OpenAI quota and billing status more thoroughly
require('dotenv').config({ path: '.env.local' });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

console.log('🔍 Checking OpenAI quota and billing status...');

if (!OPENAI_API_KEY) {
  console.error('❌ No OpenAI API key found');
  process.exit(1);
}

async function checkQuota() {
  try {
    console.log('📊 Checking billing/usage...');
    
    // Check subscription/billing status
    const billingResponse = await fetch('https://api.openai.com/v1/dashboard/billing/subscription', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (billingResponse.ok) {
      const billing = await billingResponse.json();
      console.log('💳 Billing info:', JSON.stringify(billing, null, 2));
    } else {
      console.log('❌ Billing check failed:', billingResponse.status, await billingResponse.text());
    }

    // Check usage
    const usageResponse = await fetch('https://api.openai.com/v1/dashboard/billing/usage?start_date=2024-12-01&end_date=2024-12-31', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (usageResponse.ok) {
      const usage = await usageResponse.json();
      console.log('📈 Usage info:', JSON.stringify(usage, null, 2));
    } else {
      console.log('❌ Usage check failed:', usageResponse.status, await usageResponse.text());
    }

    // Try a simple models list call
    console.log('\n🤖 Testing models endpoint...');
    const modelsResponse = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (modelsResponse.ok) {
      const models = await modelsResponse.json();
      console.log('✅ Models accessible, count:', models.data.length);
      console.log('Available models:', models.data.slice(0, 5).map(m => m.id).join(', '), '...');
    } else {
      const error = await modelsResponse.text();
      console.log('❌ Models call failed:', modelsResponse.status, error);
    }

    // Try a very minimal completion call
    console.log('\n🧪 Testing minimal completion...');
    const completionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 10
      })
    });

    if (completionResponse.ok) {
      const completion = await completionResponse.json();
      console.log('✅ Completion successful:', completion.choices[0].message.content);
      console.log('💰 Usage:', completion.usage);
    } else {
      const error = await completionResponse.text();
      console.log('❌ Completion failed:', completionResponse.status);
      console.log('Error details:', error);
      
      try {
        const errorJson = JSON.parse(error);
        if (errorJson.error) {
          console.log('Error type:', errorJson.error.type);
          console.log('Error code:', errorJson.error.code);
          console.log('Error message:', errorJson.error.message);
        }
      } catch (e) {
        // Not JSON error
      }
    }

  } catch (error) {
    console.error('❌ Network/connection error:', error.message);
  }
}

checkQuota();