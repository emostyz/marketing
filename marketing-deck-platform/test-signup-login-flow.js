#!/usr/bin/env node

/**
 * Test script to verify the signup-to-login flow
 * Run with: node test-signup-login-flow.js
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'

async function makeRequest(url, options = {}) {
  const fetch = (await import('node-fetch')).default
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })
    
    const data = await response.json()
    return { response, data }
  } catch (error) {
    console.error(`Request failed for ${url}:`, error.message)
    return { error: error.message }
  }
}

async function testSignupFlow() {
  console.log('🧪 Testing Signup Flow...')
  
  const testUser = {
    name: 'Test User ' + Date.now(),
    email: `test${Date.now()}@example.com`,
    password: 'testpass123',
    company: 'Test Company'
  }
  
  console.log('📝 Testing user registration...')
  const { response: signupResponse, data: signupData, error: signupError } = await makeRequest(
    `${BASE_URL}/api/auth/register`,
    {
      method: 'POST',
      body: JSON.stringify(testUser)
    }
  )
  
  if (signupError) {
    console.error('❌ Signup request failed:', signupError)
    return false
  }
  
  if (signupResponse.ok && signupData.success) {
    console.log('✅ Signup successful:', signupData.user)
  } else {
    console.error('❌ Signup failed:', signupData.error || 'Unknown error')
    return false
  }
  
  return testUser
}

async function testLoginFlow(user) {
  console.log('🔐 Testing Login Flow...')
  
  console.log('📝 Testing user login...')
  const { response: loginResponse, data: loginData, error: loginError } = await makeRequest(
    `${BASE_URL}/api/auth/login`,
    {
      method: 'POST',
      body: JSON.stringify({
        email: user.email,
        password: user.password
      })
    }
  )
  
  if (loginError) {
    console.error('❌ Login request failed:', loginError)
    return false
  }
  
  if (loginResponse.ok && loginData.success) {
    console.log('✅ Login successful:', loginData.user)
    return true
  } else {
    console.error('❌ Login failed:', loginData.error || 'Unknown error')
    return false
  }
}

async function testDemoFlow() {
  console.log('🚀 Testing Demo Flow...')
  
  console.log('📝 Testing demo login...')
  const { response: demoResponse, data: demoData, error: demoError } = await makeRequest(
    `${BASE_URL}/api/auth/login`,
    {
      method: 'POST',
      body: JSON.stringify({ demo: true })
    }
  )
  
  if (demoError) {
    console.error('❌ Demo request failed:', demoError)
    return false
  }
  
  if (demoResponse.ok && demoData.success) {
    console.log('✅ Demo login successful:', demoData.user)
    return true
  } else {
    console.error('❌ Demo login failed:', demoData.error || 'Unknown error')
    return false
  }
}

async function testLeadCapture() {
  console.log('📋 Testing Lead Capture...')
  
  const testLead = {
    name: 'Test Lead ' + Date.now(),
    email: `lead${Date.now()}@example.com`,
    company: 'Lead Company',
    source: 'test'
  }
  
  console.log('📝 Testing lead submission...')
  const { response: leadResponse, data: leadData, error: leadError } = await makeRequest(
    `${BASE_URL}/api/leads`,
    {
      method: 'POST',
      body: JSON.stringify(testLead)
    }
  )
  
  if (leadError) {
    console.error('❌ Lead capture request failed:', leadError)
    return false
  }
  
  if (leadResponse.ok && leadData.success) {
    console.log('✅ Lead capture successful:', leadData.data)
    return true
  } else {
    console.error('❌ Lead capture failed:', leadData.error || 'Unknown error')
    return false
  }
}

async function runTests() {
  console.log('🎯 Starting Authentication Flow Tests\n')
  console.log(`Testing against: ${BASE_URL}\n`)
  
  let results = {
    signup: false,
    login: false,
    demo: false,
    leadCapture: false
  }
  
  try {
    // Test signup flow
    const user = await testSignupFlow()
    if (user) {
      results.signup = true
      
      // Test login flow with the created user
      results.login = await testLoginFlow(user)
    }
    
    // Test demo flow
    results.demo = await testDemoFlow()
    
    // Test lead capture
    results.leadCapture = await testLeadCapture()
    
  } catch (error) {
    console.error('💥 Test execution failed:', error)
  }
  
  // Print results
  console.log('\n📊 Test Results:')
  console.log('================')
  console.log(`Signup Flow:     ${results.signup ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Login Flow:      ${results.login ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Demo Flow:       ${results.demo ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Lead Capture:    ${results.leadCapture ? '✅ PASS' : '❌ FAIL'}`)
  
  const totalTests = Object.keys(results).length
  const passedTests = Object.values(results).filter(Boolean).length
  
  console.log(`\nOverall: ${passedTests}/${totalTests} tests passed`)
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed!')
    process.exit(0)
  } else {
    console.log('⚠️  Some tests failed. Check the logs above.')
    process.exit(1)
  }
}

// Run the tests
runTests().catch(error => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})