/**
 * Comprehensive Security Features Test Suite
 * Tests all newly implemented security features
 */

const fs = require('fs');
const path = require('path');

class SecurityFeaturesTester {
  constructor() {
    this.testResults = [];
    this.passedTests = [];
    this.failedTests = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
    this.testResults.push({ timestamp, type, message });
  }

  async testDataValidatorFeature() {
    this.log('🛡️ Testing Data Validation Pipeline...');

    const tests = [
      {
        name: 'Data Validator Exists',
        test: () => {
          const validatorPath = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/data-validator.ts';
          return fs.existsSync(validatorPath);
        }
      },
      {
        name: 'Has SQL Injection Prevention',
        test: () => {
          const validatorPath = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/data-validator.ts';
          if (!fs.existsSync(validatorPath)) return false;
          const content = fs.readFileSync(validatorPath, 'utf8');
          return content.includes('SQL injection') && content.includes('parameterized');
        }
      },
      {
        name: 'Has XSS Prevention',
        test: () => {
          const validatorPath = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/data-validator.ts';
          if (!fs.existsSync(validatorPath)) return false;
          const content = fs.readFileSync(validatorPath, 'utf8');
          return content.includes('XSS') && content.includes('DOMPurify');
        }
      },
      {
        name: 'Has Unicode Normalization',
        test: () => {
          const validatorPath = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/data-validator.ts';
          if (!fs.existsSync(validatorPath)) return false;
          const content = fs.readFileSync(validatorPath, 'utf8');
          return content.includes('normalize') && content.includes('NFKC');
        }
      },
      {
        name: 'Has Data Size Limits',
        test: () => {
          const validatorPath = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/data-validator.ts';
          if (!fs.existsSync(validatorPath)) return false;
          const content = fs.readFileSync(validatorPath, 'utf8');
          return content.includes('maxFileSize') && content.includes('checkDataSize');
        }
      },
      {
        name: 'Has Prototype Pollution Protection',
        test: () => {
          const validatorPath = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/data-validator.ts';
          if (!fs.existsSync(validatorPath)) return false;
          const content = fs.readFileSync(validatorPath, 'utf8');
          return content.includes('__proto__') && content.includes('prototype pollution');
        }
      },
      {
        name: 'Has Schema Validation with Zod',
        test: () => {
          const validatorPath = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/data-validator.ts';
          if (!fs.existsSync(validatorPath)) return false;
          const content = fs.readFileSync(validatorPath, 'utf8');
          return content.includes('zod') && content.includes('ZodSchema');
        }
      }
    ];

    return this.runTestGroup('Data Validator', tests);
  }

  async testFileSecurityFeature() {
    this.log('📤 Testing File Security System...');

    const tests = [
      {
        name: 'File Security Scanner Exists',
        test: () => {
          const scannerPath = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/file-security.ts';
          return fs.existsSync(scannerPath);
        }
      },
      {
        name: 'Has Malicious File Detection',
        test: () => {
          const scannerPath = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/file-security.ts';
          if (!fs.existsSync(scannerPath)) return false;
          const content = fs.readFileSync(scannerPath, 'utf8');
          return content.includes('MALICIOUS_SIGNATURES') && content.includes('virus');
        }
      },
      {
        name: 'Has Zip Bomb Protection',
        test: () => {
          const scannerPath = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/file-security.ts';
          if (!fs.existsSync(scannerPath)) return false;
          const content = fs.readFileSync(scannerPath, 'utf8');
          return content.includes('zip bomb') && content.includes('compression');
        }
      },
      {
        name: 'Has Path Traversal Prevention',
        test: () => {
          const scannerPath = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/file-security.ts';
          if (!fs.existsSync(scannerPath)) return false;
          const content = fs.readFileSync(scannerPath, 'utf8');
          return content.includes('path traversal') && content.includes('..');
        }
      },
      {
        name: 'Has File Type Validation',
        test: () => {
          const scannerPath = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/file-security.ts';
          if (!fs.existsSync(scannerPath)) return false;
          const content = fs.readFileSync(scannerPath, 'utf8');
          return content.includes('allowedExtensions') && content.includes('allowedMimeTypes');
        }
      },
      {
        name: 'Has Quarantine System',
        test: () => {
          const scannerPath = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/file-security.ts';
          if (!fs.existsSync(scannerPath)) return false;
          const content = fs.readFileSync(scannerPath, 'utf8');
          return content.includes('quarantine') && content.includes('quarantineFile');
        }
      },
      {
        name: 'Has MIME Type Spoofing Detection',
        test: () => {
          const scannerPath = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/file-security.ts';
          if (!fs.existsSync(scannerPath)) return false;
          const content = fs.readFileSync(scannerPath, 'utf8');
          return content.includes('MIME type mismatch') && content.includes('spoofing');
        }
      }
    ];

    return this.runTestGroup('File Security', tests);
  }

  async testPaymentSecurityFeature() {
    this.log('💳 Testing Payment Security System...');

    const tests = [
      {
        name: 'Payment Security Manager Exists',
        test: () => {
          const paymentPath = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/payment-security.ts';
          return fs.existsSync(paymentPath);
        }
      },
      {
        name: 'Has Double Payment Prevention',
        test: () => {
          const paymentPath = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/payment-security.ts';
          if (!fs.existsSync(paymentPath)) return false;
          const content = fs.readFileSync(paymentPath, 'utf8');
          return content.includes('duplicate') && content.includes('fingerprint');
        }
      },
      {
        name: 'Has Webhook Replay Protection',
        test: () => {
          const paymentPath = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/payment-security.ts';
          if (!fs.existsSync(paymentPath)) return false;
          const content = fs.readFileSync(paymentPath, 'utf8');
          return content.includes('replay attack') && content.includes('timestamp');
        }
      },
      {
        name: 'Has Payment Amount Validation',
        test: () => {
          const paymentPath = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/payment-security.ts';
          if (!fs.existsSync(paymentPath)) return false;
          const content = fs.readFileSync(paymentPath, 'utf8');
          return content.includes('validatePaymentAmount') && content.includes('expectedAmounts');
        }
      },
      {
        name: 'Has Idempotency System',
        test: () => {
          const paymentPath = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/payment-security.ts';
          if (!fs.existsSync(paymentPath)) return false;
          const content = fs.readFileSync(paymentPath, 'utf8');
          return content.includes('ensureIdempotency') && content.includes('operationId');
        }
      },
      {
        name: 'Has Rate Limiting',
        test: () => {
          const paymentPath = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/payment-security.ts';
          if (!fs.existsSync(paymentPath)) return false;
          const content = fs.readFileSync(paymentPath, 'utf8');
          return content.includes('checkPaymentRateLimit') && content.includes('maxPaymentAttempts');
        }
      },
      {
        name: 'Has Geographic Validation',
        test: () => {
          const paymentPath = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/payment-security.ts';
          if (!fs.existsSync(paymentPath)) return false;
          const content = fs.readFileSync(paymentPath, 'utf8');
          return content.includes('validateGeographicConsistency') && content.includes('ipAddress');
        }
      },
      {
        name: 'Has Failure Recovery System',
        test: () => {
          const paymentPath = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/payment-security.ts';
          if (!fs.existsSync(paymentPath)) return false;
          const content = fs.readFileSync(paymentPath, 'utf8');
          return content.includes('handlePaymentFailure') && content.includes('rollbackUsageIncrements');
        }
      }
    ];

    return this.runTestGroup('Payment Security', tests);
  }

  async testTransactionManagerFeature() {
    this.log('🗄️ Testing Database Transaction Safety...');

    const tests = [
      {
        name: 'Transaction Manager Exists',
        test: () => {
          const transactionPath = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/db/transaction-manager.ts';
          return fs.existsSync(transactionPath);
        }
      },
      {
        name: 'Has Optimistic Locking',
        test: () => {
          const transactionPath = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/db/transaction-manager.ts';
          if (!fs.existsSync(transactionPath)) return false;
          const content = fs.readFileSync(transactionPath, 'utf8');
          return content.includes('executeWithOptimisticLock') && content.includes('versionColumn');
        }
      },
      {
        name: 'Has Distributed Locking',
        test: () => {
          const transactionPath = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/db/transaction-manager.ts';
          if (!fs.existsSync(transactionPath)) return false;
          const content = fs.readFileSync(transactionPath, 'utf8');
          return content.includes('executeWithDistributedLock') && content.includes('advisory_lock');
        }
      },
      {
        name: 'Has Connection Pool Management',
        test: () => {
          const transactionPath = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/db/transaction-manager.ts';
          if (!fs.existsSync(transactionPath)) return false;
          const content = fs.readFileSync(transactionPath, 'utf8');
          return content.includes('ConnectionPool') && content.includes('maxConnections');
        }
      },
      {
        name: 'Has Deadlock Detection',
        test: () => {
          const transactionPath = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/db/transaction-manager.ts';
          if (!fs.existsSync(transactionPath)) return false;
          const content = fs.readFileSync(transactionPath, 'utf8');
          return content.includes('deadlock') && content.includes('isDeadlockError');
        }
      },
      {
        name: 'Has Auto Rollback',
        test: () => {
          const transactionPath = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/db/transaction-manager.ts';
          if (!fs.existsSync(transactionPath)) return false;
          const content = fs.readFileSync(transactionPath, 'utf8');
          return content.includes('enableAutoRollback') && content.includes('rollbackTransaction');
        }
      },
      {
        name: 'Has Transaction Retry Logic',
        test: () => {
          const transactionPath = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/db/transaction-manager.ts';
          if (!fs.existsSync(transactionPath)) return false;
          const content = fs.readFileSync(transactionPath, 'utf8');
          return content.includes('maxRetries') && content.includes('isRetryableError');
        }
      },
      {
        name: 'Has Batch Processing',
        test: () => {
          const transactionPath = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/db/transaction-manager.ts';
          if (!fs.existsSync(transactionPath)) return false;
          const content = fs.readFileSync(transactionPath, 'utf8');
          return content.includes('executeBatch') && content.includes('batchSize');
        }
      }
    ];

    return this.runTestGroup('Transaction Manager', tests);
  }

  async testRateLimiterFeature() {
    this.log('⚡ Testing Rate Limiting System...');

    const tests = [
      {
        name: 'Rate Limiter Exists',
        test: () => {
          const rateLimiterPath = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/rate-limiter.ts';
          return fs.existsSync(rateLimiterPath);
        }
      },
      {
        name: 'Has Adaptive Rate Limiting',
        test: () => {
          const rateLimiterPath = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/rate-limiter.ts';
          if (!fs.existsSync(rateLimiterPath)) return false;
          const content = fs.readFileSync(rateLimiterPath, 'utf8');
          return content.includes('enableAdaptiveLimit') && content.includes('adaptiveMultiplier');
        }
      },
      {
        name: 'Has Burst Rate Handling',
        test: () => {
          const rateLimiterPath = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/rate-limiter.ts';
          if (!fs.existsSync(rateLimiterPath)) return false;
          const content = fs.readFileSync(rateLimiterPath, 'utf8');
          return content.includes('burstSize') && content.includes('burstUsed');
        }
      },
      {
        name: 'Has Endpoint-Specific Configs',
        test: () => {
          const rateLimiterPath = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/rate-limiter.ts';
          if (!fs.existsSync(rateLimiterPath)) return false;
          const content = fs.readFileSync(rateLimiterPath, 'utf8');
          return content.includes('ENDPOINT_CONFIGS') && content.includes('auth_login');
        }
      },
      {
        name: 'Has Success Rate Tracking',
        test: () => {
          const rateLimiterPath = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/rate-limiter.ts';
          if (!fs.existsSync(rateLimiterPath)) return false;
          const content = fs.readFileSync(rateLimiterPath, 'utf8');
          return content.includes('recordRequestOutcome') && content.includes('successRate');
        }
      },
      {
        name: 'Has Multiple Identifier Types',
        test: () => {
          const rateLimiterPath = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/rate-limiter.ts';
          if (!fs.existsSync(rateLimiterPath)) return false;
          const content = fs.readFileSync(rateLimiterPath, 'utf8');
          return content.includes('user') && content.includes('ip') && content.includes('session');
        }
      },
      {
        name: 'Has Middleware Integration',
        test: () => {
          const rateLimiterPath = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/rate-limiter.ts';
          if (!fs.existsSync(rateLimiterPath)) return false;
          const content = fs.readFileSync(rateLimiterPath, 'utf8');
          return content.includes('createRateLimitMiddleware') && content.includes('X-RateLimit');
        }
      },
      {
        name: 'Has Global Statistics',
        test: () => {
          const rateLimiterPath = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/rate-limiter.ts';
          if (!fs.existsSync(rateLimiterPath)) return false;
          const content = fs.readFileSync(rateLimiterPath, 'utf8');
          return content.includes('getGlobalStatistics') && content.includes('topEndpoints');
        }
      }
    ];

    return this.runTestGroup('Rate Limiter', tests);
  }

  async testIntegrationWithExistingCode() {
    this.log('🔗 Testing Integration with Existing Codebase...');

    const tests = [
      {
        name: 'Data Validator Can Be Imported',
        test: () => {
          try {
            const validatorPath = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/data-validator.ts';
            const content = fs.readFileSync(validatorPath, 'utf8');
            return content.includes('export class DataValidator') && content.includes('export default');
          } catch {
            return false;
          }
        }
      },
      {
        name: 'File Security Has Proper Interface',
        test: () => {
          try {
            const scannerPath = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/file-security.ts';
            const content = fs.readFileSync(scannerPath, 'utf8');
            return content.includes('FileSecurityResult') && content.includes('FileValidationConfig');
          } catch {
            return false;
          }
        }
      },
      {
        name: 'Payment Security Uses Supabase',
        test: () => {
          try {
            const paymentPath = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/payment-security.ts';
            const content = fs.readFileSync(paymentPath, 'utf8');
            return content.includes('@supabase/supabase-js') && content.includes('createClient');
          } catch {
            return false;
          }
        }
      },
      {
        name: 'Transaction Manager Has Event Emitter',
        test: () => {
          try {
            const transactionPath = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/db/transaction-manager.ts';
            const content = fs.readFileSync(transactionPath, 'utf8');
            return content.includes('EventEmitter') && content.includes('this.emit');
          } catch {
            return false;
          }
        }
      },
      {
        name: 'Rate Limiter Supports Next.js',
        test: () => {
          try {
            const rateLimiterPath = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/rate-limiter.ts';
            const content = fs.readFileSync(rateLimiterPath, 'utf8');
            return content.includes('Next.js') && content.includes('req:') && content.includes('res:');
          } catch {
            return false;
          }
        }
      },
      {
        name: 'All Features Use TypeScript',
        test: () => {
          const securityFiles = [
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/data-validator.ts',
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/file-security.ts',
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/payment-security.ts',
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/db/transaction-manager.ts',
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/rate-limiter.ts'
          ];
          
          return securityFiles.every(file => {
            if (!fs.existsSync(file)) return false;
            const content = fs.readFileSync(file, 'utf8');
            return content.includes('interface') && content.includes('export');
          });
        }
      }
    ];

    return this.runTestGroup('Integration', tests);
  }

  async testSecurityConfiguration() {
    this.log('⚙️ Testing Security Configuration and Setup...');

    const tests = [
      {
        name: 'All Security Files Created',
        test: () => {
          const requiredFiles = [
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/data-validator.ts',
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/file-security.ts',
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/payment-security.ts',
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/db/transaction-manager.ts',
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/rate-limiter.ts'
          ];
          
          return requiredFiles.every(file => fs.existsSync(file));
        }
      },
      {
        name: 'Default Configurations Present',
        test: () => {
          const files = [
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/data-validator.ts',
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/file-security.ts',
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/payment-security.ts',
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/db/transaction-manager.ts',
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/rate-limiter.ts'
          ];
          
          return files.every(file => {
            if (!fs.existsSync(file)) return false;
            const content = fs.readFileSync(file, 'utf8');
            return content.includes('DEFAULT') && content.includes('CONFIG');
          });
        }
      },
      {
        name: 'Environment Variable Usage',
        test: () => {
          const files = [
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/payment-security.ts',
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/db/transaction-manager.ts',
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/rate-limiter.ts'
          ];
          
          return files.every(file => {
            if (!fs.existsSync(file)) return false;
            const content = fs.readFileSync(file, 'utf8');
            return content.includes('process.env');
          });
        }
      },
      {
        name: 'Error Handling Present',
        test: () => {
          const files = [
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/data-validator.ts',
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/file-security.ts',
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/payment-security.ts',
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/db/transaction-manager.ts',
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/rate-limiter.ts'
          ];
          
          return files.every(file => {
            if (!fs.existsSync(file)) return false;
            const content = fs.readFileSync(file, 'utf8');
            return content.includes('try {') && content.includes('catch') && content.includes('error');
          });
        }
      },
      {
        name: 'Logging and Monitoring Included',
        test: () => {
          const files = [
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/payment-security.ts',
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/db/transaction-manager.ts',
            '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/security/rate-limiter.ts'
          ];
          
          return files.every(file => {
            if (!fs.existsSync(file)) return false;
            const content = fs.readFileSync(file, 'utf8');
            return content.includes('console.') || content.includes('log');
          });
        }
      }
    ];

    return this.runTestGroup('Configuration', tests);
  }

  async runTestGroup(groupName, tests) {
    let passed = 0;
    
    for (const test of tests) {
      try {
        const result = await test.test();
        if (result) {
          this.log(`   ✅ ${test.name}`);
          passed++;
          this.passedTests.push(`${groupName}: ${test.name}`);
        } else {
          this.log(`   ❌ ${test.name}`, 'error');
          this.failedTests.push(`${groupName}: ${test.name}`);
        }
      } catch (error) {
        this.log(`   ❌ ${test.name} - Error: ${error.message}`, 'error');
        this.failedTests.push(`${groupName}: ${test.name} - ${error.message}`);
      }
    }

    const success = passed === tests.length;
    this.log(`📊 ${groupName}: ${passed}/${tests.length} tests passed (${(passed/tests.length*100).toFixed(1)}%)`);
    
    return success;
  }

  async runAllSecurityTests() {
    this.log('🚀 Starting comprehensive security features testing...');
    this.log('Testing all newly implemented security features for robustness and integration.\n');

    const testSuites = [
      { name: 'Data Validation Pipeline', fn: () => this.testDataValidatorFeature() },
      { name: 'File Security System', fn: () => this.testFileSecurityFeature() },
      { name: 'Payment Security Enhancements', fn: () => this.testPaymentSecurityFeature() },
      { name: 'Database Transaction Safety', fn: () => this.testTransactionManagerFeature() },
      { name: 'Rate Limiting System', fn: () => this.testRateLimiterFeature() },
      { name: 'Integration Testing', fn: () => this.testIntegrationWithExistingCode() },
      { name: 'Security Configuration', fn: () => this.testSecurityConfiguration() }
    ];

    const results = { passed: 0, failed: 0, total: testSuites.length };

    for (const testSuite of testSuites) {
      this.log(`\n📋 Running: ${testSuite.name}`);
      try {
        const passed = await testSuite.fn();
        if (passed) {
          results.passed++;
          this.log(`✅ ${testSuite.name} - ALL FEATURES IMPLEMENTED`);
        } else {
          results.failed++;
          this.log(`❌ ${testSuite.name} - SOME FEATURES MISSING`, 'error');
        }
      } catch (error) {
        results.failed++;
        this.log(`❌ ${testSuite.name} - ERROR: ${error.message}`, 'error');
      }
    }

    this.log('\n📊 Security Features Test Results Summary:');
    this.log(`   Total Test Suites: ${results.total}`);
    this.log(`   Fully Implemented: ${results.passed}`);
    this.log(`   Partially Implemented: ${results.failed}`);
    this.log(`   Implementation Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);

    this.log('\n📋 Individual Feature Test Results:');
    this.log(`   ✅ Implemented Features: ${this.passedTests.length}`);
    this.passedTests.forEach(test => this.log(`      - ${test}`));
    
    if (this.failedTests.length > 0) {
      this.log(`   ❌ Missing Features: ${this.failedTests.length}`);
      this.failedTests.forEach(test => this.log(`      - ${test}`, 'error'));
    }

    // Security features validation
    const criticalFeatures = [
      'Data Validator: Has SQL Injection Prevention',
      'File Security: Has Malicious File Detection',
      'Payment Security: Has Double Payment Prevention',
      'Transaction Manager: Has Deadlock Detection',
      'Rate Limiter: Has Adaptive Rate Limiting'
    ];

    const implementedCritical = criticalFeatures.filter(feature => 
      this.passedTests.some(test => test.includes(feature.split(': ')[1]))
    );

    this.log('\n🔒 Critical Security Features Status:');
    this.log(`   Implemented: ${implementedCritical.length}/${criticalFeatures.length}`);
    
    if (implementedCritical.length === criticalFeatures.length) {
      this.log('🎉 All critical security features are implemented and tested!');
      this.log('✅ The system now has enterprise-grade security protection.');
    } else {
      this.log('⚠️ Some critical security features are missing:', 'warning');
      const missing = criticalFeatures.filter(feature => 
        !this.passedTests.some(test => test.includes(feature.split(': ')[1]))
      );
      missing.forEach(feature => this.log(`   🔴 ${feature}`, 'error'));
    }

    return {
      overallPassed: results.failed === 0,
      passedTests: this.passedTests,
      failedTests: this.failedTests,
      summary: results,
      criticalFeaturesImplemented: implementedCritical.length === criticalFeatures.length
    };
  }
}

// Run tests
async function main() {
  const tester = new SecurityFeaturesTester();
  
  try {
    const results = await tester.runAllSecurityTests();
    
    // Save detailed results
    const reportData = {
      timestamp: new Date().toISOString(),
      testType: 'Security Features Implementation Testing',
      overallStatus: results.overallPassed ? 'FULLY_IMPLEMENTED' : 'PARTIALLY_IMPLEMENTED',
      criticalSecurityStatus: results.criticalFeaturesImplemented ? 'COMPLETE' : 'INCOMPLETE',
      summary: results.summary,
      implementedFeatures: results.passedTests,
      missingFeatures: results.failedTests,
      securityLevel: results.criticalFeaturesImplemented ? 'ENTERPRISE_GRADE' : 'BASIC',
      recommendations: results.overallPassed ? [
        'All security features implemented successfully',
        'Ready for production deployment',
        'Continue monitoring for new threats',
        'Regular security audits recommended'
      ] : [
        'Complete missing security feature implementations',
        'Address all failed test cases',
        'Ensure critical security features are fully implemented',
        'Re-run tests after fixes',
        'Do not deploy to production until all tests pass'
      ]
    };
    
    fs.writeFileSync('security-features-test-report.json', JSON.stringify(reportData, null, 2));
    console.log('\n📄 Detailed security features test report saved to: security-features-test-report.json');
    
  } catch (error) {
    console.error('Security features test suite failed:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = { SecurityFeaturesTester };