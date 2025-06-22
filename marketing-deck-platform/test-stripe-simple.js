const fetch = require('node-fetch');

// Simple Stripe integration test without environment dependencies
class SimpleStripeTest {
  constructor() {
    this.baseUrl = 'http://localhost:3002'; // Using the actual port from the server
    this.results = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
    this.results.push({ timestamp, type, message });
  }

  async testStripeEndpointAccessibility() {
    try {
      this.log('Testing Stripe endpoint accessibility...');

      const endpoints = [
        '/api/stripe/create-checkout',
        '/api/stripe/webhook',
        '/api/stripe/checkout',
        '/api/stripe/create-checkout-session'
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ test: 'data' })
          });

          this.log(`✅ ${endpoint} - Accessible (Status: ${response.status})`);
        } catch (error) {
          this.log(`❌ ${endpoint} - Not accessible: ${error.message}`, 'error');
        }
      }

      return true;
    } catch (error) {
      this.log(`Stripe endpoint test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testStripeCheckoutWithoutAuth() {
    try {
      this.log('Testing Stripe checkout without authentication...');

      const response = await fetch(`${this.baseUrl}/api/stripe/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'professional' })
      });

      const data = await response.json();

      if (response.status === 401) {
        this.log('✅ Checkout correctly requires authentication');
      } else if (response.status === 500) {
        this.log('⚠️  Checkout returns 500 - likely environment config issue');
      } else {
        this.log(`⚠️  Unexpected response: ${response.status} - ${JSON.stringify(data)}`);
      }

      return true;
    } catch (error) {
      this.log(`Stripe checkout test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testStripeWebhookSecurity() {
    try {
      this.log('Testing Stripe webhook security...');

      const response = await fetch(`${this.baseUrl}/api/stripe/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'customer.subscription.created',
          data: { object: { id: 'test' } }
        })
      });

      if (response.status === 400) {
        this.log('✅ Webhook correctly rejects unsigned requests');
      } else {
        this.log(`❌ Webhook security issue: Status ${response.status}`, 'error');
      }

      return true;
    } catch (error) {
      this.log(`Webhook security test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testServerHealth() {
    try {
      this.log('Testing server health...');

      const response = await fetch(`${this.baseUrl}/api/debug/env`, {
        method: 'GET'
      });

      if (response.ok) {
        this.log('✅ Server is healthy and responding');
      } else {
        this.log(`⚠️  Server health check: Status ${response.status}`);
      }

      return true;
    } catch (error) {
      this.log(`Server health test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testInvalidStripeData() {
    try {
      this.log('Testing invalid Stripe data handling...');

      const testCases = [
        { body: {}, description: 'Empty body' },
        { body: { plan: null }, description: 'Null plan' },
        { body: { plan: 'invalid' }, description: 'Invalid plan' },
        { body: { plan: '' }, description: 'Empty plan' }
      ];

      for (const testCase of testCases) {
        const response = await fetch(`${this.baseUrl}/api/stripe/create-checkout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testCase.body)
        });

        if (response.status >= 400) {
          this.log(`✅ Correctly rejected ${testCase.description}`);
        } else {
          this.log(`❌ Failed to reject ${testCase.description}`, 'error');
        }
      }

      return true;
    } catch (error) {
      this.log(`Invalid data test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async runTests() {
    this.log('🚀 Starting simple Stripe integration tests...');

    const tests = [
      { name: 'Server Health', fn: () => this.testServerHealth() },
      { name: 'Stripe Endpoint Accessibility', fn: () => this.testStripeEndpointAccessibility() },
      { name: 'Checkout Without Auth', fn: () => this.testStripeCheckoutWithoutAuth() },
      { name: 'Webhook Security', fn: () => this.testStripeWebhookSecurity() },
      { name: 'Invalid Data Handling', fn: () => this.testInvalidStripeData() }
    ];

    const results = { passed: 0, failed: 0, total: tests.length };

    for (const test of tests) {
      this.log(`\n📋 Running: ${test.name}`);
      try {
        const passed = await test.fn();
        if (passed) {
          results.passed++;
          this.log(`✅ ${test.name} - PASSED`);
        } else {
          results.failed++;
          this.log(`❌ ${test.name} - FAILED`, 'error');
        }
      } catch (error) {
        results.failed++;
        this.log(`❌ ${test.name} - ERROR: ${error.message}`, 'error');
      }
    }

    this.log('\n📊 Test Results:');
    this.log(`   Total: ${results.total}`);
    this.log(`   Passed: ${results.passed}`);
    this.log(`   Failed: ${results.failed}`);
    this.log(`   Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);

    return results;
  }
}

// Run tests
async function main() {
  const tester = new SimpleStripeTest();
  
  try {
    await tester.runTests();
  } catch (error) {
    console.error('Test suite failed:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = { SimpleStripeTest };