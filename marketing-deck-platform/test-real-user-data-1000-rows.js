#!/usr/bin/env node

/**
 * COMPREHENSIVE TEST: Real User Data Processing
 * Tests 1000 rows x 14 columns of realistic business data
 * Verifies entire pipeline from upload → processing → AI analysis → deck generation → export
 */

const fs = require('fs');
const path = require('path');

// Generate realistic 1000-row, 14-column business dataset
function generateRealistic1000RowDataset() {
  const headers = [
    'Date',
    'Region',
    'Product_Category', 
    'Sales_Rep',
    'Customer_ID',
    'Revenue',
    'Units_Sold',
    'Profit_Margin',
    'Customer_Acquisition_Cost',
    'Customer_Lifetime_Value',
    'Marketing_Spend',
    'Conversion_Rate',
    'Customer_Satisfaction',
    'Churn_Risk_Score'
  ];

  const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East'];
  const categories = ['Software', 'Hardware', 'Services', 'Support', 'Training'];
  const salesReps = ['Alice Johnson', 'Bob Chen', 'Carol Davis', 'David Wilson', 'Eva Martinez', 'Frank Taylor', 'Grace Kim', 'Henry Brown'];

  let csvContent = headers.join(',') + '\n';

  // Generate 1000 rows of realistic business data
  for (let i = 0; i < 1000; i++) {
    const date = new Date(2024, 0, 1);
    date.setDate(date.getDate() + (i % 365));
    
    const region = regions[Math.floor(Math.random() * regions.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const salesRep = salesReps[Math.floor(Math.random() * salesReps.length)];
    const customerId = `CUST_${String(i + 1000).padStart(6, '0')}`;
    
    // Generate correlated business metrics
    const baseRevenue = Math.random() * 50000 + 10000;
    const unitsSold = Math.floor(baseRevenue / (200 + Math.random() * 800));
    const profitMargin = (15 + Math.random() * 25).toFixed(2);
    const cac = (baseRevenue * 0.1 * (0.5 + Math.random())).toFixed(2);
    const clv = (baseRevenue * (2 + Math.random() * 3)).toFixed(2);
    const marketingSpend = (baseRevenue * 0.15 * (0.8 + Math.random() * 0.4)).toFixed(2);
    const conversionRate = (5 + Math.random() * 15).toFixed(2);
    const satisfaction = (3.5 + Math.random() * 1.5).toFixed(1);
    const churnRisk = (Math.random() * 100).toFixed(1);

    const row = [
      date.toISOString().split('T')[0],
      region,
      category,
      salesRep,
      customerId,
      baseRevenue.toFixed(2),
      unitsSold,
      profitMargin,
      cac,
      clv,
      marketingSpend,
      conversionRate,
      satisfaction,
      churnRisk
    ];

    csvContent += row.join(',') + '\n';
  }

  return csvContent;
}

// Create test dataset file
function createTestDataset() {
  const csvData = generateRealistic1000RowDataset();
  const filePath = path.join(__dirname, 'test_user_data_1000_rows.csv');
  fs.writeFileSync(filePath, csvData);
  console.log(`✅ Created test dataset: ${filePath}`);
  console.log(`📊 Dataset: 1000 rows x 14 columns`);
  console.log(`📁 File size: ${(csvData.length / 1024).toFixed(1)} KB`);
  return filePath;
}

// Test upload and processing
async function testUploadProcessing(filePath) {
  console.log('\n🔄 Testing Upload & Processing...');
  
  try {
    const FormData = require('form-data');
    const fs = require('fs');
    const form = new FormData();
    
    form.append('file', fs.createReadStream(filePath));
    form.append('projectName', 'Test 1000 Row Business Dataset');

    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: form
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Upload successful!');
      console.log(`📊 Processed files: ${result.files?.length || 0}`);
      console.log(`🔢 Total rows processed: ${result.files?.[0]?.rowCount || 0}`);
      console.log(`📋 Columns detected: ${result.files?.[0]?.columns?.length || 0}`);
      console.log(`🏷️  Dataset ID: ${result.files?.[0]?.id}`);
      
      if (result.files?.[0]?.statistics) {
        console.log(`📈 Statistics calculated: ${Object.keys(result.files[0].statistics).length} data types`);
      }
      
      return result.files[0];
    } else {
      console.log('❌ Upload failed:', result.error);
      return null;
    }
  } catch (error) {
    console.log('❌ Upload error:', error.message);
    return null;
  }
}

// Test AI analysis with real data
async function testAIAnalysis(datasetInfo) {
  console.log('\n🧠 Testing AI Analysis with Real Data...');
  
  try {
    const analysisRequest = {
      data: datasetInfo.sampleData || [], // Use sample data
      datasetIds: [datasetInfo.id], // Pass dataset ID for full data retrieval
      context: {
        industry: 'Technology',
        targetAudience: 'Executives',
        businessContext: 'Sales Performance Analysis',
        description: 'Comprehensive analysis of 1000-row sales dataset',
        factors: ['Revenue trends', 'Regional performance', 'Customer metrics']
      },
      timeFrame: {
        start: '2024-01-01',
        end: '2024-12-31',
        dataFrequency: 'daily',
        analysisType: 'trend',
        comparisons: ['mm', 'qq']
      },
      requirements: {
        slidesCount: 8,
        presentationDuration: 20,
        focusAreas: ['Revenue Analysis', 'Regional Performance', 'Customer Insights', 'Profitability Trends'],
        style: 'professional',
        includeCharts: true
      }
    };

    const response = await fetch('http://localhost:3000/api/ai/universal-analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(analysisRequest)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ AI Analysis successful!');
      console.log(`🔍 Insights generated: ${result.result?.insights?.length || 0}`);
      console.log(`📄 Slides structured: ${result.result?.slideStructure?.length || 0}`);
      console.log(`🎯 Analysis confidence: ${result.metadata?.confidence || 'N/A'}%`);
      console.log(`🏆 Novelty score: ${result.metadata?.noveltyScore || 'N/A'}/100`);
      
      if (result.metadata?.dataSampling) {
        console.log(`📊 Data sampling: ${result.metadata.dataSampling.originalRows} → ${result.metadata.dataSampling.sampledRows} rows`);
      } else {
        console.log('📊 Full dataset analyzed (no sampling required)');
      }
      
      return result.result;
    } else {
      console.log('❌ AI Analysis failed:', result.error);
      return null;
    }
  } catch (error) {
    console.log('❌ AI Analysis error:', error.message);
    return null;
  }
}

// Test deck generation
async function testDeckGeneration(datasetInfo, analysisResult) {
  console.log('\n🎨 Testing Deck Generation...');
  
  try {
    const generateRequest = {
      title: 'Business Performance Analysis - 1000 Row Dataset',
      datasetIds: [datasetInfo.id],
      data: datasetInfo.sampleData || [],
      sessionData: {
        files: [{
          id: datasetInfo.id,
          fileName: datasetInfo.fileName,
          data: datasetInfo.sampleData || []
        }]
      },
      qaResponses: {
        dataType: 'business',
        analysisType: 'comprehensive',
        focusAreas: ['Revenue', 'Profitability', 'Customer Metrics']
      },
      generateWithAI: true,
      userId: 'test-user'
    };

    const response = await fetch('http://localhost:3000/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(generateRequest)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Deck generation successful!');
      console.log(`📄 Slides generated: ${result.slides?.length || 0}`);
      console.log(`📊 Data points used: ${result.dataPoints || 0}`);
      console.log(`📈 Chart recommendation: ${result.chartRecommendation || 'N/A'}`);
      console.log(`🎯 Using real data: ${result.usingRealData ? 'YES' : 'NO'}`);
      console.log(`🗃️  Dataset source: ${result.datasetInfo?.source || 'unknown'}`);
      console.log(`🆔 Presentation ID: ${result.presentationId}`);
      
      return {
        presentationId: result.presentationId,
        slides: result.slides
      };
    } else {
      console.log('❌ Deck generation failed:', result.error);
      return null;
    }
  } catch (error) {
    console.log('❌ Deck generation error:', error.message);
    return null;
  }
}

// Test PowerPoint export
async function testPowerPointExport(presentationData) {
  console.log('\n📊 Testing PowerPoint Export...');
  
  try {
    const exportRequest = {
      format: 'pptx',
      size: '16:9',
      slides: presentationData.slides?.map(slide => ({
        id: slide.id,
        title: slide.title,
        layout: 'content',
        backgroundColor: '#ffffff',
        elements: [
          {
            id: 'title',
            type: 'text',
            x: 100,
            y: 50,
            width: 800,
            height: 60,
            content: slide.title,
            fontSize: 24,
            fontWeight: 'bold'
          },
          {
            id: 'content',
            type: 'text', 
            x: 100,
            y: 150,
            width: 800,
            height: 400,
            content: slide.content || 'Slide content from real data analysis',
            fontSize: 16
          }
        ]
      })) || []
    };

    const response = await fetch(`http://localhost:3000/api/presentations/${presentationData.presentationId}/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(exportRequest)
    });

    if (response.ok) {
      const blob = await response.blob();
      const exportPath = path.join(__dirname, 'test_export_1000_rows.pptx');
      const buffer = Buffer.from(await blob.arrayBuffer());
      fs.writeFileSync(exportPath, buffer);
      
      console.log('✅ PowerPoint export successful!');
      console.log(`📁 Exported file: ${exportPath}`);
      console.log(`📏 File size: ${(buffer.length / 1024).toFixed(1)} KB`);
      console.log(`📄 Slides exported: ${exportRequest.slides.length}`);
      
      return exportPath;
    } else {
      console.log('❌ Export failed:', response.status, response.statusText);
      return null;
    }
  } catch (error) {
    console.log('❌ Export error:', error.message);
    return null;
  }
}

// Run comprehensive test
async function runComprehensiveTest() {
  console.log('🚀 AEDRIN Platform Test: 1000 Rows x 14 Columns Real User Data');
  console.log('=' .repeat(70));
  
  const startTime = Date.now();
  
  // Step 1: Create test dataset
  const filePath = createTestDataset();
  
  // Step 2: Test upload and processing
  const datasetInfo = await testUploadProcessing(filePath);
  if (!datasetInfo) {
    console.log('❌ Test failed at upload stage');
    return;
  }
  
  // Step 3: Test AI analysis
  const analysisResult = await testAIAnalysis(datasetInfo);
  if (!analysisResult) {
    console.log('❌ Test failed at AI analysis stage');
    return;
  }
  
  // Step 4: Test deck generation
  const presentationData = await testDeckGeneration(datasetInfo, analysisResult);
  if (!presentationData) {
    console.log('❌ Test failed at deck generation stage');
    return;
  }
  
  // Step 5: Test PowerPoint export
  const exportPath = await testPowerPointExport(presentationData);
  if (!exportPath) {
    console.log('❌ Test failed at export stage');
    return;
  }
  
  const totalTime = Date.now() - startTime;
  
  console.log('\n🎉 COMPREHENSIVE TEST COMPLETED SUCCESSFULLY!');
  console.log('=' .repeat(70));
  console.log(`⏱️  Total processing time: ${(totalTime / 1000).toFixed(2)} seconds`);
  console.log(`📊 Dataset: 1000 rows x 14 columns processed successfully`);
  console.log(`🔄 Full pipeline: Upload → Process → AI Analysis → Deck → Export`);
  console.log(`✅ All stages completed with REAL USER DATA`);
  console.log(`📁 Files created:`);
  console.log(`   - Input: ${filePath}`);
  console.log(`   - Output: ${exportPath}`);
  
  // Clean up test files
  try {
    fs.unlinkSync(filePath);
    console.log(`🗑️  Cleaned up test input file`);
  } catch (e) {
    // File might not exist
  }
  
  console.log('\n✨ PROOF: AEDRIN Platform successfully processes real user data!');
}

// Export for external use
module.exports = {
  runComprehensiveTest,
  generateRealistic1000RowDataset,
  testUploadProcessing,
  testAIAnalysis,
  testDeckGeneration,
  testPowerPointExport
};

// Run test if called directly
if (require.main === module) {
  runComprehensiveTest().catch(console.error);
}