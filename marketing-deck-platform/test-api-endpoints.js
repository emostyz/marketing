#!/usr/bin/env node

async function testEndpoints() {
  console.log('🚀 Testing API Endpoints...\n');
  
  const baseUrl = 'http://localhost:3003';
  
  const tests = [
    {
      name: 'Health Check',
      endpoint: '/',
      method: 'GET'
    },
    {
      name: 'Auth Login Page',
      endpoint: '/auth/login',
      method: 'GET'
    },
    {
      name: 'Templates Page (without auth)',
      endpoint: '/templates',
      method: 'GET'
    },
    {
      name: 'Dashboard (without auth)',
      endpoint: '/dashboard',
      method: 'GET'
    }
  ];
  
  for (const test of tests) {
    try {
      console.log(`Testing ${test.name}...`);
      const response = await fetch(`${baseUrl}${test.endpoint}`, {
        method: test.method,
        headers: {
          'User-Agent': 'Test-Script'
        }
      });
      
      if (response.ok || response.status === 302) {
        console.log(`✅ ${test.name}: ${response.status} ${response.statusText}`);
      } else {
        console.log(`❌ ${test.name}: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
    }
  }
  
  console.log('\n🎯 Manual Testing Instructions:');
  console.log('1. Go to http://localhost:3003/auth/login');
  console.log('2. Click "Try Demo Access" to login');
  console.log('3. Navigate to "Browse Templates" from dashboard');
  console.log('4. Create a new deck and fill out the data intake form');
  console.log('5. Verify that form data saves and you can navigate to next steps');
  console.log('\n✨ If all steps work, the application is fully functional!');
}

testEndpoints().catch(console.error);