#!/usr/bin/env node

/**
 * Simple Data Flow Test
 * Tests the complete flow: Upload → Process → Analyze → Generate
 */

const fs = require('fs');
const path = require('path');

// Create test CSV data
const testCsvContent = `Date,Revenue,Customers,Growth
2024-01-01,50000,120,15.2
2024-02-01,52000,125,4.0
2024-03-01,48000,118,-7.7
2024-04-01,55000,135,14.6
2024-05-01,58000,142,5.5
2024-06-01,61000,150,5.2
2024-07-01,59000,148,-3.3
2024-08-01,64000,155,8.5
2024-09-01,67000,162,4.7
2024-10-01,70000,168,4.5
2024-11-01,72000,175,2.9
2024-12-01,75000,180,4.2`;

console.log('🧪 Simple Data Flow Test Starting...\n');

// Step 1: Create test data file
const testDataPath = 'test-revenue-data.csv';
fs.writeFileSync(testDataPath, testCsvContent);
console.log('✅ Step 1: Created test CSV file');

// Step 2: Test file upload API
async function testUpload() {
  console.log('🔄 Step 2: Testing file upload...');
  
  const FormData = require('form-data');
  const fetch = (await import('node-fetch')).default;
  
  const form = new FormData();
  form.append('file', fs.createReadStream(testDataPath));
  form.append('projectName', 'Test Revenue Analysis');
  
  try {
    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: form,
      headers: {
        'Cookie': 'demo-user=true' // Use demo mode
      }
    });
    
    const result = await response.json();
    
    if (result.success && result.files && result.files.length > 0) {
      console.log('✅ Step 2: Upload successful');
      console.log(`   - Files processed: ${result.files.length}`);
      console.log(`   - Rows parsed: ${result.files[0].rowCount || 'Unknown'}`);
      console.log(`   - Columns detected: ${result.files[0].columns ? result.files[0].columns.length : 'Unknown'}`);
      return result;
    } else {
      throw new Error(`Upload failed: ${result.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('❌ Step 2: Upload failed:', error.message);
    throw error;
  }
}

// Step 3: Test AI analysis
async function testAnalysis(uploadResult) {
  console.log('🔄 Step 3: Testing AI analysis...');
  
  const fetch = (await import('node-fetch')).default;
  
  const analysisData = {
    data: uploadResult.files[0].data || uploadResult.files[0].sampleData,
    context: {
      industry: 'Technology',
      businessContext: 'Monthly revenue analysis',
      targetAudience: 'Executives',
      description: 'Revenue growth and customer acquisition data'
    },
    timeFrame: {
      start: '2024-01-01',
      end: '2024-12-01',
      dataFrequency: 'monthly',
      analysisType: 'trend'
    },
    requirements: {
      slidesCount: 8,
      presentationDuration: 10,
      focusAreas: ['Revenue Trends', 'Customer Growth', 'Performance Analysis'],
      style: 'professional'
    }
  };
  
  try {
    const response = await fetch('http://localhost:3000/api/ai/universal-analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'demo-user=true'
      },
      body: JSON.stringify(analysisData)
    });
    
    const result = await response.json();
    
    if (result.success && result.result) {
      console.log('✅ Step 3: AI analysis successful');
      console.log(`   - Insights generated: ${result.result.insights?.length || 0}`);
      console.log(`   - Slides generated: ${result.result.slideStructure?.length || 0}`);
      console.log(`   - Narrative theme: ${result.result.narrative?.theme || 'Not specified'}`);
      return result.result;
    } else {
      throw new Error(`Analysis failed: ${result.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('❌ Step 3: Analysis failed:', error.message);
    throw error;
  }
}

// Step 4: Test presentation generation (simulate deck builder)
async function testPresentationGeneration(analysisResult) {
  console.log('🔄 Step 4: Testing presentation generation...');
  
  try {
    // Simulate what UltimateDeckBuilder does
    const slides = analysisResult.slideStructure?.map((slideData, index) => ({
      id: `slide_${index}`,
      title: slideData.title || `Slide ${index + 1}`,
      type: slideData.type || 'content',
      content: slideData.content?.summary || slideData.narrative || 'Content placeholder',
      charts: slideData.charts || [],
      insights: slideData.insights || []
    })) || [];
    
    if (slides.length > 0) {
      console.log('✅ Step 4: Presentation generation successful');
      console.log(`   - Slides created: ${slides.length}`);
      console.log(`   - First slide: "${slides[0].title}"`);
      console.log(`   - Last slide: "${slides[slides.length - 1].title}"`);
      return slides;
    } else {
      throw new Error('No slides generated from analysis');
    }
  } catch (error) {
    console.error('❌ Step 4: Presentation generation failed:', error.message);
    throw error;
  }
}

// Main test function
async function runTest() {
  try {
    console.log('Starting complete data flow test...\n');
    
    const uploadResult = await testUpload();
    const analysisResult = await testAnalysis(uploadResult);
    const presentation = await testPresentationGeneration(analysisResult);
    
    console.log('\n🎉 COMPLETE DATA FLOW TEST PASSED!');
    console.log('✅ Upload → Process → Analyze → Generate workflow is working');
    console.log(`✅ End-to-end test completed with ${presentation.length} slides generated\n`);
    
    // Optional: Save results for inspection
    fs.writeFileSync('test-results.json', JSON.stringify({
      uploadResult,
      analysisResult,
      presentation
    }, null, 2));
    console.log('📁 Test results saved to test-results.json');
    
  } catch (error) {
    console.error('\n❌ COMPLETE DATA FLOW TEST FAILED');
    console.error('Error:', error.message);
    console.error('\nThis indicates the AI analysis or deck building is still broken.\n');
    process.exit(1);
  } finally {
    // Cleanup
    if (fs.existsSync(testDataPath)) {
      fs.unlinkSync(testDataPath);
    }
  }
}

// Run if called directly
if (require.main === module) {
  runTest();
}

module.exports = { runTest };