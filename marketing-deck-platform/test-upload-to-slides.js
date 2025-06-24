const fs = require('fs');
const path = require('path');

// Test configuration
const API_BASE_URL = 'http://localhost:3000/api';
const DEMO_USER_ID = 'demo-user-id';

// Helper function to make API requests
async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'x-demo-mode': 'true',
        'x-demo-user-id': DEMO_USER_ID,
      },
    });

    const data = await response.json();
    
    return {
      ok: response.ok,
      status: response.status,
      data,
      headers: response.headers,
    };
  } catch (error) {
    console.error(`Error calling ${endpoint}:`, error.message);
    return {
      ok: false,
      error: error.message,
    };
  }
}

// Test the complete upload-to-slides flow
async function testUploadToSlidesFlow() {
  console.log('🚀 Starting Upload-to-Slides End-to-End Test\n');
  
  try {
    // Step 1: Upload a CSV file
    console.log('📤 Step 1: Uploading CSV file...');
    
    const formData = new FormData();
    const csvContent = `Date,Revenue,Customers,Product
2024-01,50000,1200,Product A
2024-02,55000,1350,Product A
2024-03,48000,1150,Product B
2024-04,62000,1450,Product A
2024-05,58000,1380,Product B
2024-06,71000,1600,Product A`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    formData.append('file', blob, 'test-data.csv');
    
    const uploadResult = await makeRequest('/upload', {
      method: 'POST',
      body: formData,
    });
    
    console.log('Upload result:', {
      success: uploadResult.ok,
      status: uploadResult.status,
      datasets: uploadResult.data?.datasets?.length || 0,
      totalFiles: uploadResult.data?.totalFiles,
      hasFiles: !!uploadResult.data?.files,
    });
    
    if (!uploadResult.ok) {
      throw new Error(`Upload failed: ${JSON.stringify(uploadResult.data)}`);
    }
    
    const datasetId = uploadResult.data.datasets?.[0]?.id;
    const uploadedData = uploadResult.data.files?.[0]?.data;
    console.log('✅ Upload successful! Dataset ID:', datasetId);
    console.log('Data rows:', uploadedData?.length || 0);
    
    // Step 2: Analyze the uploaded data
    console.log('\n🔍 Step 2: Analyzing uploaded data...');
    
    const analysisResult = await makeRequest('/openai/enhanced-analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: uploadedData || [],
        datasetId: datasetId,
        context: {
          purpose: "Creating a comprehensive presentation",
          audience: "Business stakeholders",
          focus: "Revenue and customer analysis"
        },
        timeFrame: {
          period: "Monthly",
          range: "2024-01 to 2024-06",
          granularity: "month"
        },
        requirements: {
          slideCount: 5,
          includeCharts: true,
          includeTrends: true,
          includeInsights: true,
          analysisDepth: "comprehensive"
        }
      }),
    });
    
    console.log('Analysis result:', {
      success: analysisResult.ok,
      status: analysisResult.status,
      hasAnalysis: !!analysisResult.data?.analysis,
      hasSlides: !!analysisResult.data?.analysis?.slides,
      slideCount: analysisResult.data?.analysis?.slides?.length || 0,
    });
    
    if (!analysisResult.ok) {
      throw new Error(`Analysis failed: ${JSON.stringify(analysisResult.data)}`);
    }
    
    const analysis = analysisResult.data.analysis;
    console.log('✅ Analysis successful!');
    console.log('Generated slides:', analysis.slides?.length || 0);
    
    // Step 3: Create a presentation from the analysis
    console.log('\n📊 Step 3: Creating presentation from analysis...');
    
    const presentationResult = await makeRequest('/presentations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Test Presentation - Upload to Slides',
        description: 'Generated from uploaded CSV data',
        slides: analysis.slides || [],
        theme: {
          name: 'professional',
          primaryColor: '#1E40AF',
          backgroundColor: '#FFFFFF',
        },
        metadata: {
          datasetId: datasetId,
          analysisId: analysisResult.data.analysisId,
          createdFrom: 'upload-flow',
        }
      }),
    });
    
    console.log('Presentation result:', {
      success: presentationResult.ok,
      status: presentationResult.status,
      presentationId: presentationResult.data?.id,
    });
    
    if (!presentationResult.ok) {
      throw new Error(`Presentation creation failed: ${JSON.stringify(presentationResult.data)}`);
    }
    
    const presentationId = presentationResult.data.id;
    console.log('✅ Presentation created! ID:', presentationId);
    
    // Step 4: Verify the presentation
    console.log('\n✔️ Step 4: Verifying created presentation...');
    
    const verifyResult = await makeRequest(`/presentations?id=${presentationId}`, {
      method: 'GET',
    });
    
    console.log('Verification result:', {
      success: verifyResult.ok,
      status: verifyResult.status,
      hasPresentation: !!verifyResult.data?.presentation,
      slideCount: verifyResult.data?.presentation?.slides?.length || 0,
    });
    
    if (verifyResult.ok && verifyResult.data?.presentation) {
      const presentation = verifyResult.data.presentation;
      console.log('\n📈 Presentation Details:');
      console.log('- Title:', presentation.title);
      console.log('- Slides:', presentation.slides?.length || 0);
      console.log('- Theme:', presentation.theme?.name || 'default');
      
      if (presentation.slides && presentation.slides.length > 0) {
        console.log('\n📑 Slide Titles:');
        presentation.slides.forEach((slide, index) => {
          console.log(`  ${index + 1}. ${slide.title || 'Untitled'}`);
        });
      }
    }
    
    // Summary
    console.log('\n✅ Upload-to-Slides Test Complete!');
    console.log('================================');
    console.log('Summary:');
    console.log('- CSV uploaded successfully');
    console.log('- Data analyzed with AI');
    console.log('- Presentation created with', analysis.slides?.length || 0, 'slides');
    console.log('- All endpoints working correctly');
    
    // Test specific slide types
    if (analysis.slides && analysis.slides.length > 0) {
      console.log('\n📊 Slide Type Analysis:');
      const slideTypes = {};
      analysis.slides.forEach(slide => {
        slideTypes[slide.type] = (slideTypes[slide.type] || 0) + 1;
      });
      Object.entries(slideTypes).forEach(([type, count]) => {
        console.log(`- ${type}: ${count} slide(s)`);
      });
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testUploadToSlidesFlow().then(() => {
  console.log('\n✅ All tests passed!');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ Test error:', error);
  process.exit(1);
});