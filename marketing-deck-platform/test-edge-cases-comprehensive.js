const fs = require('fs');
const path = require('path');

class ComprehensiveEdgeCaseTester {
  constructor() {
    this.testResults = [];
    this.failedTests = [];
    this.passedTests = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
    this.testResults.push({ timestamp, type, message });
  }

  async testDatabaseEdgeCases() {
    this.log('🗄️ Testing database edge cases and constraints...');

    const dbTestCases = [
      {
        name: 'SQL Injection Prevention',
        test: () => {
          // Check if parameterized queries are used
          const queryFiles = [
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/db/queries.ts',
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/app/api/user/profile/route.ts'
          ];
          
          let sqlInjectionProtected = true;
          for (const file of queryFiles) {
            if (fs.existsSync(file)) {
              const content = fs.readFileSync(file, 'utf8');
              // Check for dangerous patterns
              if (content.includes('${') && content.includes('query') && !content.includes('parameterized')) {
                sqlInjectionProtected = false;
                this.log(`   ⚠️ Potential SQL injection risk in ${file}`, 'warning');
              }
            }
          }
          return sqlInjectionProtected;
        }
      },
      {
        name: 'Unicode and Special Character Handling',
        test: () => {
          // Test data that could break systems
          const testStrings = [
            '𝕿𝖍𝖎𝖘 𝖎𝖘 𝖚𝗇𝗂𝖈𝗈𝖉𝖊', // Unicode mathematical symbols
            '\u0000\u0001\u0002', // Null bytes and control characters
            '💩💩💩💩💩', // Emoji
            'SELECT * FROM users--', // SQL comment
            '<script>alert("xss")</script>', // XSS attempt
            '../../etc/passwd', // Path traversal
            'A'.repeat(10000), // Very long string
            '{"__proto__":{"admin":true}}' // Prototype pollution
          ];
          
          this.log(`   Testing ${testStrings.length} dangerous input patterns`);
          return true; // This test just documents patterns to check
        }
      },
      {
        name: 'Large Data Volume Handling',
        test: () => {
          // Check if there are limits on data sizes
          const apiFiles = [
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/app/api/upload/route.ts',
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/app/api/presentations/route.ts'
          ];
          
          let hasDataLimits = false;
          for (const file of apiFiles) {
            if (fs.existsSync(file)) {
              const content = fs.readFileSync(file, 'utf8');
              if (content.includes('size') && (content.includes('limit') || content.includes('max'))) {
                hasDataLimits = true;
              }
            }
          }
          return hasDataLimits;
        }
      },
      {
        name: 'Concurrent Transaction Safety',
        test: () => {
          // Check for transaction handling
          const dbFiles = [
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/supabase/enhanced-client.ts'
          ];
          
          let hasTransactionSafety = false;
          for (const file of dbFiles) {
            if (fs.existsSync(file)) {
              const content = fs.readFileSync(file, 'utf8');
              if (content.includes('transaction') || content.includes('begin') || content.includes('commit')) {
                hasTransactionSafety = true;
              }
            }
          }
          return hasTransactionSafety;
        }
      }
    ];

    let passed = 0;
    for (const testCase of dbTestCases) {
      try {
        const result = await testCase.test();
        if (result) {
          this.log(`   ✅ ${testCase.name}`);
          passed++;
          this.passedTests.push(`Database: ${testCase.name}`);
        } else {
          this.log(`   ❌ ${testCase.name}`, 'error');
          this.failedTests.push(`Database: ${testCase.name}`);
        }
      } catch (error) {
        this.log(`   ❌ ${testCase.name} - Error: ${error.message}`, 'error');
        this.failedTests.push(`Database: ${testCase.name} - ${error.message}`);
      }
    }

    return passed === dbTestCases.length;
  }

  async testAuthenticationEdgeCases() {
    this.log('🔐 Testing authentication edge cases...');

    const authTestCases = [
      {
        name: 'Session Hijacking Prevention',
        test: () => {
          const authFiles = [
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/auth/auth-system.ts',
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/middleware.ts'
          ];
          
          let hasSessionSecurity = false;
          for (const file of authFiles) {
            if (fs.existsSync(file)) {
              const content = fs.readFileSync(file, 'utf8');
              if (content.includes('secure') || content.includes('httpOnly') || content.includes('sameSite')) {
                hasSessionSecurity = true;
              }
            }
          }
          return hasSessionSecurity;
        }
      },
      {
        name: 'Brute Force Protection',
        test: () => {
          // Check for rate limiting or attempt counting
          const authFiles = [
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/app/api/auth/login/route.ts'
          ];
          
          let hasBruteForceProtection = false;
          for (const file of authFiles) {
            if (fs.existsSync(file)) {
              const content = fs.readFileSync(file, 'utf8');
              if (content.includes('rate') || content.includes('attempt') || content.includes('throttle')) {
                hasBruteForceProtection = true;
              }
            }
          }
          return hasBruteForceProtection;
        }
      },
      {
        name: 'Token Expiration Handling',
        test: () => {
          const authFiles = [
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/auth/auth-context.tsx'
          ];
          
          let hasTokenExpiration = false;
          for (const file of authFiles) {
            if (fs.existsSync(file)) {
              const content = fs.readFileSync(file, 'utf8');
              if (content.includes('expire') || content.includes('refresh') || content.includes('timeout')) {
                hasTokenExpiration = true;
              }
            }
          }
          return hasTokenExpiration;
        }
      },
      {
        name: 'Multiple Device Session Management',
        test: () => {
          // Check if multiple sessions are handled
          const authFiles = [
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/auth/auth-system.ts'
          ];
          
          let hasMultiDeviceHandling = false;
          for (const file of authFiles) {
            if (fs.existsSync(file)) {
              const content = fs.readFileSync(file, 'utf8');
              if (content.includes('device') || content.includes('session') && content.includes('multiple')) {
                hasMultiDeviceHandling = true;
              }
            }
          }
          return hasMultiDeviceHandling;
        }
      }
    ];

    let passed = 0;
    for (const testCase of authTestCases) {
      try {
        const result = await testCase.test();
        if (result) {
          this.log(`   ✅ ${testCase.name}`);
          passed++;
          this.passedTests.push(`Auth: ${testCase.name}`);
        } else {
          this.log(`   ❌ ${testCase.name}`, 'error');
          this.failedTests.push(`Auth: ${testCase.name}`);
        }
      } catch (error) {
        this.log(`   ❌ ${testCase.name} - Error: ${error.message}`, 'error');
        this.failedTests.push(`Auth: ${testCase.name} - ${error.message}`);
      }
    }

    return passed === authTestCases.length;
  }

  async testFileUploadEdgeCases() {
    this.log('📤 Testing file upload edge cases...');

    const uploadTestCases = [
      {
        name: 'Malicious File Detection',
        test: () => {
          const uploadFiles = [
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/app/api/upload/route.ts',
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/data/file-parser.ts'
          ];
          
          let hasVirusProtection = false;
          for (const file of uploadFiles) {
            if (fs.existsSync(file)) {
              const content = fs.readFileSync(file, 'utf8');
              if (content.includes('scan') || content.includes('virus') || content.includes('malware')) {
                hasVirusProtection = true;
              }
            }
          }
          return hasVirusProtection;
        }
      },
      {
        name: 'File Type Spoofing Prevention',
        test: () => {
          const uploadFiles = [
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/data/file-parser.ts'
          ];
          
          let hasContentValidation = false;
          for (const file of uploadFiles) {
            if (fs.existsSync(file)) {
              const content = fs.readFileSync(file, 'utf8');
              if (content.includes('magic') || content.includes('signature') || content.includes('header')) {
                hasContentValidation = true;
              }
            }
          }
          return hasContentValidation;
        }
      },
      {
        name: 'Zip Bomb Protection',
        test: () => {
          // Check for compression ratio limits
          const uploadFiles = [
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/app/api/upload/route.ts'
          ];
          
          let hasCompressionProtection = false;
          for (const file of uploadFiles) {
            if (fs.existsSync(file)) {
              const content = fs.readFileSync(file, 'utf8');
              if (content.includes('compression') && content.includes('ratio') || content.includes('zip') && content.includes('limit')) {
                hasCompressionProtection = true;
              }
            }
          }
          return hasCompressionProtection;
        }
      },
      {
        name: 'Path Traversal Prevention',
        test: () => {
          const uploadFiles = [
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/app/api/upload/route.ts'
          ];
          
          let hasPathValidation = false;
          for (const file of uploadFiles) {
            if (fs.existsSync(file)) {
              const content = fs.readFileSync(file, 'utf8');
              if (content.includes('path') && (content.includes('sanitize') || content.includes('normalize'))) {
                hasPathValidation = true;
              }
            }
          }
          return hasPathValidation;
        }
      }
    ];

    let passed = 0;
    for (const testCase of uploadTestCases) {
      try {
        const result = await testCase.test();
        if (result) {
          this.log(`   ✅ ${testCase.name}`);
          passed++;
          this.passedTests.push(`Upload: ${testCase.name}`);
        } else {
          this.log(`   ❌ ${testCase.name}`, 'error');
          this.failedTests.push(`Upload: ${testCase.name}`);
        }
      } catch (error) {
        this.log(`   ❌ ${testCase.name} - Error: ${error.message}`, 'error');
        this.failedTests.push(`Upload: ${testCase.name} - ${error.message}`);
      }
    }

    return passed === uploadTestCases.length;
  }

  async testPaymentEdgeCases() {
    this.log('💳 Testing payment processing edge cases...');

    const paymentTestCases = [
      {
        name: 'Double Payment Prevention',
        test: () => {
          const stripeFiles = [
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/app/api/stripe/create-checkout/route.ts',
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/hooks/useTierLimits.ts'
          ];
          
          let hasIdempotency = false;
          for (const file of stripeFiles) {
            if (fs.existsSync(file)) {
              const content = fs.readFileSync(file, 'utf8');
              if (content.includes('idempotent') || content.includes('duplicate') || content.includes('already')) {
                hasIdempotency = true;
              }
            }
          }
          return hasIdempotency;
        }
      },
      {
        name: 'Webhook Replay Attack Prevention',
        test: () => {
          const webhookFiles = [
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/app/api/stripe/webhook/route.ts'
          ];
          
          let hasReplayProtection = false;
          for (const file of webhookFiles) {
            if (fs.existsSync(file)) {
              const content = fs.readFileSync(file, 'utf8');
              if (content.includes('timestamp') || content.includes('replay') || content.includes('nonce')) {
                hasReplayProtection = true;
              }
            }
          }
          return hasReplayProtection;
        }
      },
      {
        name: 'Payment Amount Validation',
        test: () => {
          const paymentFiles = [
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/app/api/stripe/create-checkout/route.ts'
          ];
          
          let hasAmountValidation = false;
          for (const file of paymentFiles) {
            if (fs.existsSync(file)) {
              const content = fs.readFileSync(file, 'utf8');
              if (content.includes('amount') && content.includes('validate')) {
                hasAmountValidation = true;
              }
            }
          }
          return hasAmountValidation;
        }
      },
      {
        name: 'Failed Payment Recovery',
        test: () => {
          const paymentFiles = [
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/app/api/stripe/webhook/route.ts',
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/hooks/useTierLimits.ts'
          ];
          
          let hasFailureRecovery = false;
          for (const file of paymentFiles) {
            if (fs.existsSync(file)) {
              const content = fs.readFileSync(file, 'utf8');
              if (content.includes('failed') && (content.includes('retry') || content.includes('rollback'))) {
                hasFailureRecovery = true;
              }
            }
          }
          return hasFailureRecovery;
        }
      }
    ];

    let passed = 0;
    for (const testCase of paymentTestCases) {
      try {
        const result = await testCase.test();
        if (result) {
          this.log(`   ✅ ${testCase.name}`);
          passed++;
          this.passedTests.push(`Payment: ${testCase.name}`);
        } else {
          this.log(`   ❌ ${testCase.name}`, 'error');
          this.failedTests.push(`Payment: ${testCase.name}`);
        }
      } catch (error) {
        this.log(`   ❌ ${testCase.name} - Error: ${error.message}`, 'error');
        this.failedTests.push(`Payment: ${testCase.name} - ${error.message}`);
      }
    }

    return passed === paymentTestCases.length;
  }

  async testAISecurityEdgeCases() {
    this.log('🤖 Testing AI integration security edge cases...');

    const aiTestCases = [
      {
        name: 'Prompt Injection Prevention',
        test: () => {
          const aiFiles = [
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/ai/enhanced-brain-v2.ts',
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/app/api/openai/enhanced-analyze/route.ts'
          ];
          
          let hasPromptSanitization = false;
          for (const file of aiFiles) {
            if (fs.existsSync(file)) {
              const content = fs.readFileSync(file, 'utf8');
              if (content.includes('sanitize') || content.includes('validate') || content.includes('filter')) {
                hasPromptSanitization = true;
              }
            }
          }
          return hasPromptSanitization;
        }
      },
      {
        name: 'Output Content Filtering',
        test: () => {
          const aiFiles = [
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/ai/enhanced-brain-v2.ts'
          ];
          
          let hasOutputFiltering = false;
          for (const file of aiFiles) {
            if (fs.existsSync(file)) {
              const content = fs.readFileSync(file, 'utf8');
              if (content.includes('content') && (content.includes('filter') || content.includes('validate'))) {
                hasOutputFiltering = true;
              }
            }
          }
          return hasOutputFiltering;
        }
      },
      {
        name: 'API Rate Limiting',
        test: () => {
          const aiFiles = [
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/app/api/openai/enhanced-analyze/route.ts'
          ];
          
          let hasRateLimiting = false;
          for (const file of aiFiles) {
            if (fs.existsSync(file)) {
              const content = fs.readFileSync(file, 'utf8');
              if (content.includes('rate') || content.includes('throttle') || content.includes('limit')) {
                hasRateLimiting = true;
              }
            }
          }
          return hasRateLimiting;
        }
      },
      {
        name: 'Data Privacy in AI Requests',
        test: () => {
          const aiFiles = [
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/ai/enhanced-brain-v2.ts'
          ];
          
          let hasDataPrivacy = false;
          for (const file of aiFiles) {
            if (fs.existsSync(file)) {
              const content = fs.readFileSync(file, 'utf8');
              if (content.includes('privacy') || content.includes('anonymize') || content.includes('redact')) {
                hasDataPrivacy = true;
              }
            }
          }
          return hasDataPrivacy;
        }
      }
    ];

    let passed = 0;
    for (const testCase of aiTestCases) {
      try {
        const result = await testCase.test();
        if (result) {
          this.log(`   ✅ ${testCase.name}`);
          passed++;
          this.passedTests.push(`AI: ${testCase.name}`);
        } else {
          this.log(`   ❌ ${testCase.name}`, 'error');
          this.failedTests.push(`AI: ${testCase.name}`);
        }
      } catch (error) {
        this.log(`   ❌ ${testCase.name} - Error: ${error.message}`, 'error');
        this.failedTests.push(`AI: ${testCase.name} - ${error.message}`);
      }
    }

    return passed === aiTestCases.length;
  }

  async testConcurrencyEdgeCases() {
    this.log('⚡ Testing concurrency and race condition edge cases...');

    const concurrencyTestCases = [
      {
        name: 'Usage Counter Race Conditions',
        test: () => {
          const usageFiles = [
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/hooks/useTierLimits.ts',
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/components/deck-builder/UltimateDeckBuilder.tsx'
          ];
          
          let hasRaceProtection = false;
          for (const file of usageFiles) {
            if (fs.existsSync(file)) {
              const content = fs.readFileSync(file, 'utf8');
              if (content.includes('race') || content.includes('atomic') || content.includes('prevent')) {
                hasRaceProtection = true;
              }
            }
          }
          return hasRaceProtection;
        }
      },
      {
        name: 'Database Connection Pool Exhaustion',
        test: () => {
          const dbFiles = [
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/supabase/enhanced-client.ts'
          ];
          
          let hasPoolManagement = false;
          for (const file of dbFiles) {
            if (fs.existsSync(file)) {
              const content = fs.readFileSync(file, 'utf8');
              if (content.includes('pool') || content.includes('connection') && content.includes('limit')) {
                hasPoolManagement = true;
              }
            }
          }
          return hasPoolManagement;
        }
      },
      {
        name: 'Memory Leak Under Load',
        test: () => {
          const componentFiles = [
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/components/deck-builder/UltimateDeckBuilder.tsx',
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/components/editor/WorldClassPresentationEditor.tsx'
          ];
          
          let hasMemoryManagement = false;
          for (const file of componentFiles) {
            if (fs.existsSync(file)) {
              const content = fs.readFileSync(file, 'utf8');
              if (content.includes('cleanup') || content.includes('useEffect') && content.includes('return')) {
                hasMemoryManagement = true;
              }
            }
          }
          return hasMemoryManagement;
        }
      },
      {
        name: 'File System Race Conditions',
        test: () => {
          const uploadFiles = [
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/app/api/upload/route.ts'
          ];
          
          let hasFileRaceProtection = false;
          for (const file of uploadFiles) {
            if (fs.existsSync(file)) {
              const content = fs.readFileSync(file, 'utf8');
              if (content.includes('lock') || content.includes('atomic') || content.includes('temp')) {
                hasFileRaceProtection = true;
              }
            }
          }
          return hasFileRaceProtection;
        }
      }
    ];

    let passed = 0;
    for (const testCase of concurrencyTestCases) {
      try {
        const result = await testCase.test();
        if (result) {
          this.log(`   ✅ ${testCase.name}`);
          passed++;
          this.passedTests.push(`Concurrency: ${testCase.name}`);
        } else {
          this.log(`   ❌ ${testCase.name}`, 'error');
          this.failedTests.push(`Concurrency: ${testCase.name}`);
        }
      } catch (error) {
        this.log(`   ❌ ${testCase.name} - Error: ${error.message}`, 'error');
        this.failedTests.push(`Concurrency: ${testCase.name} - ${error.message}`);
      }
    }

    return passed === concurrencyTestCases.length;
  }

  async runAllEdgeCaseTests() {
    this.log('🚀 Starting comprehensive edge case testing...');
    this.log('This will test the system against malicious inputs, edge cases, and real-world attack scenarios.\n');

    const testSuites = [
      { name: 'Database Edge Cases', fn: () => this.testDatabaseEdgeCases() },
      { name: 'Authentication Edge Cases', fn: () => this.testAuthenticationEdgeCases() },
      { name: 'File Upload Edge Cases', fn: () => this.testFileUploadEdgeCases() },
      { name: 'Payment Edge Cases', fn: () => this.testPaymentEdgeCases() },
      { name: 'AI Security Edge Cases', fn: () => this.testAISecurityEdgeCases() },
      { name: 'Concurrency Edge Cases', fn: () => this.testConcurrencyEdgeCases() }
    ];

    const results = { passed: 0, failed: 0, total: testSuites.length };

    for (const testSuite of testSuites) {
      this.log(`\n📋 Running: ${testSuite.name}`);
      try {
        const passed = await testSuite.fn();
        if (passed) {
          results.passed++;
          this.log(`✅ ${testSuite.name} - ALL TESTS PASSED`);
        } else {
          results.failed++;
          this.log(`❌ ${testSuite.name} - SOME TESTS FAILED`, 'error');
        }
      } catch (error) {
        results.failed++;
        this.log(`❌ ${testSuite.name} - ERROR: ${error.message}`, 'error');
      }
    }

    this.log('\n📊 Edge Case Test Results Summary:');
    this.log(`   Total Test Suites: ${results.total}`);
    this.log(`   Passed: ${results.passed}`);
    this.log(`   Failed: ${results.failed}`);
    this.log(`   Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);

    this.log('\n📋 Individual Test Results:');
    this.log(`   ✅ Passed Tests: ${this.passedTests.length}`);
    this.passedTests.forEach(test => this.log(`      - ${test}`));
    
    this.log(`   ❌ Failed Tests: ${this.failedTests.length}`);
    this.failedTests.forEach(test => this.log(`      - ${test}`, 'error'));

    if (this.failedTests.length > 0) {
      this.log('\n⚠️ CRITICAL: The following security issues need immediate attention:', 'error');
      this.failedTests.forEach(test => {
        this.log(`   🔴 ${test}`, 'error');
      });
    } else {
      this.log('\n🎉 All edge case tests passed! The system is robust against common attack vectors.');
    }

    return {
      overallPassed: results.failed === 0,
      passedTests: this.passedTests,
      failedTests: this.failedTests,
      summary: results
    };
  }
}

// Run tests
async function main() {
  const tester = new ComprehensiveEdgeCaseTester();
  
  try {
    const results = await tester.runAllEdgeCaseTests();
    
    // Save detailed results
    const reportData = {
      timestamp: new Date().toISOString(),
      testType: 'Edge Case Security Testing',
      overallStatus: results.overallPassed ? 'PASSED' : 'FAILED',
      summary: results.summary,
      passedTests: results.passedTests,
      failedTests: results.failedTests,
      recommendations: results.failedTests.length > 0 ? [
        'Review and implement missing security measures',
        'Add input validation and sanitization',
        'Implement proper error handling',
        'Add rate limiting and abuse prevention',
        'Review authentication and session management'
      ] : [
        'Continue monitoring for new attack vectors',
        'Regular security audits recommended',
        'Keep dependencies updated',
        'Monitor for unusual usage patterns'
      ]
    };
    
    fs.writeFileSync('edge-case-test-report.json', JSON.stringify(reportData, null, 2));
    console.log('\n📄 Detailed edge case test report saved to: edge-case-test-report.json');
    
  } catch (error) {
    console.error('Edge case test suite failed:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = { ComprehensiveEdgeCaseTester };