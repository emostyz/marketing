#!/usr/bin/env node

// Check if this is an API key issue
require('dotenv').config({ path: '.env.local' });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

console.log('🔍 Analyzing API key structure...');
console.log('Key:', OPENAI_API_KEY?.substring(0, 30) + '...');
console.log('Length:', OPENAI_API_KEY?.length);

// Analyze the key structure
if (OPENAI_API_KEY) {
  if (OPENAI_API_KEY.startsWith('sk-proj-')) {
    console.log('✅ This is a project-scoped API key (new format)');
    console.log('💡 Project keys might have different billing/quota rules');
  } else if (OPENAI_API_KEY.startsWith('sk-')) {
    console.log('✅ This is a standard API key (older format)');
  } else {
    console.log('❌ Unrecognized API key format');
  }
  
  // Check if key has correct length (should be around 164 chars for new keys)
  if (OPENAI_API_KEY.length < 50) {
    console.log('⚠️ API key seems too short');
  } else if (OPENAI_API_KEY.length > 200) {
    console.log('⚠️ API key seems too long');
  } else {
    console.log('✅ API key length looks correct');
  }
}

async function testWithCurl() {
  console.log('\n🧪 Testing with curl equivalent to eliminate Node.js issues...');
  
  // Use a direct curl command to test
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);
  
  const curlCommand = `curl -s -X POST "https://api.openai.com/v1/chat/completions" \\
    -H "Authorization: Bearer ${OPENAI_API_KEY}" \\
    -H "Content-Type: application/json" \\
    -d '{
      "model": "gpt-3.5-turbo",
      "messages": [{"role": "user", "content": "Hi"}],
      "max_tokens": 5
    }'`;
  
  try {
    const { stdout, stderr } = await execPromise(curlCommand);
    
    if (stderr) {
      console.log('❌ Curl stderr:', stderr);
    }
    
    console.log('📄 Curl response:');
    console.log(stdout);
    
    try {
      const response = JSON.parse(stdout);
      if (response.error) {
        console.log('❌ Same error with curl - confirms API issue');
        return false;
      } else {
        console.log('✅ Works with curl - might be Node.js fetch issue');
        return true;
      }
    } catch (e) {
      console.log('❌ Could not parse curl response as JSON');
      return false;
    }
  } catch (error) {
    console.log('❌ Curl command failed:', error.message);
    return false;
  }
}

// Test if this is specific to the project vs organization
async function testKeyInfo() {
  console.log('\n🔍 Trying to get key info (this might not work but worth trying)...');
  
  try {
    // Test if we can get any info about the key/organization
    const response = await fetch('https://api.openai.com/v1/models/gpt-3.5-turbo', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const model = await response.json();
      console.log('✅ Can access model details:', model.id);
      console.log('Owner:', model.owned_by);
      console.log('Created:', new Date(model.created * 1000).toISOString());
    } else {
      console.log('❌ Cannot access model details:', response.status);
    }
  } catch (error) {
    console.log('❌ Error getting model info:', error.message);
  }
}

async function main() {
  await testKeyInfo();
  const curlWorks = await testWithCurl();
  
  console.log('\n💡 Analysis:');
  if (OPENAI_API_KEY?.startsWith('sk-proj-')) {
    console.log('🎯 This is likely a project-scoped key issue!');
    console.log('Project keys have separate billing and usage limits');
    console.log('Solutions:');
    console.log('1. Check the specific project\'s billing and limits in OpenAI dashboard');
    console.log('2. Switch to organization-level API key if available');
    console.log('3. Check if project has different quota rules');
    console.log('4. Verify project is properly configured for API usage');
  }
  
  if (!curlWorks) {
    console.log('🔧 The issue is confirmed at the API level, not Node.js');
    console.log('This suggests a real billing/project configuration issue');
  }
}

main();