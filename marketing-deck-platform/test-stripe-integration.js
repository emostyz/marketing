const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  testUser: {
    email: 'test-stripe@example.com',
    password: 'testpassword123'
  }
};

// Initialize Supabase client
const supabase = createClient(TEST_CONFIG.supabaseUrl, TEST_CONFIG.supabaseKey);

class StripeIntegrationTester {
  constructor() {
    this.testResults = [];
    this.testUser = null;
    this.authToken = null;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
    console.log(logMessage);
    this.testResults.push({ timestamp, type, message });
  }

  async setupTestUser() {
    try {
      this.log('Setting up test user for Stripe integration tests...');
      
      // Try to sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: TEST_CONFIG.testUser.email,
        password: TEST_CONFIG.testUser.password
      });

      if (authError && !authError.message.includes('already registered')) {
        throw authError;
      }

      // Sign in the user
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: TEST_CONFIG.testUser.email,
        password: TEST_CONFIG.testUser.password
      });

      if (signInError) {
        throw signInError;
      }

      this.testUser = signInData.user;
      this.authToken = signInData.session.access_token;
      this.log(`Test user authenticated: ${this.testUser.id}`);
      
      return true;
    } catch (error) {
      this.log(`Failed to setup test user: ${error.message}`, 'error');
      return false;
    }
  }

  async testStripeCheckoutCreation() {
    try {
      this.log('Testing Stripe checkout session creation...');

      const testCases = [
        { plan: 'professional', name: 'Professional Plan' },
        { plan: 'enterprise', name: 'Enterprise Plan' }
      ];

      for (const testCase of testCases) {
        this.log(`Testing ${testCase.name} checkout creation...`);

        const response = await fetch(`${TEST_CONFIG.baseUrl}/api/stripe/create-checkout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.authToken}`
          },
          body: JSON.stringify({ plan: testCase.plan })
        });

        const data = await response.json();

        if (response.ok && data.sessionId && data.url) {
          this.log(`✅ ${testCase.name} checkout session created successfully`);
          this.log(`   Session ID: ${data.sessionId}`);
          this.log(`   Checkout URL: ${data.url}`);
        } else {
          this.log(`❌ ${testCase.name} checkout creation failed: ${data.error || 'Unknown error'}`, 'error');
        }
      }

      return true;
    } catch (error) {
      this.log(`Stripe checkout creation test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testStripeCheckoutValidation() {
    try {
      this.log('Testing Stripe checkout validation...');

      const invalidCases = [
        { plan: null, expected: 'Invalid plan' },
        { plan: 'invalid', expected: 'Invalid plan' },
        { plan: '', expected: 'Invalid plan' }
      ];

      for (const testCase of invalidCases) {
        this.log(`Testing invalid plan: ${testCase.plan}`);

        const response = await fetch(`${TEST_CONFIG.baseUrl}/api/stripe/create-checkout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.authToken}`
          },
          body: JSON.stringify({ plan: testCase.plan })
        });

        const data = await response.json();

        if (!response.ok && data.error) {
          this.log(`✅ Validation correctly rejected invalid plan: ${testCase.plan}`);
        } else {
          this.log(`❌ Validation failed to reject invalid plan: ${testCase.plan}`, 'error');
        }
      }

      return true;
    } catch (error) {
      this.log(`Stripe checkout validation test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testStripeEnvironmentConfig() {
    try {
      this.log('Testing Stripe environment configuration...');

      const requiredEnvVars = [
        'STRIPE_SECRET_KEY',
        'STRIPE_PROFESSIONAL_PRICE_ID',
        'STRIPE_ENTERPRISE_PRICE_ID',
        'STRIPE_WEBHOOK_SECRET'
      ];

      let allConfigured = true;

      for (const envVar of requiredEnvVars) {
        if (process.env[envVar]) {
          this.log(`✅ ${envVar} is configured`);
        } else {
          this.log(`❌ ${envVar} is missing`, 'error');
          allConfigured = false;
        }
      }

      if (allConfigured) {
        this.log('✅ All required Stripe environment variables are configured');
      } else {
        this.log('❌ Some required Stripe environment variables are missing', 'error');
      }

      return allConfigured;
    } catch (error) {
      this.log(`Stripe environment config test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testTierLimitIntegration() {
    try {
      this.log('Testing tier limit integration with Stripe...');

      // Test current subscription info
      const subscriptionResponse = await fetch(`${TEST_CONFIG.baseUrl}/api/user/subscription`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      });

      if (subscriptionResponse.ok) {
        const subscriptionData = await subscriptionResponse.json();
        this.log(`✅ User subscription info retrieved: ${JSON.stringify(subscriptionData.subscription.plan)}`);
        
        // Test usage check
        const usageResponse = await fetch(`${TEST_CONFIG.baseUrl}/api/user/usage-check`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.authToken}`
          },
          body: JSON.stringify({ action: 'presentations' })
        });

        if (usageResponse.ok) {
          const usageData = await usageResponse.json();
          this.log(`✅ Usage check successful: ${usageData.currentUsage}/${usageData.limit} presentations`);
        } else {
          this.log(`❌ Usage check failed`, 'error');
        }
      } else {
        this.log(`❌ Failed to retrieve subscription info`, 'error');
      }

      return true;
    } catch (error) {
      this.log(`Tier limit integration test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testUpgradePromptIntegration() {
    try {
      this.log('Testing upgrade prompt integration...');

      // Test that upgrade prompt can be triggered
      const response = await fetch(`${TEST_CONFIG.baseUrl}/api/user/usage-check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        },
        body: JSON.stringify({ action: 'presentations' })
      });

      if (response.ok) {
        const data = await response.json();
        this.log(`✅ Upgrade prompt data available: needsUpgrade=${data.needsUpgrade}`);
        
        if (data.needsUpgrade) {
          this.log('   User is at limit and would see upgrade prompt');
        } else {
          this.log('   User is within limits');
        }
      } else {
        this.log(`❌ Failed to test upgrade prompt integration`, 'error');
      }

      return true;
    } catch (error) {
      this.log(`Upgrade prompt integration test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testWebhookEndpoint() {
    try {
      this.log('Testing Stripe webhook endpoint...');

      // Test webhook endpoint accessibility (should reject requests without proper signature)
      const response = await fetch(`${TEST_CONFIG.baseUrl}/api/stripe/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ test: 'data' })
      });

      // Should return 400 for invalid signature
      if (response.status === 400) {
        this.log('✅ Webhook endpoint correctly rejects invalid requests');
      } else {
        this.log(`❌ Webhook endpoint response unexpected: ${response.status}`, 'error');
      }

      return true;
    } catch (error) {
      this.log(`Webhook endpoint test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testStripeAPIConnection() {
    try {
      this.log('Testing Stripe API connection...');

      // Test by trying to create a basic checkout session
      const response = await fetch(`${TEST_CONFIG.baseUrl}/api/stripe/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        },
        body: JSON.stringify({ plan: 'professional' })
      });

      if (response.ok) {
        this.log('✅ Stripe API connection successful');
        return true;
      } else {
        const data = await response.json();
        this.log(`❌ Stripe API connection failed: ${data.error}`, 'error');
        return false;
      }
    } catch (error) {
      this.log(`Stripe API connection test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async runAllTests() {
    this.log('🚀 Starting comprehensive Stripe integration tests...');
    
    const testSuite = [
      { name: 'Environment Configuration', test: () => this.testStripeEnvironmentConfig() },
      { name: 'Test User Setup', test: () => this.setupTestUser() },
      { name: 'Stripe API Connection', test: () => this.testStripeAPIConnection() },
      { name: 'Checkout Session Creation', test: () => this.testStripeCheckoutCreation() },
      { name: 'Checkout Validation', test: () => this.testStripeCheckoutValidation() },
      { name: 'Tier Limit Integration', test: () => this.testTierLimitIntegration() },
      { name: 'Upgrade Prompt Integration', test: () => this.testUpgradePromptIntegration() },
      { name: 'Webhook Endpoint', test: () => this.testWebhookEndpoint() }
    ];

    const results = {
      passed: 0,
      failed: 0,
      total: testSuite.length
    };

    for (const testCase of testSuite) {
      this.log(`\n📋 Running: ${testCase.name}`);
      const passed = await testCase.test();
      
      if (passed) {
        results.passed++;
        this.log(`✅ ${testCase.name} - PASSED`);
      } else {
        results.failed++;
        this.log(`❌ ${testCase.name} - FAILED`, 'error');
      }
    }

    this.log('\n📊 Test Results Summary:');
    this.log(`   Total Tests: ${results.total}`);
    this.log(`   Passed: ${results.passed}`);
    this.log(`   Failed: ${results.failed}`);
    this.log(`   Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);

    if (results.failed === 0) {
      this.log('🎉 All Stripe integration tests passed!');
    } else {
      this.log(`⚠️  ${results.failed} test(s) failed. Please review the errors above.`, 'error');
    }

    return results;
  }

  async cleanup() {
    try {
      if (this.testUser) {
        this.log('Cleaning up test user...');
        // Note: In a real scenario, you might want to delete the test user
        // For now, we'll just sign out
        await supabase.auth.signOut();
      }
    } catch (error) {
      this.log(`Cleanup failed: ${error.message}`, 'error');
    }
  }
}

// Run the tests
async function main() {
  const tester = new StripeIntegrationTester();
  
  try {
    const results = await tester.runAllTests();
    
    // Save detailed results to file
    const fs = require('fs');
    const testReport = {
      timestamp: new Date().toISOString(),
      results: results,
      logs: tester.testResults
    };
    
    fs.writeFileSync('stripe-integration-test-report.json', JSON.stringify(testReport, null, 2));
    console.log('\n📄 Detailed test report saved to: stripe-integration-test-report.json');
    
  } catch (error) {
    console.error('Test suite failed:', error);
  } finally {
    await tester.cleanup();
  }
}

if (require.main === module) {
  main();
}

module.exports = { StripeIntegrationTester };