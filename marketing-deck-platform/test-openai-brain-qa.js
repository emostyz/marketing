#!/usr/bin/env node

/**
 * QA Testing Script for OpenAI Brain and Slide Building Functionality
 * Tests the complete workflow from real data upload to slide generation
 */

const fs = require('fs');
const csv = require('csv-parser');

// Test configuration
const TEST_CONFIG = {
  BASE_URL: 'http://localhost:3000',
  TEST_DATA_FILE: './test-data.csv',
  ENHANCED_DATA_FILE: './sample_business_data.csv',
  ENDPOINTS: {
    UPLOAD: '/api/upload',
    ANALYZE: '/api/openai/enhanced-analyze',
    PRESENTATIONS: '/api/presentations',
    SESSION: '/api/presentations/session'
  }
};

// Test data scenarios
const TEST_SCENARIOS = [
  {
    name: 'Basic Revenue Analysis',
    context: {
      industry: 'Technology',
      businessContext: 'SaaS revenue growth analysis',
      description: 'Monthly revenue and customer data for strategic planning',
      dataQuality: 'excellent',
      factors: ['seasonal trends', 'product launches', 'market competition']
    },
    timeFrame: {
      start: '2024-01-01',
      end: '2024-06-01',
      dataFrequency: 'monthly',
      comparisons: ['yy', 'mm']
    },
    requirements: {
      slidesCount: 8,
      presentationDuration: 15,
      style: 'professional',
      focusAreas: ['revenue trends', 'customer growth', 'product performance']
    }
  },
  {
    name: 'Enterprise Customer Analysis', 
    context: {
      industry: 'Enterprise Software',
      businessContext: 'Customer acquisition and retention strategy',
      description: 'Customer lifecycle and revenue optimization data',
      dataQuality: 'good',
      factors: ['market expansion', 'competitive pressure', 'customer success initiatives']
    },
    timeFrame: {
      start: '2024-01-01',
      end: '2024-06-01',
      dataFrequency: 'monthly',
      comparisons: ['qq']
    },
    requirements: {
      slidesCount: 10,
      presentationDuration: 20,
      style: 'modern',
      focusAreas: ['customer acquisition cost', 'lifetime value', 'churn analysis']
    }
  }
];

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '📊',
    success: '✅', 
    error: '❌',
    warning: '⚠️',
    test: '🧪'
  }[type] || 'ℹ️';
  
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function createTestReport() {
  return {
    timestamp: new Date().toISOString(),
    tests: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0
    }
  };
}

function addTestResult(report, testName, status, details, data = null) {
  const result = {
    name: testName,
    status,
    details,
    timestamp: new Date().toISOString(),
    data
  };
  
  report.tests.push(result);
  report.summary.total++;
  report.summary[status]++;
  
  const statusIcon = {
    passed: '✅',
    failed: '❌', 
    skipped: '⚠️'
  }[status];
  
  log(`${statusIcon} ${testName}: ${details}`, status === 'passed' ? 'success' : status === 'failed' ? 'error' : 'warning');
  
  return result;
}

async function makeApiCall(endpoint, method = 'GET', data = null, headers = {}) {
  const url = `${TEST_CONFIG.BASE_URL}${endpoint}`;
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };
  
  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }
  
  log(`🔄 API Call: ${method} ${endpoint}`, 'info');
  
  try {
    const response = await fetch(url, options);
    const responseData = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      data: responseData,
      headers: Object.fromEntries(response.headers.entries())
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      error: error.message,
      data: null
    };
  }
}

async function loadCsvData(filePath) {
  return new Promise((resolve, reject) => {
    const data = [];
    
    if (!fs.existsSync(filePath)) {
      reject(new Error(`File not found: ${filePath}`));
      return;
    }
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => data.push(row))
      .on('end', () => {
        log(`📁 Loaded ${data.length} rows from ${filePath}`, 'success');
        resolve(data);
      })
      .on('error', reject);
  });
}

async function testDataUpload(report, testData) {
  log('🧪 Testing data upload functionality...', 'test');
  
  try {
    // Test 1: Validate test data exists and is properly formatted
    if (!testData || testData.length === 0) {
      addTestResult(report, 'Data Upload - Data Validation', 'failed', 'No test data available');
      return false;
    }
    
    // Check data structure
    const firstRow = testData[0];
    const requiredFields = ['Date', 'Revenue', 'Customers'];
    const hasRequiredFields = requiredFields.every(field => field in firstRow);
    
    if (!hasRequiredFields) {
      addTestResult(report, 'Data Upload - Data Structure', 'failed', 
        `Missing required fields. Expected: ${requiredFields.join(', ')}, Found: ${Object.keys(firstRow).join(', ')}`);
      return false;
    }
    
    addTestResult(report, 'Data Upload - Data Structure', 'passed', 
      `Data structure valid with ${testData.length} rows and fields: ${Object.keys(firstRow).join(', ')}`);
    
    // Test 2: Test upload API endpoint
    const uploadResponse = await makeApiCall(TEST_CONFIG.ENDPOINTS.UPLOAD, 'POST', {
      data: testData,
      metadata: {
        fileName: 'test-data.csv',
        fileType: 'csv',
        dataType: 'business_metrics'
      }
    });
    
    if (!uploadResponse.success) {
      addTestResult(report, 'Data Upload - API Response', 'failed', 
        `Upload failed with status ${uploadResponse.status}: ${uploadResponse.error || 'Unknown error'}`);
      return false;
    }
    
    addTestResult(report, 'Data Upload - API Response', 'passed', 
      `Upload successful with ${testData.length} rows processed`);
    
    return true;
    
  } catch (error) {
    addTestResult(report, 'Data Upload - Exception', 'failed', 
      `Upload test failed with exception: ${error.message}`);
    return false;
  }
}

async function testBrainAnalysis(report, testData, scenario) {
  log(`🧪 Testing OpenAI brain analysis for scenario: ${scenario.name}...`, 'test');
  
  try {
    // Test 1: Validate analysis input
    const analysisPayload = {
      data: testData,
      context: scenario.context,
      timeFrame: scenario.timeFrame,
      requirements: scenario.requirements,
      userFeedback: []
    };
    
    // Test 2: Call enhanced analysis endpoint
    const startTime = Date.now();
    const analysisResponse = await makeApiCall(TEST_CONFIG.ENDPOINTS.ANALYZE, 'POST', analysisPayload);
    const processingTime = Date.now() - startTime;
    
    if (!analysisResponse.success) {
      addTestResult(report, `Brain Analysis - ${scenario.name} - API Response`, 'failed', 
        `Analysis failed with status ${analysisResponse.status}: ${JSON.stringify(analysisResponse.data)}`);
      return null;
    }
    
    addTestResult(report, `Brain Analysis - ${scenario.name} - API Response`, 'passed', 
      `Analysis completed in ${processingTime}ms`);
    
    // Test 3: Validate analysis result structure
    const result = analysisResponse.data.result;
    if (!result) {
      addTestResult(report, `Brain Analysis - ${scenario.name} - Result Structure`, 'failed', 
        'No result data in response');
      return null;
    }
    
    // Validate required result fields
    const requiredFields = ['insights', 'narrative', 'slideStructure', 'metadata'];
    const missingFields = requiredFields.filter(field => !(field in result));
    
    if (missingFields.length > 0) {
      addTestResult(report, `Brain Analysis - ${scenario.name} - Result Structure`, 'failed', 
        `Missing required fields: ${missingFields.join(', ')}`);
      return null;
    }
    
    addTestResult(report, `Brain Analysis - ${scenario.name} - Result Structure`, 'passed', 
      `All required fields present: ${requiredFields.join(', ')}`);
    
    // Test 4: Validate insights quality
    const insights = result.insights || [];
    if (insights.length === 0) {
      addTestResult(report, `Brain Analysis - ${scenario.name} - Insights Quality`, 'failed', 
        'No insights generated');
      return null;
    }
    
    // Check insight structure
    const validInsights = insights.filter(insight => 
      insight.title && insight.description && typeof insight.confidence === 'number'
    );
    
    if (validInsights.length < insights.length * 0.8) {
      addTestResult(report, `Brain Analysis - ${scenario.name} - Insights Quality`, 'failed', 
        `${validInsights.length}/${insights.length} insights have valid structure`);
      return null;
    }
    
    addTestResult(report, `Brain Analysis - ${scenario.name} - Insights Quality`, 'passed', 
      `${validInsights.length} high-quality insights generated`);
    
    // Test 5: Validate slide structure
    const slideStructure = result.slideStructure || [];
    if (slideStructure.length < scenario.requirements.slidesCount * 0.8) {
      addTestResult(report, `Brain Analysis - ${scenario.name} - Slide Structure`, 'failed', 
        `Only ${slideStructure.length} slides generated, expected ${scenario.requirements.slidesCount}`);
      return null;
    }
    
    addTestResult(report, `Brain Analysis - ${scenario.name} - Slide Structure`, 'passed', 
      `${slideStructure.length} slides generated with proper structure`);
    
    // Test 6: Validate metadata quality
    const metadata = result.metadata || {};
    const confidenceScore = metadata.confidence || 0;
    const noveltyScore = metadata.noveltyScore || 0;
    
    if (confidenceScore < 70 || noveltyScore < 70) {
      addTestResult(report, `Brain Analysis - ${scenario.name} - Quality Metrics`, 'failed', 
        `Low quality scores - Confidence: ${confidenceScore}, Novelty: ${noveltyScore}`);
    } else {
      addTestResult(report, `Brain Analysis - ${scenario.name} - Quality Metrics`, 'passed', 
        `Good quality scores - Confidence: ${confidenceScore}, Novelty: ${noveltyScore}`);
    }
    
    return result;
    
  } catch (error) {
    addTestResult(report, `Brain Analysis - ${scenario.name} - Exception`, 'failed', 
      `Analysis test failed with exception: ${error.message}`);
    return null;
  }
}

async function testSlideGeneration(report, analysisResult, scenario) {
  log(`🧪 Testing slide generation for scenario: ${scenario.name}...`, 'test');
  
  try {
    if (!analysisResult) {
      addTestResult(report, `Slide Generation - ${scenario.name} - Prerequisites`, 'skipped', 
        'Skipped due to failed analysis');
      return null;
    }
    
    // Test 1: Create presentation from analysis
    const presentationPayload = {
      title: `Test Presentation - ${scenario.name}`,
      slides: analysisResult.slideStructure,
      metadata: {
        analysisResult,
        context: scenario.context,
        requirements: scenario.requirements,
        generatedAt: new Date().toISOString()
      }
    };
    
    const createResponse = await makeApiCall(TEST_CONFIG.ENDPOINTS.PRESENTATIONS, 'POST', presentationPayload);
    
    if (!createResponse.success) {
      addTestResult(report, `Slide Generation - ${scenario.name} - Create Presentation`, 'failed', 
        `Failed to create presentation: ${JSON.stringify(createResponse.data)}`);
      return null;
    }
    
    const presentationId = createResponse.data.id;
    addTestResult(report, `Slide Generation - ${scenario.name} - Create Presentation`, 'passed', 
      `Presentation created with ID: ${presentationId}`);
    
    // Test 2: Verify slide content quality
    const slides = analysisResult.slideStructure;
    let slideQualityScore = 0;
    
    for (const slide of slides) {
      let slideScore = 0;
      
      // Check title quality
      if (slide.title && slide.title.length > 5) slideScore += 25;
      
      // Check content structure
      if (slide.content && slide.content.summary) slideScore += 25;
      
      // Check chart data if present
      if (slide.charts && slide.charts.length > 0) slideScore += 25;
      
      // Check insight level
      if (slide.insightLevel) slideScore += 25;
      
      slideQualityScore += slideScore;
    }
    
    const avgSlideQuality = slideQualityScore / (slides.length * 100);
    
    if (avgSlideQuality < 0.7) {
      addTestResult(report, `Slide Generation - ${scenario.name} - Content Quality`, 'failed', 
        `Average slide quality: ${Math.round(avgSlideQuality * 100)}%`);
    } else {
      addTestResult(report, `Slide Generation - ${scenario.name} - Content Quality`, 'passed', 
        `Average slide quality: ${Math.round(avgSlideQuality * 100)}%`);
    }
    
    return { presentationId, slides, quality: avgSlideQuality };
    
  } catch (error) {
    addTestResult(report, `Slide Generation - ${scenario.name} - Exception`, 'failed', 
      `Slide generation test failed with exception: ${error.message}`);
    return null;
  }
}

async function testAutoSave(report, presentationId) {
  log('🧪 Testing auto-save functionality...', 'test');
  
  try {
    if (!presentationId) {
      addTestResult(report, 'Auto-Save - Prerequisites', 'skipped', 
        'Skipped due to missing presentation ID');
      return false;
    }
    
    // Test 1: Save presentation session
    const sessionData = {
      presentationId,
      changes: [
        { type: 'title_update', slideId: 'slide_1', newValue: 'Updated Title' },
        { type: 'content_edit', slideId: 'slide_2', newValue: 'Updated content' }
      ],
      autoSave: true,
      timestamp: new Date().toISOString()
    };
    
    const saveResponse = await makeApiCall(TEST_CONFIG.ENDPOINTS.SESSION, 'POST', sessionData);
    
    if (!saveResponse.success) {
      addTestResult(report, 'Auto-Save - Session Save', 'failed', 
        `Auto-save failed: ${JSON.stringify(saveResponse.data)}`);
      return false;
    }
    
    addTestResult(report, 'Auto-Save - Session Save', 'passed', 
      'Auto-save completed successfully');
    
    // Test 2: Verify saved data persistence
    const retrieveResponse = await makeApiCall(`${TEST_CONFIG.ENDPOINTS.SESSION}?id=${presentationId}`, 'GET');
    
    if (!retrieveResponse.success) {
      addTestResult(report, 'Auto-Save - Data Persistence', 'failed', 
        'Failed to retrieve saved session data');
      return false;
    }
    
    addTestResult(report, 'Auto-Save - Data Persistence', 'passed', 
      'Saved data retrieved successfully');
    
    return true;
    
  } catch (error) {
    addTestResult(report, 'Auto-Save - Exception', 'failed', 
      `Auto-save test failed with exception: ${error.message}`);
    return false;
  }
}

async function testCompleteWorkflow(report) {
  log('🧪 Testing complete end-to-end workflow...', 'test');
  
  try {
    // Load test data
    let testData;
    try {
      testData = await loadCsvData(TEST_CONFIG.TEST_DATA_FILE);
    } catch (error) {
      // Try alternative data file
      try {
        testData = await loadCsvData(TEST_CONFIG.ENHANCED_DATA_FILE);
      } catch (altError) {
        addTestResult(report, 'Complete Workflow - Data Loading', 'failed', 
          `Cannot load test data: ${error.message}`);
        return false;
      }
    }
    
    // Run workflow for first scenario
    const scenario = TEST_SCENARIOS[0];
    
    // Step 1: Upload data
    const uploadSuccess = await testDataUpload(report, testData);
    if (!uploadSuccess) {
      addTestResult(report, 'Complete Workflow - Upload Step', 'failed', 
        'Workflow stopped at upload step');
      return false;
    }
    
    // Step 2: Analyze data
    const analysisResult = await testBrainAnalysis(report, testData, scenario);
    if (!analysisResult) {
      addTestResult(report, 'Complete Workflow - Analysis Step', 'failed', 
        'Workflow stopped at analysis step');
      return false;
    }
    
    // Step 3: Generate slides
    const slideResult = await testSlideGeneration(report, analysisResult, scenario);
    if (!slideResult) {
      addTestResult(report, 'Complete Workflow - Slide Generation Step', 'failed', 
        'Workflow stopped at slide generation step');
      return false;
    }
    
    // Step 4: Test auto-save
    const autoSaveSuccess = await testAutoSave(report, slideResult.presentationId);
    
    // Overall workflow assessment
    if (uploadSuccess && analysisResult && slideResult && autoSaveSuccess) {
      addTestResult(report, 'Complete Workflow - End-to-End Success', 'passed', 
        'Full workflow completed successfully from upload to auto-save');
      return true;
    } else {
      addTestResult(report, 'Complete Workflow - End-to-End Success', 'failed', 
        'Workflow completed with some failures');
      return false;
    }
    
  } catch (error) {
    addTestResult(report, 'Complete Workflow - Exception', 'failed', 
      `Complete workflow test failed with exception: ${error.message}`);
    return false;
  }
}

async function generateTestReport(report) {
  const reportContent = {
    ...report,
    summary: {
      ...report.summary,
      successRate: report.summary.total > 0 ? (report.summary.passed / report.summary.total * 100).toFixed(1) : 0,
      completedAt: new Date().toISOString()
    },
    systemInfo: {
      nodeVersion: process.version,
      platform: process.platform,
      testConfig: TEST_CONFIG
    }
  };
  
  // Save detailed report
  const reportFileName = `qa-openai-brain-test-report-${Date.now()}.json`;
  fs.writeFileSync(reportFileName, JSON.stringify(reportContent, null, 2));
  
  // Generate summary
  log('📋 QA Test Report Summary', 'info');
  log(`Total Tests: ${report.summary.total}`, 'info');
  log(`Passed: ${report.summary.passed}`, report.summary.passed > 0 ? 'success' : 'info');
  log(`Failed: ${report.summary.failed}`, report.summary.failed > 0 ? 'error' : 'info');
  log(`Skipped: ${report.summary.skipped}`, report.summary.skipped > 0 ? 'warning' : 'info');
  log(`Success Rate: ${reportContent.summary.successRate}%`, 
    reportContent.summary.successRate >= 80 ? 'success' : 
    reportContent.summary.successRate >= 60 ? 'warning' : 'error');
  log(`Detailed report saved: ${reportFileName}`, 'info');
  
  return reportContent;
}

async function main() {
  log('🚀 Starting QA testing for OpenAI Brain and Slide Building', 'info');
  log('======================================================', 'info');
  
  const report = createTestReport();
  
  try {
    // Load test data
    let testData;
    try {
      testData = await loadCsvData(TEST_CONFIG.TEST_DATA_FILE);
    } catch (error) {
      log(`⚠️ Primary test data not found, trying alternative...`, 'warning');
      try {
        testData = await loadCsvData(TEST_CONFIG.ENHANCED_DATA_FILE);
      } catch (altError) {
        log(`❌ No test data available. Please ensure test-data.csv or sample_business_data.csv exists.`, 'error');
        process.exit(1);
      }
    }
    
    // Test 1: Data Upload Functionality
    log('\n🔄 Phase 1: Testing Data Upload Functionality', 'info');
    await testDataUpload(report, testData);
    
    // Test 2: Brain Analysis for Each Scenario
    log('\n🔄 Phase 2: Testing OpenAI Brain Analysis', 'info');
    const analysisResults = [];
    
    for (const scenario of TEST_SCENARIOS) {
      const result = await testBrainAnalysis(report, testData, scenario);
      analysisResults.push({ scenario, result });
    }
    
    // Test 3: Slide Generation
    log('\n🔄 Phase 3: Testing Slide Generation', 'info');
    const slideResults = [];
    
    for (const { scenario, result } of analysisResults) {
      const slideResult = await testSlideGeneration(report, result, scenario);
      slideResults.push({ scenario, slideResult });
    }
    
    // Test 4: Auto-Save Functionality
    log('\n🔄 Phase 4: Testing Auto-Save Functionality', 'info');
    const firstSlideResult = slideResults.find(r => r.slideResult)?.slideResult;
    if (firstSlideResult) {
      await testAutoSave(report, firstSlideResult.presentationId);
    }
    
    // Test 5: Complete End-to-End Workflow
    log('\n🔄 Phase 5: Testing Complete End-to-End Workflow', 'info');
    await testCompleteWorkflow(report);
    
    // Generate final report
    log('\n📊 Generating QA Test Report', 'info');
    const finalReport = await generateTestReport(report);
    
    log('\n🎯 QA Testing Complete!', 'success');
    
    if (finalReport.summary.successRate >= 80) {
      log('✅ Overall assessment: SYSTEM READY FOR PRODUCTION', 'success');
      process.exit(0);
    } else if (finalReport.summary.successRate >= 60) {
      log('⚠️ Overall assessment: SYSTEM NEEDS MINOR FIXES', 'warning');
      process.exit(1);
    } else {
      log('❌ Overall assessment: SYSTEM NEEDS MAJOR FIXES', 'error');
      process.exit(2);
    }
    
  } catch (error) {
    log(`❌ QA testing failed with fatal error: ${error.message}`, 'error');
    console.error(error.stack);
    process.exit(3);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('🛑 QA testing interrupted by user', 'warning');
  process.exit(130);
});

process.on('uncaughtException', (error) => {
  log(`💥 Uncaught exception: ${error.message}`, 'error');
  console.error(error.stack);
  process.exit(1);
});

// Run the QA tests
if (require.main === module) {
  main();
}

module.exports = {
  TEST_CONFIG,
  TEST_SCENARIOS,
  testDataUpload,
  testBrainAnalysis,
  testSlideGeneration,
  testAutoSave,
  testCompleteWorkflow
};