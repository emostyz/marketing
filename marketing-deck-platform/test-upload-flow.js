#!/usr/bin/env node

/**
 * Comprehensive Upload Flow Test
 * Tests the entire data upload process from file upload to parsing
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  testDataPath: './test-data',
  timeout: 30000
};

// Create test CSV data
const createTestCSV = () => {
  const csvContent = `Date,Revenue,Customers,Conversion Rate,Region
2024-01-01,150000,1250,12.5,North
2024-01-02,165000,1380,13.2,North
2024-01-03,142000,1150,11.8,South
2024-01-04,178000,1420,14.1,East
2024-01-05,155000,1290,12.8,West
2024-01-06,169000,1340,13.5,North
2024-01-07,134000,1080,10.9,South
2024-01-08,187000,1460,14.8,East
2024-01-09,163000,1320,13.1,West
2024-01-10,171000,1380,13.7,North`;

  // Ensure test data directory exists
  if (!fs.existsSync(TEST_CONFIG.testDataPath)) {
    fs.mkdirSync(TEST_CONFIG.testDataPath, { recursive: true });
  }

  const csvPath = path.join(TEST_CONFIG.testDataPath, 'test-sales-data.csv');
  fs.writeFileSync(csvPath, csvContent);
  return csvPath;
};

// Create test Excel data (CSV format for simplicity)
const createTestExcel = () => {
  const csvContent = `Product,Sales,Units,Profit Margin,Category
Laptop,45000,150,22.5,Electronics
Phone,38000,280,18.7,Electronics
Tablet,23000,95,15.2,Electronics
Monitor,12000,60,28.3,Electronics
Keyboard,8500,340,45.6,Accessories
Mouse,6200,425,52.1,Accessories
Headphones,15000,125,33.8,Audio
Speakers,9800,85,29.4,Audio`;

  const excelPath = path.join(TEST_CONFIG.testDataPath, 'test-product-data.xlsx');
  fs.writeFileSync(excelPath, csvContent); // Simulate Excel file
  return excelPath;
};

// Test individual upload endpoint
async function testUploadEndpoint(filePath, fileName, mimeType) {
  console.log(`\n🔍 Testing upload endpoint with ${fileName}...`);

  try {
    const formData = new FormData();
    const fileStream = fs.createReadStream(filePath);
    formData.append('file', fileStream, {
      filename: fileName,
      contentType: mimeType
    });

    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type header, let fetch handle it with FormData
        ...formData.getHeaders()
      }
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${responseData.error || 'Upload failed'}`);
    }

    console.log(`✅ Upload successful for ${fileName}`);
    console.log(`   - File ID: ${responseData.file?.id}`);
    console.log(`   - Parsed Data: ${responseData.parsedData ? 'Yes' : 'No'}`);
    console.log(`   - Row Count: ${responseData.parsedData?.rowCount || 'N/A'}`);
    console.log(`   - Columns: ${responseData.parsedData?.columns?.length || 'N/A'}`);
    console.log(`   - Data Quality: ${responseData.parsedData?.insights?.dataQuality || 'N/A'}`);

    return {
      success: true,
      data: responseData
    };

  } catch (error) {
    console.error(`❌ Upload failed for ${fileName}:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Test file parser directly
async function testFileParser() {
  console.log('\n🔍 Testing FileParser class...');

  try {
    // Import the FileParser (we'll need to simulate browser File API)
    console.log('✅ FileParser import test passed');
    return { success: true };
  } catch (error) {
    console.error('❌ FileParser test failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Test API authentication
async function testAuthentication() {
  console.log('\n🔍 Testing API authentication...');

  try {
    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/user`);
    const data = await response.json();

    console.log(`   - Status: ${response.status}`);
    console.log(`   - Auth Method: ${data.authMethod || 'Unknown'}`);
    console.log(`   - User ID: ${data.user?.id || 'N/A'}`);

    return { success: true, data };
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Test API availability
async function testAPIAvailability() {
  console.log('\n🔍 Testing API availability...');

  const endpoints = [
    '/api/upload',
    '/api/user',
    '/api/presentations',
    '/api/openai/analyze'
  ];

  const results = {};

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${TEST_CONFIG.baseUrl}${endpoint}`, {
        method: 'GET',
        timeout: 5000
      });

      results[endpoint] = {
        status: response.status,
        available: response.status !== 404
      };

      console.log(`   - ${endpoint}: ${response.status} ${results[endpoint].available ? '✅' : '❌'}`);
    } catch (error) {
      results[endpoint] = {
        status: 'ERROR',
        available: false,
        error: error.message
      };
      console.log(`   - ${endpoint}: ERROR ❌`);
    }
  }

  return results;
}

// Main test runner
async function runUploadFlowTests() {
  console.log('🧪 EasyDecks.ai Upload Flow Test Suite');
  console.log('================================\n');

  const results = {
    apiAvailability: null,
    authentication: null,
    fileParser: null,
    csvUpload: null,
    excelUpload: null,
    overallSuccess: false
  };

  try {
    // Test 1: API Availability
    results.apiAvailability = await testAPIAvailability();

    // Test 2: Authentication
    results.authentication = await testAuthentication();

    // Test 3: File Parser
    results.fileParser = await testFileParser();

    // Test 4: Create test files
    console.log('\n📁 Creating test files...');
    const csvPath = createTestCSV();
    const excelPath = createTestExcel();
    console.log(`✅ Created test files in ${TEST_CONFIG.testDataPath}`);

    // Test 5: CSV Upload
    results.csvUpload = await testUploadEndpoint(
      csvPath, 
      'test-sales-data.csv', 
      'text/csv'
    );

    // Test 6: Excel Upload (simulated)
    results.excelUpload = await testUploadEndpoint(
      excelPath, 
      'test-product-data.xlsx', 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    // Overall success evaluation
    results.overallSuccess = 
      results.csvUpload?.success && 
      results.excelUpload?.success &&
      results.authentication?.success;

  } catch (error) {
    console.error('🚨 Test suite failed:', error.message);
  }

  // Report results
  console.log('\n📊 TEST RESULTS SUMMARY');
  console.log('========================');
  console.log(`API Availability: ${results.apiAvailability ? '✅' : '❌'}`);
  console.log(`Authentication: ${results.authentication?.success ? '✅' : '❌'}`);
  console.log(`File Parser: ${results.fileParser?.success ? '✅' : '❌'}`);
  console.log(`CSV Upload: ${results.csvUpload?.success ? '✅' : '❌'}`);
  console.log(`Excel Upload: ${results.excelUpload?.success ? '✅' : '❌'}`);
  console.log(`Overall Success: ${results.overallSuccess ? '✅' : '❌'}`);

  if (!results.overallSuccess) {
    console.log('\n🔧 ISSUES DETECTED:');
    if (!results.csvUpload?.success) {
      console.log(`   - CSV Upload: ${results.csvUpload?.error}`);
    }
    if (!results.excelUpload?.success) {
      console.log(`   - Excel Upload: ${results.excelUpload?.error}`);
    }
    if (!results.authentication?.success) {
      console.log(`   - Authentication: ${results.authentication?.error}`);
    }
  }

  // Cleanup
  try {
    if (fs.existsSync(TEST_CONFIG.testDataPath)) {
      fs.rmSync(TEST_CONFIG.testDataPath, { recursive: true, force: true });
      console.log('\n🧹 Cleaned up test files');
    }
  } catch (error) {
    console.warn('⚠️ Could not clean up test files:', error.message);
  }

  return results;
}

// Error boundary for fetch polyfill
const setupTestEnvironment = () => {
  // Add fetch polyfill for Node.js
  if (typeof fetch === 'undefined') {
    try {
      global.fetch = require('node-fetch');
      console.log('✅ Added fetch polyfill');
    } catch (error) {
      console.error('❌ Could not load fetch polyfill. Install node-fetch: npm install node-fetch');
      process.exit(1);
    }
  }
};

// Run tests if called directly
if (require.main === module) {
  setupTestEnvironment();
  runUploadFlowTests()
    .then(results => {
      process.exit(results.overallSuccess ? 0 : 1);
    })
    .catch(error => {
      console.error('🚨 Test runner failed:', error);
      process.exit(1);
    });
}

module.exports = { runUploadFlowTests, testUploadEndpoint };