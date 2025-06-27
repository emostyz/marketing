#!/usr/bin/env node

// Test specific models for the marketing-deck-platform project
require('dotenv').config({ path: '.env.local' });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

console.log('🧪 Testing specific models for marketing-deck-platform project...');

async function testModel(modelName, maxTokens = 10) {
  try {
    console.log(`\n🤖 Testing ${modelName}...`);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: maxTokens
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ ${modelName} works!`);
      console.log(`Response: "${result.choices[0].message.content}"`);
      console.log(`Usage: ${JSON.stringify(result.usage)}`);
      return true;
    } else {
      const error = await response.text();
      console.log(`❌ ${modelName} failed (${response.status})`);
      
      try {
        const errorData = JSON.parse(error);
        if (errorData.error?.code === 'model_not_found') {
          console.log(`   Model not available for this project`);
        } else if (errorData.error?.code === 'insufficient_quota') {
          console.log(`   Quota issue specific to this model`);
        } else {
          console.log(`   Error: ${errorData.error?.code} - ${errorData.error?.message}`);
        }
      } catch (e) {
        console.log(`   Raw error: ${error.substring(0, 100)}...`);
      }
      return false;
    }
  } catch (error) {
    console.log(`❌ Network error testing ${modelName}:`, error.message);
    return false;
  }
}

async function testAllModels() {
  const modelsToTest = [
    'gpt-4.1'
  ];
  
  const workingModels = [];
  
  for (const model of modelsToTest) {
    const works = await testModel(model);
    if (works) {
      workingModels.push(model);
    }
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 Results Summary:');
  console.log(`✅ Working models: ${workingModels.length > 0 ? workingModels.join(', ') : 'None'}`);
  console.log(`❌ Failed models: ${modelsToTest.length - workingModels.length}`);
  
  if (workingModels.length > 0) {
    console.log('\n💡 Recommended fix:');
    console.log(`Update the OpenAI integration to use: "${workingModels[0]}"`);
    console.log(`This model works with your current project setup!`);
    return workingModels[0];
  } else {
    console.log('\n❌ No models working - this suggests a broader project/billing issue');
    return null;
  }
}

testAllModels();