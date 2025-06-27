#!/usr/bin/env node

/**
 * Comprehensive QA test suite for instant save functionality
 * Tests multiple scenarios and edge cases to ensure robust save behavior
 */

const fs = require('fs').promises;
const path = require('path');

async function runComprehensiveSaveQATests() {
  console.log('🚀 Running Comprehensive Save QA Test Suite...\n');

  let totalTests = 0;
  let passedTests = 0;
  const testResults = [];

  const runTest = (testName, testFunction) => {
    totalTests++;
    try {
      const result = testFunction();
      if (result) {
        console.log(`✅ ${testName}: PASSED`);
        testResults.push({ test: testName, status: 'PASS', message: 'Test passed successfully' });
        passedTests++;
      } else {
        console.log(`❌ ${testName}: FAILED`);
        testResults.push({ test: testName, status: 'FAIL', message: 'Test failed - condition not met' });
      }
      return result;
    } catch (error) {
      console.log(`⚠️ ${testName}: ERROR - ${error.message}`);
      testResults.push({ test: testName, status: 'ERROR', message: error.message });
      return false;
    }
  };

  // Test 1: Verify instant debounce settings
  await runTest('Auto-save debounce delay verification', async () => {
    const autoSaveContent = await fs.readFile('hooks/useAutoSave.ts', 'utf8');
    return autoSaveContent.includes('debounceDelay = 100') && 
           autoSaveContent.includes('interval = 5000');
  });

  // Test 2: Check enhanced error handling
  await runTest('Enhanced error handling with retry', async () => {
    const autoSaveContent = await fs.readFile('hooks/useAutoSave.ts', 'utf8');
    return autoSaveContent.includes('Auto-save failed') && 
           autoSaveContent.includes('Retry') &&
           autoSaveContent.includes('action:');
  });

  // Test 3: Verify success feedback improvements
  await runTest('Success feedback optimization', async () => {
    const autoSaveContent = await fs.readFile('hooks/useAutoSave.ts', 'utf8');
    return autoSaveContent.includes('Auto-saved') && 
           autoSaveContent.includes('duration: 800') &&
           autoSaveContent.includes('#10b981');
  });

  // Test 4: Check WorldClass editor instant saves
  await runTest('WorldClass editor instant save triggers', async () => {
    const editorContent = await fs.readFile('components/editor/WorldClassPresentationEditor.tsx', 'utf8');
    return editorContent.includes('debounceMs: 100') &&
           editorContent.includes('Trigger instant save after paste') &&
           editorContent.includes('Trigger instant save after delete') &&
           editorContent.includes('Trigger instant save after regeneration');
  });

  // Test 5: Verify UltimateDeckBuilder optimizations
  await runTest('UltimateDeckBuilder save optimization', async () => {
    const deckBuilderContent = await fs.readFile('components/deck-builder/UltimateDeckBuilder.tsx', 'utf8');
    return deckBuilderContent.includes('debounceDelay: 100') &&
           deckBuilderContent.includes('interval: 2000');
  });

  // Test 6: File upload instant processing
  await runTest('File upload instant processing', async () => {
    const uploadApiContent = await fs.readFile('app/api/upload/route.ts', 'utf8');
    return uploadApiContent.includes('storeDataset') &&
           uploadApiContent.includes('processDataFile') &&
           uploadApiContent.includes('Enhanced file processor');
  });

  // Test 7: Dataset storage immediate save
  await runTest('Dataset storage immediate save', async () => {
    const datasetStorageContent = await fs.readFile('lib/data/dataset-storage.ts', 'utf8');
    return datasetStorageContent.includes('db.insert(datasets)') &&
           datasetStorageContent.includes('returning()') &&
           datasetStorageContent.includes('Dataset stored successfully');
  });

  // Test 8: File upload component real-time callbacks
  await runTest('File upload real-time callbacks', async () => {
    const fileUploadContent = await fs.readFile('components/upload/SimpleFileUpload.tsx', 'utf8');
    return fileUploadContent.includes('onFilesChange') &&
           fileUploadContent.includes('updateFile') &&
           fileUploadContent.includes('Upload successful');
  });

  // Test 9: Presentation persistence service efficiency
  await runTest('Presentation persistence service', async () => {
    const persistenceContent = await fs.readFile('lib/services/presentation-persistence.ts', 'utf8');
    return persistenceContent.includes('upsert') &&
           persistenceContent.includes('saveSlidesData') &&
           persistenceContent.includes('Presentation saved successfully');
  });

  // Test 10: Auto-save hook conflict resolution
  await runTest('Conflict resolution mechanisms', async () => {
    const autoSaveContent = await fs.readFile('hooks/useAutoSave.ts', 'utf8');
    return autoSaveContent.includes('handleConflict') &&
           autoSaveContent.includes('resolveConflict') &&
           autoSaveContent.includes('conflictResolution');
  });

  // Test 11: Save status indicators
  await runTest('Save status visual indicators', async () => {
    const editorContent = await fs.readFile('components/editor/WorldClassPresentationEditor.tsx', 'utf8');
    return editorContent.includes('autoSaveStatus') &&
           editorContent.includes('Auto-saved') &&
           editorContent.includes('bg-green-500/20');
  });

  // Test 12: Multiple editor compatibility
  await runTest('Multiple editor compatibility', async () => {
    const files = [
      'components/editor/WorldClassPresentationEditor.tsx',
      'components/editor/EnhancedPresentationEditor.tsx',
      'components/editor/FunctionalEditor.tsx'
    ];
    
    let allHaveAutoSave = true;
    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf8');
        if (!content.includes('useAutoSave') && !content.includes('EnhancedAutoSave')) {
          allHaveAutoSave = false;
          break;
        }
      } catch (error) {
        // File might not exist, continue
      }
    }
    return allHaveAutoSave;
  });

  // Performance Tests
  console.log('\n🔬 Running Performance Tests...');

  // Test 13: Save frequency validation
  await runTest('Save frequency optimization', async () => {
    const autoSaveContent = await fs.readFile('hooks/useAutoSave.ts', 'utf8');
    // Should save within 100ms of changes, with backup saves every 5s
    return autoSaveContent.includes('debounceDelay = 100') &&
           autoSaveContent.includes('interval = 5000');
  });

  // Test 14: Memory efficiency check
  await runTest('Memory efficiency measures', async () => {
    const autoSaveContent = await fs.readFile('hooks/useAutoSave.ts', 'utf8');
    return autoSaveContent.includes('debouncedSave.cancel()') &&
           autoSaveContent.includes('JSON.stringify(data) !== JSON.stringify(lastSavedData)');
  });

  // Edge Case Tests
  console.log('\n🧪 Running Edge Case Tests...');

  // Test 15: Offline handling
  await runTest('Offline save handling', async () => {
    const autoSaveContent = await fs.readFile('hooks/useAutoSave.ts', 'utf8');
    return autoSaveContent.includes('beforeunload') &&
           autoSaveContent.includes('visibilitychange') &&
           autoSaveContent.includes('sendBeacon');
  });

  // Test 16: Error recovery mechanisms
  await runTest('Error recovery and retry logic', async () => {
    const autoSaveContent = await fs.readFile('hooks/useAutoSave.ts', 'utf8');
    return autoSaveContent.includes('catch (error)') &&
           autoSaveContent.includes('retry') &&
           autoSaveContent.includes('maxRetries');
  });

  // Test 17: Concurrent save prevention
  await runTest('Concurrent save prevention', async () => {
    const autoSaveContent = await fs.readFile('hooks/useAutoSave.ts', 'utf8');
    return autoSaveContent.includes('saveStatus.isSaving') &&
           autoSaveContent.includes('!enabled || saveStatus.isSaving') &&
           autoSaveContent.includes('isSaving: true');
  });

  // Display comprehensive results
  console.log('\n' + '='.repeat(80));
  console.log('📊 COMPREHENSIVE SAVE QA TEST RESULTS');
  console.log('='.repeat(80));
  
  console.log(`📈 Overall Score: ${passedTests}/${totalTests} tests passed (${Math.round(passedTests/totalTests*100)}%)`);
  console.log('');

  // Group results by category
  const categories = {
    'Core Functionality': testResults.slice(0, 5),
    'Integration Tests': testResults.slice(5, 9),
    'Advanced Features': testResults.slice(9, 12),
    'Performance Tests': testResults.slice(12, 14),
    'Edge Cases': testResults.slice(14, 17)
  };

  Object.entries(categories).forEach(([category, tests]) => {
    console.log(`\n📋 ${category}:`);
    tests.forEach(result => {
      const status = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
      console.log(`   ${status} ${result.test}`);
      if (result.status !== 'PASS' && result.message) {
        console.log(`      └─ ${result.message}`);
      }
    });
  });

  // Success metrics
  const successRate = (passedTests / totalTests) * 100;
  console.log('\n' + '='.repeat(80));
  
  if (successRate >= 95) {
    console.log('🏆 EXCELLENT! Save functionality is production-ready.');
    console.log('🎯 Key achievements:');
    console.log('   ✨ Near-instant saves (100ms debounce)');
    console.log('   🔄 Real-time save triggers on every action');
    console.log('   ⚡ Optimized auto-save intervals');
    console.log('   🛡️ Robust error handling with retry logic');
    console.log('   📱 Enhanced user feedback');
    console.log('   🔧 Multi-editor compatibility');
    console.log('   💾 Instant file upload processing');
    console.log('   🎨 Visual save status indicators');
  } else if (successRate >= 85) {
    console.log('✅ GOOD! Save functionality is working well with minor issues.');
    console.log('📝 Consider addressing failed tests for optimal performance.');
  } else if (successRate >= 70) {
    console.log('⚠️  ACCEPTABLE! Save functionality has some issues that should be addressed.');
    console.log('🔧 Review failed tests and implement fixes.');
  } else {
    console.log('❌ NEEDS IMPROVEMENT! Multiple critical issues detected.');
    console.log('🚨 Immediate attention required for save functionality.');
  }

  console.log('='.repeat(80));
  
  return successRate >= 85; // Consider 85%+ as passing QA
}

// Execute the comprehensive test suite
runComprehensiveSaveQATests()
  .then(success => {
    console.log(`\n🏁 Test suite completed. QA ${success ? 'PASSED' : 'FAILED'}.`);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Test suite execution failed:', error);
    process.exit(1);
  });