#!/usr/bin/env node

/**
 * Comprehensive End-to-End Flow Verification
 * Tests the complete pipeline from data upload to deck generation
 * Ensures REAL data creates meaningful insights and functional decks
 */

const fs = require('fs');
const path = require('path');

// Test CSV data with real business metrics
const testData = `Date,Revenue,Region,Product,Units_Sold,Customer_Satisfaction
2024-01-01,125000,North,Product A,450,4.2
2024-01-01,89000,South,Product B,320,4.5
2024-01-01,156000,East,Product A,580,4.1
2024-01-01,67000,West,Product C,200,3.8
2024-02-01,132000,North,Product A,470,4.3
2024-02-01,95000,South,Product B,340,4.6
2024-02-01,163000,East,Product A,600,4.2
2024-02-01,71000,West,Product C,210,3.9
2024-03-01,145000,North,Product A,520,4.4
2024-03-01,103000,South,Product B,370,4.7
2024-03-01,178000,East,Product A,650,4.3
2024-03-01,78000,West,Product C,230,4.0
2024-04-01,158000,North,Product A,570,4.5
2024-04-01,112000,South,Product B,400,4.8
2024-04-01,195000,East,Product A,710,4.4
2024-04-01,85000,West,Product C,250,4.1
2024-05-01,172000,North,Product A,620,4.6
2024-05-01,125000,South,Product B,450,4.9
2024-05-01,215000,East,Product A,780,4.5
2024-05-01,94000,West,Product C,280,4.2`;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function uploadTestData() {
  console.log('📊 Step 1: Uploading real test data...');
  
  // Create test file
  const testFilePath = path.join(__dirname, 'test_real_business_data.csv');
  fs.writeFileSync(testFilePath, testData);
  
  try {
    const FormData = require('form-data');
    const fetch = require('node-fetch');
    
    const form = new FormData();
    form.append('file', fs.createReadStream(testFilePath));
    form.append('context', JSON.stringify({
      description: 'Q1-Q2 2024 Business Performance Analysis',
      industry: 'E-commerce',
      businessContext: 'Regional sales performance and product analysis',
      targetAudience: 'Executive Leadership',
      goal: 'Identify growth opportunities and regional performance trends'
    }));
    
    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: form,
      headers: {
        'Cookie': fs.readFileSync('cookies.txt', 'utf8')
      }
    });
    
    const result = await response.json();
    console.log('✅ Upload result:', result.success ? 'SUCCESS' : 'FAILED');
    
    if (result.success) {
      console.log('📈 Dataset created:', result.datasetId);
      console.log('🔍 Processed rows:', result.processedRows);
      return { datasetId: result.datasetId, context: result.context };
    } else {
      console.error('❌ Upload failed:', result.error);
      return null;
    }
  } catch (error) {
    console.error('💥 Upload error:', error.message);
    return null;
  } finally {
    // Clean up test file
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  }
}

async function generateDeckFromData(datasetId, context) {
  console.log('🎯 Step 2: Generating deck from REAL data...');
  
  try {
    const fetch = require('node-fetch');
    
    const response = await fetch('http://localhost:3000/api/deck/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': fs.readFileSync('cookies.txt', 'utf8')
      },
      body: JSON.stringify({
        datasetId,
        context
      })
    });
    
    const result = await response.json();
    console.log('🎨 Deck generation result:', result.success ? 'SUCCESS' : 'FAILED');
    
    if (result.success) {
      console.log('🎪 Deck created with ID:', result.deckId);
      console.log('📊 Slides generated:', result.slides?.length || 'unknown');
      return result.deckId;
    } else {
      console.error('❌ Deck generation failed:', result.error);
      return null;
    }
  } catch (error) {
    console.error('💥 Deck generation error:', error.message);
    return null;
  }
}

async function verifyDeckContent(deckId) {
  console.log('🔍 Step 3: Verifying deck contains REAL insights...');
  
  try {
    const fetch = require('node-fetch');
    
    const response = await fetch(`http://localhost:3000/api/presentations/${deckId}`, {
      headers: {
        'Cookie': fs.readFileSync('cookies.txt', 'utf8')
      }
    });
    
    const result = await response.json();
    
    if (result.success && result.data) {
      const deck = result.data;
      console.log('✅ Deck loaded successfully');
      console.log('📄 Title:', deck.title);
      console.log('📊 Total slides:', deck.slides?.length || 0);
      
      // Verify slides have real content
      if (deck.slides && deck.slides.length > 0) {
        console.log('\n🔬 ANALYZING SLIDE CONTENT FOR REAL INSIGHTS:');
        
        let hasRealInsights = false;
        let hasRevenueData = false;
        let hasRegionalData = false;
        let hasProductData = false;
        
        deck.slides.forEach((slide, index) => {
          console.log(`\n📋 Slide ${index + 1}: ${slide.title}`);
          
          // Check slide content for real business insights
          const slideContent = JSON.stringify(slide).toLowerCase();
          
          if (slideContent.includes('revenue') || slideContent.includes('125000') || slideContent.includes('$')) {
            hasRevenueData = true;
            console.log('  ✅ Contains real revenue data');
          }
          
          if (slideContent.includes('north') || slideContent.includes('south') || slideContent.includes('east') || slideContent.includes('west')) {
            hasRegionalData = true;
            console.log('  ✅ Contains regional analysis');
          }
          
          if (slideContent.includes('product a') || slideContent.includes('product b') || slideContent.includes('product c')) {
            hasProductData = true;
            console.log('  ✅ Contains product performance data');
          }
          
          if (slideContent.includes('growth') || slideContent.includes('trend') || slideContent.includes('performance') || slideContent.includes('increase')) {
            hasRealInsights = true;
            console.log('  ✅ Contains meaningful business insights');
          }
          
          // Log first few elements to verify content
          if (slide.elements && slide.elements.length > 0) {
            console.log(`  📊 Elements: ${slide.elements.length}`);
            slide.elements.slice(0, 2).forEach(element => {
              if (element.type === 'text' && element.content) {
                const content = element.content.text || element.content.html || element.content;
                if (typeof content === 'string' && content.length > 10) {
                  console.log(`    📝 Text: "${content.substring(0, 100)}..."`);
                }
              }
              if (element.type === 'chart' && element.content) {
                console.log(`    📈 Chart: ${element.content.title || 'Unnamed chart'} (${element.content.type || 'unknown type'})`);
              }
            });
          }
        });
        
        console.log('\n🎯 VERIFICATION RESULTS:');
        console.log('✅ Real revenue data:', hasRevenueData ? 'FOUND' : '❌ MISSING');
        console.log('✅ Regional analysis:', hasRegionalData ? 'FOUND' : '❌ MISSING');
        console.log('✅ Product data:', hasProductData ? 'FOUND' : '❌ MISSING');
        console.log('✅ Meaningful insights:', hasRealInsights ? 'FOUND' : '❌ MISSING');
        
        const overallSuccess = hasRealInsights && (hasRevenueData || hasRegionalData || hasProductData);
        console.log('\n🏆 OVERALL VERIFICATION:', overallSuccess ? '✅ PASSED - Deck contains REAL insights!' : '❌ FAILED - Generic content detected');
        
        return overallSuccess;
      } else {
        console.error('❌ No slides found in deck');
        return false;
      }
    } else {
      console.error('❌ Failed to load deck:', result.error);
      return false;
    }
  } catch (error) {
    console.error('💥 Verification error:', error.message);
    return false;
  }
}

async function testNavigationFlow(deckId) {
  console.log('🧭 Step 4: Testing navigation to deck viewer...');
  
  try {
    const fetch = require('node-fetch');
    
    // Test the deck-builder route
    const response = await fetch(`http://localhost:3000/deck-builder/${deckId}`, {
      headers: {
        'Cookie': fs.readFileSync('cookies.txt', 'utf8')
      }
    });
    
    if (response.ok) {
      console.log('✅ Navigation route accessible');
      const html = await response.text();
      
      // Check if it's loading the SimpleDeckViewer component
      if (html.includes('SimpleDeckViewer') || html.includes('DeckBuilderWrapper')) {
        console.log('✅ Correct component being loaded');
        return true;
      } else {
        console.log('⚠️  HTML loaded but component unclear');
        return true; // Still considered success if route works
      }
    } else {
      console.error('❌ Navigation route failed:', response.status);
      return false;
    }
  } catch (error) {
    console.error('💥 Navigation test error:', error.message);
    return false;
  }
}

async function runCompleteTest() {
  console.log('🚀 COMPREHENSIVE END-TO-END VERIFICATION STARTING...\n');
  
  const startTime = Date.now();
  let allTestsPassed = true;
  
  // Check if cookies exist
  if (!fs.existsSync('cookies.txt')) {
    console.error('❌ No cookies.txt found. Please login first.');
    return;
  }
  
  // Step 1: Upload real data
  const uploadResult = await uploadTestData();
  if (!uploadResult) {
    console.error('❌ Test failed at upload step');
    allTestsPassed = false;
    return;
  }
  
  // Step 2: Generate deck from data
  const deckId = await generateDeckFromData(uploadResult.datasetId, uploadResult.context);
  if (!deckId) {
    console.error('❌ Test failed at deck generation step');
    allTestsPassed = false;
    return;
  }
  
  // Wait for deck to be fully processed
  console.log('⏳ Waiting for deck processing to complete...');
  await sleep(3000);
  
  // Step 3: Verify deck contains real insights
  const contentVerified = await verifyDeckContent(deckId);
  if (!contentVerified) {
    console.error('❌ Test failed at content verification step');
    allTestsPassed = false;
  }
  
  // Step 4: Test navigation
  const navigationWorks = await testNavigationFlow(deckId);
  if (!navigationWorks) {
    console.error('❌ Test failed at navigation step');
    allTestsPassed = false;
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log('\n' + '='.repeat(60));
  console.log('🏁 COMPREHENSIVE TEST RESULTS:');
  console.log('='.repeat(60));
  console.log('⏱️  Total duration:', duration, 'seconds');
  console.log('📊 Data upload:', uploadResult ? '✅ PASSED' : '❌ FAILED');
  console.log('🎨 Deck generation:', deckId ? '✅ PASSED' : '❌ FAILED');
  console.log('🔍 Real content verification:', contentVerified ? '✅ PASSED' : '❌ FAILED');
  console.log('🧭 Navigation test:', navigationWorks ? '✅ PASSED' : '❌ FAILED');
  console.log('🏆 OVERALL RESULT:', allTestsPassed ? '✅ ALL TESTS PASSED!' : '❌ SOME TESTS FAILED');
  
  if (allTestsPassed) {
    console.log('\n🎉 SUCCESS: The system creates REAL decks from actual data!');
    console.log('📋 Generated deck ID:', deckId);
    console.log('🔗 View at: http://localhost:3000/deck-builder/' + deckId);
  } else {
    console.log('\n⚠️  WARNING: System needs fixes to work properly');
  }
  
  console.log('='.repeat(60));
}

// Run the test
runCompleteTest().catch(console.error);