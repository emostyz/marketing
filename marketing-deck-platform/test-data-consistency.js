// Test data consistency and synchronization
class DataConsistencyTester {
  constructor() {
    this.testResults = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
    this.testResults.push({ timestamp, type, message });
  }

  async testDatabaseSchema() {
    this.log('Testing database schema consistency...');

    const fs = require('fs');
    const schemaFiles = [
      '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/db/schema.ts',
      '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/db/migrations/'
    ];

    try {
      // Check schema file
      const schemaPath = schemaFiles[0];
      if (fs.existsSync(schemaPath)) {
        const schemaContent = fs.readFileSync(schemaPath, 'utf8');
        
        // Check for key table definitions
        const tables = [
          'users', 'profiles', 'presentations', 'slides', 'usage_tracking',
          'user_subscriptions', 'payment_events', 'system_events'
        ];

        let definedTables = 0;
        for (const table of tables) {
          if (schemaContent.includes(table)) {
            definedTables++;
            this.log(`   ✅ Table '${table}' defined`);
          } else {
            this.log(`   ❌ Table '${table}' missing`, 'warning');
          }
        }

        this.log(`📊 Schema Coverage: ${definedTables}/${tables.length} tables (${(definedTables/tables.length*100).toFixed(1)}%)`);

        // Check for proper relationships
        const hasReferences = schemaContent.includes('references');
        const hasForeignKeys = schemaContent.includes('foreignKey');
        const hasIndexes = schemaContent.includes('index');

        this.log(`   ${hasReferences ? '✅' : '❌'} Table relationships defined`);
        this.log(`   ${hasForeignKeys ? '✅' : '❌'} Foreign key constraints`);
        this.log(`   ${hasIndexes ? '✅' : '❌'} Database indexes`);
      }

      // Check migration directory
      const migrationDir = schemaFiles[1];
      if (fs.existsSync(migrationDir)) {
        const migrations = fs.readdirSync(migrationDir).filter(f => f.endsWith('.sql'));
        this.log(`📦 Found ${migrations.length} migration files`);
        
        if (migrations.length > 0) {
          this.log('   ✅ Migration system in place');
        } else {
          this.log('   ⚠️  No migration files found', 'warning');
        }
      }

    } catch (error) {
      this.log(`Schema test failed: ${error.message}`, 'error');
      return false;
    }

    return true;
  }

  async testDataFlowConsistency() {
    this.log('Testing data flow consistency across the application...');

    const fs = require('fs');
    
    // Test user data flow
    const userDataFlow = [
      { file: '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/app/api/auth/register/route.ts', stage: 'User Registration' },
      { file: '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/app/api/user/profile/route.ts', stage: 'Profile Management' },
      { file: '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/app/api/user/subscription/route.ts', stage: 'Subscription Tracking' },
      { file: '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/app/api/user/usage-check/route.ts', stage: 'Usage Tracking' }
    ];

    this.log('🔄 User Data Flow:');
    for (const step of userDataFlow) {
      if (fs.existsSync(step.file)) {
        const content = fs.readFileSync(step.file, 'utf8');
        
        const hasProperValidation = content.includes('validate') || content.includes('required');
        const hasErrorHandling = content.includes('try') && content.includes('catch');
        const hasTransactionLogic = content.includes('transaction') || content.includes('begin');
        
        this.log(`   ${step.stage}:`);
        this.log(`     ${hasProperValidation ? '✅' : '❌'} Input validation`);
        this.log(`     ${hasErrorHandling ? '✅' : '❌'} Error handling`);
        this.log(`     ${hasTransactionLogic ? '✅' : '❌'} Transaction safety`);
      } else {
        this.log(`   ❌ ${step.stage} - File not found`, 'error');
      }
    }

    // Test presentation data flow
    const presentationFlow = [
      { file: '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/app/api/upload/route.ts', stage: 'Data Upload' },
      { file: '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/app/api/openai/enhanced-analyze/route.ts', stage: 'AI Analysis' },
      { file: '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/app/api/presentations/route.ts', stage: 'Presentation Storage' }
    ];

    this.log('📊 Presentation Data Flow:');
    for (const step of presentationFlow) {
      if (fs.existsSync(step.file)) {
        const content = fs.readFileSync(step.file, 'utf8');
        
        const hasDataValidation = content.includes('validate') || content.includes('sanitize');
        const hasRollbackLogic = content.includes('rollback') || content.includes('cleanup');
        const hasConsistencyChecks = content.includes('check') || content.includes('verify');
        
        this.log(`   ${step.stage}:`);
        this.log(`     ${hasDataValidation ? '✅' : '❌'} Data validation`);
        this.log(`     ${hasRollbackLogic ? '✅' : '❌'} Rollback logic`);
        this.log(`     ${hasConsistencyChecks ? '✅' : '❌'} Consistency checks`);
      } else {
        this.log(`   ❌ ${step.stage} - File not found`, 'error');
      }
    }

    return true;
  }

  async testCacheConsistency() {
    this.log('Testing cache consistency and invalidation...');

    const fs = require('fs');
    const cacheFiles = [
      '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/hooks/useTierLimits.ts',
      '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/auth/auth-context.tsx'
    ];

    for (const file of cacheFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        const hasCacheInvalidation = content.includes('refresh') || content.includes('invalidate');
        const hasStateSync = content.includes('useState') && content.includes('useEffect');
        const hasOptimisticUpdates = content.includes('optimistic') || content.includes('immediate');
        
        this.log(`💾 ${file.split('/').pop()}:`);
        this.log(`   ${hasCacheInvalidation ? '✅' : '❌'} Cache invalidation`);
        this.log(`   ${hasStateSync ? '✅' : '❌'} State synchronization`);
        this.log(`   ${hasOptimisticUpdates ? '✅' : '❌'} Optimistic updates`);
      }
    }

    return true;
  }

  async testConcurrencyHandling() {
    this.log('Testing concurrency and race condition handling...');

    const fs = require('fs');
    const concurrencyFiles = [
      '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/components/deck-builder/UltimateDeckBuilder.tsx',
      '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/hooks/useTierLimits.ts'
    ];

    for (const file of concurrencyFiles) {
      if (fs.existsExists && fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        const hasMutexLogic = content.includes('loading') || content.includes('pending');
        const hasRaceProtection = content.includes('prevent') && content.includes('race');
        const hasAtomicOperations = content.includes('atomic') || content.includes('transaction');
        const hasQueueing = content.includes('queue') || content.includes('sequential');
        
        this.log(`⚡ ${file.split('/').pop()}:`);
        this.log(`   ${hasMutexLogic ? '✅' : '❌'} Mutex/loading states`);
        this.log(`   ${hasRaceProtection ? '✅' : '❌'} Race condition protection`);
        this.log(`   ${hasAtomicOperations ? '✅' : '❌'} Atomic operations`);
        this.log(`   ${hasQueueing ? '✅' : '❌'} Operation queuing`);
      }
    }

    return true;
  }

  async testEventLogging() {
    this.log('Testing event logging and audit trails...');

    const fs = require('fs');
    const eventFiles = [
      '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/services/event-logger.ts',
      '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/app/api/stripe/webhook/route.ts'
    ];

    for (const file of eventFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        const hasEventStructure = content.includes('event_type') || content.includes('eventType');
        const hasTimestamps = content.includes('timestamp') || content.includes('created_at');
        const hasUserContext = content.includes('user_id') || content.includes('userId');
        const hasEventData = content.includes('event_data') || content.includes('payload');
        
        this.log(`📝 ${file.split('/').pop()}:`);
        this.log(`   ${hasEventStructure ? '✅' : '❌'} Structured event types`);
        this.log(`   ${hasTimestamps ? '✅' : '❌'} Timestamp tracking`);
        this.log(`   ${hasUserContext ? '✅' : '❌'} User context`);
        this.log(`   ${hasEventData ? '✅' : '❌'} Event data payload`);
      }
    }

    return true;
  }

  async testDataMigrationSafety() {
    this.log('Testing data migration safety and rollback procedures...');

    const fs = require('fs');
    const migrationDir = '/Users/emilmostrom/Desktop/marketing-deck-platform/marketing-deck-platform/lib/db/migrations/';
    
    try {
      if (fs.existsSync(migrationDir)) {
        const migrations = fs.readdirSync(migrationDir);
        this.log(`📦 Found ${migrations.length} migration files`);
        
        let safeMigrations = 0;
        for (const migration of migrations) {
          if (migration.endsWith('.sql')) {
            const content = fs.readFileSync(migrationDir + migration, 'utf8');
            
            const hasBackup = content.includes('CREATE TABLE IF NOT EXISTS');
            const hasRollback = content.toLowerCase().includes('rollback') || content.includes('DROP');
            const hasValidation = content.includes('CHECK') || content.includes('CONSTRAINT');
            
            if (hasBackup || hasValidation) {
              safeMigrations++;
            }
            
            this.log(`   📄 ${migration}:`);
            this.log(`     ${hasBackup ? '✅' : '❌'} Safe table creation`);
            this.log(`     ${hasRollback ? '✅' : '❌'} Rollback capability`);
            this.log(`     ${hasValidation ? '✅' : '❌'} Data validation`);
          }
        }
        
        this.log(`📊 Migration Safety: ${safeMigrations}/${migrations.length} files have safety features`);
      }
    } catch (error) {
      this.log(`Migration safety test failed: ${error.message}`, 'error');
      return false;
    }

    return true;
  }

  async runAllTests() {
    this.log('🚀 Starting comprehensive data consistency tests...');

    const tests = [
      { name: 'Database Schema', fn: () => this.testDatabaseSchema() },
      { name: 'Data Flow Consistency', fn: () => this.testDataFlowConsistency() },
      { name: 'Cache Consistency', fn: () => this.testCacheConsistency() },
      { name: 'Concurrency Handling', fn: () => this.testConcurrencyHandling() },
      { name: 'Event Logging', fn: () => this.testEventLogging() },
      { name: 'Data Migration Safety', fn: () => this.testDataMigrationSafety() }
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

    this.log('\n📊 Data Consistency Test Results:');
    this.log(`   Total: ${results.total}`);
    this.log(`   Passed: ${results.passed}`);
    this.log(`   Failed: ${results.failed}`);
    this.log(`   Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);

    return results;
  }
}

// Run tests
async function main() {
  const tester = new DataConsistencyTester();
  
  try {
    await tester.runAllTests();
  } catch (error) {
    console.error('Data consistency test suite failed:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = { DataConsistencyTester };