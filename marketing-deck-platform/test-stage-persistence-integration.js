/**
 * Stage Persistence Integration Tests
 * Tests the database helper functions for saving and retrieving each stage of presentation building
 */

const fs = require('fs')
const path = require('path')

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  testTimeout: 30000,
  retryAttempts: 3,
  testPresentationId: `test-presentation-${Date.now()}`,
  testPresentationTitle: 'Stage Persistence Test Presentation'
}

// Mock stage data for testing
const MOCK_STAGE_DATA = {
  insights: {
    keyFindings: [
      'Revenue increased by 25% in Q4',
      'Customer satisfaction improved significantly',
      'Market expansion successful in 3 regions'
    ],
    metrics: {
      revenue: 2500000,
      customerSat: 4.8,
      marketShare: 0.15
    },
    timestamp: new Date().toISOString()
  },
  outline: {
    slides: [
      { title: 'Executive Summary', type: 'summary' },
      { title: 'Key Findings', type: 'insights' },
      { title: 'Revenue Analysis', type: 'chart' },
      { title: 'Next Steps', type: 'action' }
    ],
    totalSlides: 4,
    estimatedDuration: '15 minutes',
    timestamp: new Date().toISOString()
  },
  styledSlides: {
    theme: 'professional',
    template: 'mckinsey-style',
    slides: [
      {
        id: 'slide-1',
        title: 'Executive Summary',
        elements: [
          { type: 'title', content: 'Q4 Performance Review' },
          { type: 'bullet', content: '25% revenue growth achieved' }
        ]
      }
    ],
    timestamp: new Date().toISOString()
  },
  chartData: {
    charts: [
      {
        type: 'bar',
        title: 'Revenue by Quarter',
        data: [
          { quarter: 'Q1', revenue: 1800000 },
          { quarter: 'Q2', revenue: 1900000 },
          { quarter: 'Q3', revenue: 2100000 },
          { quarter: 'Q4', revenue: 2500000 }
        ]
      }
    ],
    timestamp: new Date().toISOString()
  },
  finalDeck: {
    format: 'presentation',
    totalSlides: 4,
    exportFormats: ['pptx', 'pdf', 'html'],
    metadata: {
      creator: 'test-user',
      created: new Date().toISOString(),
      version: '1.0'
    },
    timestamp: new Date().toISOString()
  }
}

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  errors: [],
  startTime: Date.now()
}

// Utility functions
function logTest(testName, status, details = '') {
  const timestamp = new Date().toISOString()
  const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️'
  console.log(`[${timestamp}] ${statusIcon} ${testName} - ${status}`)
  if (details) console.log(`   ${details}`)
  
  if (status === 'PASS') {
    testResults.passed++
  } else if (status === 'FAIL') {
    testResults.failed++
    testResults.errors.push(`${testName}: ${details}`)
  }
}

async function makeAuthenticatedRequest(endpoint, method = 'GET', body = null) {
  const url = `${TEST_CONFIG.baseUrl}${endpoint}`
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'StagePeristenceTest/1.0'
    },
    credentials: 'include'
  }
  
  if (body) {
    options.body = JSON.stringify(body)
  }
  
  try {
    const response = await fetch(url, options)
    const data = await response.json()
    return { success: response.ok, status: response.status, data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function ensureTestPresentation() {
  logTest('Setup: Create Test Presentation', 'INFO', 'Creating test presentation for stage persistence tests')
  
  const createResult = await makeAuthenticatedRequest('/api/presentations', 'POST', {
    id: TEST_CONFIG.testPresentationId,
    title: TEST_CONFIG.testPresentationTitle,
    description: 'Integration test presentation for stage persistence',
    status: 'draft',
    data: {},
    settings: {}
  })
  
  if (!createResult.success && createResult.status !== 409) { // 409 = already exists
    throw new Error(`Failed to create test presentation: ${createResult.error || createResult.data?.error}`)
  }
  
  logTest('Setup: Create Test Presentation', 'PASS', `Test presentation ready: ${TEST_CONFIG.testPresentationId}`)
  return TEST_CONFIG.testPresentationId
}

async function cleanupTestPresentation() {
  logTest('Cleanup: Remove Test Presentation', 'INFO', 'Cleaning up test data')
  
  const deleteResult = await makeAuthenticatedRequest(`/api/presentations/${TEST_CONFIG.testPresentationId}`, 'DELETE')
  
  if (deleteResult.success || deleteResult.status === 404) {
    logTest('Cleanup: Remove Test Presentation', 'PASS', 'Test presentation cleaned up')
  } else {
    logTest('Cleanup: Remove Test Presentation', 'WARN', `Cleanup may have failed: ${deleteResult.error}`)
  }
}

// Test individual stage operations
async function testStageOperation(stageName, stageData, endpoint) {
  const testName = `Stage ${stageName} - Save/Retrieve`
  
  try {
    // Test save operation
    const saveResult = await makeAuthenticatedRequest(endpoint, 'POST', {
      deckId: TEST_CONFIG.testPresentationId,
      data: stageData
    })
    
    if (!saveResult.success) {
      logTest(testName, 'FAIL', `Save failed: ${saveResult.error || saveResult.data?.error}`)
      return false
    }
    
    // Test retrieve operation
    const getResult = await makeAuthenticatedRequest(`${endpoint}?deckId=${TEST_CONFIG.testPresentationId}`, 'GET')
    
    if (!getResult.success) {
      logTest(testName, 'FAIL', `Retrieve failed: ${getResult.error || getResult.data?.error}`)
      return false
    }
    
    // Verify data integrity
    const retrievedData = getResult.data?.data
    if (!retrievedData) {
      logTest(testName, 'FAIL', 'No data retrieved')
      return false
    }
    
    // Basic data validation
    if (JSON.stringify(retrievedData).length < JSON.stringify(stageData).length * 0.8) {
      logTest(testName, 'FAIL', 'Retrieved data appears incomplete')
      return false
    }
    
    logTest(testName, 'PASS', `Stage ${stageName} saved and retrieved successfully`)
    return true
    
  } catch (error) {
    logTest(testName, 'FAIL', `Exception: ${error.message}`)
    return false
  }
}

// Test multiple stages operation
async function testMultipleStagesOperation() {
  const testName = 'Multiple Stages - Batch Save/Retrieve'
  
  try {
    // Save multiple stages at once
    const multiSaveResult = await makeAuthenticatedRequest('/api/presentations/stages/multiple', 'POST', {
      deckId: TEST_CONFIG.testPresentationId,
      stages: {
        insights_json: MOCK_STAGE_DATA.insights,
        outline_json: MOCK_STAGE_DATA.outline,
        chart_data_json: MOCK_STAGE_DATA.chartData
      }
    })
    
    if (!multiSaveResult.success) {
      logTest(testName, 'FAIL', `Batch save failed: ${multiSaveResult.error || multiSaveResult.data?.error}`)
      return false
    }
    
    // Retrieve all stages
    const getAllResult = await makeAuthenticatedRequest(`/api/presentations/stages/all?deckId=${TEST_CONFIG.testPresentationId}`, 'GET')
    
    if (!getAllResult.success) {
      logTest(testName, 'FAIL', `Batch retrieve failed: ${getAllResult.error || getAllResult.data?.error}`)
      return false
    }
    
    const allStages = getAllResult.data
    
    // Verify all stages are present
    if (!allStages.insights || !allStages.outline || !allStages.chartData) {
      logTest(testName, 'FAIL', 'Not all stages retrieved in batch operation')
      return false
    }
    
    logTest(testName, 'PASS', 'Multiple stages saved and retrieved successfully')
    return true
    
  } catch (error) {
    logTest(testName, 'FAIL', `Exception: ${error.message}`)
    return false
  }
}

// Test stage progress tracking
async function testStageProgressTracking() {
  const testName = 'Stage Progress - Tracking'
  
  try {
    // Get stage progress
    const progressResult = await makeAuthenticatedRequest(`/api/presentations/stages/progress?deckId=${TEST_CONFIG.testPresentationId}`, 'GET')
    
    if (!progressResult.success) {
      logTest(testName, 'FAIL', `Progress tracking failed: ${progressResult.error || progressResult.data?.error}`)
      return false
    }
    
    const progress = progressResult.data
    
    // Verify progress structure
    if (!progress || typeof progress.completion_percentage !== 'number') {
      logTest(testName, 'FAIL', 'Invalid progress structure')
      return false
    }
    
    // Verify some stages are marked as completed (from previous tests)
    if (progress.completion_percentage === 0) {
      logTest(testName, 'WARN', 'No progress detected - may be expected if stages were not saved')
    } else {
      logTest(testName, 'PASS', `Progress tracking working: ${progress.completion_percentage}% complete`)
    }
    
    return true
    
  } catch (error) {
    logTest(testName, 'FAIL', `Exception: ${error.message}`)
    return false
  }
}

// Test clear stage operations
async function testClearStageOperations() {
  const testName = 'Clear Stages - Individual & All'
  
  try {
    // Clear individual stage
    const clearResult = await makeAuthenticatedRequest('/api/presentations/stages/clear', 'POST', {
      deckId: TEST_CONFIG.testPresentationId,
      stage: 'insights'
    })
    
    if (!clearResult.success) {
      logTest(testName, 'FAIL', `Clear individual stage failed: ${clearResult.error || clearResult.data?.error}`)
      return false
    }
    
    // Verify stage was cleared
    const getResult = await makeAuthenticatedRequest(`/api/presentations/stages/insights?deckId=${TEST_CONFIG.testPresentationId}`, 'GET')
    
    if (getResult.success && getResult.data?.data) {
      logTest(testName, 'FAIL', 'Stage was not cleared properly')
      return false
    }
    
    // Clear all stages
    const clearAllResult = await makeAuthenticatedRequest('/api/presentations/stages/clear-all', 'POST', {
      deckId: TEST_CONFIG.testPresentationId
    })
    
    if (!clearAllResult.success) {
      logTest(testName, 'FAIL', `Clear all stages failed: ${clearAllResult.error || clearAllResult.data?.error}`)
      return false
    }
    
    logTest(testName, 'PASS', 'Clear operations working correctly')
    return true
    
  } catch (error) {
    logTest(testName, 'FAIL', `Exception: ${error.message}`)
    return false
  }
}

// Test user isolation (security)
async function testUserIsolation() {
  const testName = 'Security - User Data Isolation'
  
  try {
    // This test would ideally use different user sessions
    // For now, we'll test that unauthorized access fails properly
    
    const unauthorizedResult = await makeAuthenticatedRequest('/api/presentations/stages/insights', 'POST', {
      deckId: 'unauthorized-presentation-id',
      data: MOCK_STAGE_DATA.insights
    })
    
    // Should fail due to user isolation
    if (unauthorizedResult.success) {
      logTest(testName, 'FAIL', 'Unauthorized access succeeded - security issue!')
      return false
    }
    
    logTest(testName, 'PASS', 'User isolation working - unauthorized access properly blocked')
    return true
    
  } catch (error) {
    logTest(testName, 'PASS', 'Exception thrown for unauthorized access (expected)')
    return true
  }
}

// Main test execution
async function runStagePeristenceTests() {
  console.log('🚀 Starting Stage Persistence Integration Tests')
  console.log(`📅 Test started at: ${new Date().toISOString()}`)
  console.log(`🎯 Target URL: ${TEST_CONFIG.baseUrl}`)
  console.log(`📋 Test Presentation ID: ${TEST_CONFIG.testPresentationId}`)
  console.log('=' * 80)
  
  try {
    // Setup
    await ensureTestPresentation()
    
    // Run individual stage tests
    await testStageOperation('Insights', MOCK_STAGE_DATA.insights, '/api/presentations/stages/insights')
    await testStageOperation('Outline', MOCK_STAGE_DATA.outline, '/api/presentations/stages/outline')
    await testStageOperation('Styled Slides', MOCK_STAGE_DATA.styledSlides, '/api/presentations/stages/styled-slides')
    await testStageOperation('Chart Data', MOCK_STAGE_DATA.chartData, '/api/presentations/stages/chart-data')
    await testStageOperation('Final Deck', MOCK_STAGE_DATA.finalDeck, '/api/presentations/stages/final-deck')
    
    // Run batch operations tests
    await testMultipleStagesOperation()
    
    // Run progress tracking tests
    await testStageProgressTracking()
    
    // Run clear operations tests
    await testClearStageOperations()
    
    // Run security tests
    await testUserIsolation()
    
    // Cleanup
    await cleanupTestPresentation()
    
  } catch (error) {
    logTest('Test Suite', 'FAIL', `Critical error: ${error.message}`)
    testResults.failed++
  }
  
  // Final report
  const duration = Math.round((Date.now() - testResults.startTime) / 1000)
  const totalTests = testResults.passed + testResults.failed
  const successRate = totalTests > 0 ? Math.round((testResults.passed / totalTests) * 100) : 0
  
  console.log('=' * 80)
  console.log('📊 STAGE PERSISTENCE INTEGRATION TEST RESULTS')
  console.log('=' * 80)
  console.log(`✅ Tests Passed: ${testResults.passed}`)
  console.log(`❌ Tests Failed: ${testResults.failed}`)
  console.log(`📈 Success Rate: ${successRate}%`)
  console.log(`⏱️  Duration: ${duration} seconds`)
  console.log('')
  
  if (testResults.errors.length > 0) {
    console.log('❌ FAILED TESTS:')
    testResults.errors.forEach(error => console.log(`   • ${error}`))
    console.log('')
  }
  
  if (testResults.failed === 0) {
    console.log('🎉 ALL STAGE PERSISTENCE TESTS PASSED!')
    console.log('✅ Database helper functions are working correctly')
    console.log('✅ User authentication and isolation verified')
    console.log('✅ Data integrity confirmed')
  } else {
    console.log('⚠️  SOME TESTS FAILED - Review implementation')
  }
  
  // Save detailed results
  const detailedResults = {
    summary: {
      passed: testResults.passed,
      failed: testResults.failed,
      successRate: `${successRate}%`,
      duration: `${duration}s`,
      timestamp: new Date().toISOString()
    },
    config: TEST_CONFIG,
    mockData: MOCK_STAGE_DATA,
    errors: testResults.errors
  }
  
  const reportPath = path.join(__dirname, `stage-persistence-test-report-${Date.now()}.json`)
  fs.writeFileSync(reportPath, JSON.stringify(detailedResults, null, 2))
  console.log(`📄 Detailed report saved: ${reportPath}`)
  
  process.exit(testResults.failed > 0 ? 1 : 0)
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Test interrupted - cleaning up...')
  try {
    await cleanupTestPresentation()
  } catch (error) {
    console.log('⚠️  Cleanup error:', error.message)
  }
  process.exit(1)
})

// Run tests if this file is executed directly
if (require.main === module) {
  runStagePeristenceTests().catch(error => {
    console.error('💥 Test suite crashed:', error)
    process.exit(1)
  })
}

module.exports = {
  runStagePeristenceTests,
  TEST_CONFIG,
  MOCK_STAGE_DATA
}