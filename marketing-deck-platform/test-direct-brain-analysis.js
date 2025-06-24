#!/usr/bin/env node

/**
 * Direct Test of OpenAI Brain Analysis with Real Business Data
 */

const fs = require('fs');
const csv = require('csv-parser');

async function loadTestData() {
  return new Promise((resolve, reject) => {
    const data = [];
    fs.createReadStream('./test-business-data.csv')
      .pipe(csv())
      .on('data', (row) => data.push(row))
      .on('end', () => {
        console.log(`✅ Loaded ${data.length} rows of test data`);
        console.log('📊 Sample data:', data[0]);
        resolve(data);
      })
      .on('error', reject);
  });
}

async function testBrainAnalysis(data) {
  console.log('🧠 Testing OpenAI Brain Analysis...');
  
  const analysisPayload = {
    data: data,
    context: {
      industry: 'Technology',
      businessContext: 'SaaS revenue growth analysis for quarterly business review',
      description: 'Monthly revenue, customer, and product performance data with regional breakdown',
      dataQuality: 'excellent',
      factors: ['product launches', 'seasonal trends', 'regional expansion', 'competitive dynamics']
    },
    timeFrame: {
      start: '2024-01-01',
      end: '2024-12-01',
      dataFrequency: 'monthly',
      comparisons: ['yy', 'qq']
    },
    requirements: {
      slidesCount: 8,
      presentationDuration: 15,
      style: 'professional',
      focusAreas: ['revenue growth', 'customer acquisition', 'product performance', 'regional analysis']
    },
    userFeedback: []
  };

  console.log('📤 Sending analysis request...');
  
  try {
    const response = await fetch('http://localhost:3000/api/openai/enhanced-analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(analysisPayload)
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('❌ Analysis failed:', result);
      return null;
    }

    console.log('✅ Analysis completed successfully!');
    console.log('📊 Analysis Results Summary:');
    console.log(`   - Insights generated: ${result.result.insights?.length || 0}`);
    console.log(`   - Slides created: ${result.result.slideStructure?.length || 0}`);
    console.log(`   - Confidence score: ${result.metadata?.confidence || 'N/A'}`);
    console.log(`   - Novelty score: ${result.metadata?.noveltyScore || 'N/A'}`);
    console.log(`   - Business impact: ${result.metadata?.businessImpact || 'N/A'}`);

    // Display sample insights
    if (result.result.insights && result.result.insights.length > 0) {
      console.log('\n💡 Sample Insights:');
      result.result.insights.slice(0, 3).forEach((insight, i) => {
        console.log(`   ${i+1}. ${insight.title}`);
        console.log(`      Type: ${insight.type}, Confidence: ${insight.confidence}%`);
        console.log(`      Impact: ${insight.businessImplication || insight.description}`);
      });
    }

    // Display slide structure
    if (result.result.slideStructure && result.result.slideStructure.length > 0) {
      console.log('\n📋 Slide Structure:');
      result.result.slideStructure.forEach((slide, i) => {
        console.log(`   Slide ${i+1}: ${slide.title}`);
        console.log(`      Type: ${slide.type}, Insight Level: ${slide.insightLevel || 'standard'}`);
      });
    }

    // Display narrative theme
    if (result.result.narrative) {
      console.log('\n📖 Narrative Theme:');
      console.log(`   Theme: ${result.result.narrative.theme}`);
      console.log(`   Call to Action: ${result.result.narrative.callToAction}`);
    }

    console.log('\n🎯 Test Result: OpenAI Brain Analysis is WORKING with real data!');
    
    return result;

  } catch (error) {
    console.error('❌ Analysis request failed:', error.message);
    return null;
  }
}

async function testSlideBuilding(analysisResult) {
  console.log('\n🏗️ Testing Slide Building Functionality...');
  
  if (!analysisResult || !analysisResult.result) {
    console.log('⚠️ Skipping slide building test - no analysis result');
    return false;
  }

  // Test creating a presentation from analysis
  const presentationPayload = {
    title: 'Q4 Business Review - Data-Driven Insights',
    slides: analysisResult.result.slideStructure,
    metadata: {
      analysisResult: analysisResult.result,
      generatedAt: new Date().toISOString(),
      dataSource: 'test-business-data.csv'
    }
  };

  try {
    const response = await fetch('http://localhost:3000/api/presentations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(presentationPayload)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Presentation created successfully!');
      console.log(`   Presentation ID: ${result.id}`);
      console.log(`   Slides count: ${result.slides?.length || 0}`);
      console.log('\n🎯 Test Result: Slide Building is WORKING!');
      return true;
    } else {
      console.log('❌ Presentation creation failed:', result);
      return false;
    }

  } catch (error) {
    console.error('❌ Slide building request failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Direct OpenAI Brain & Slide Building Test');
  console.log('=====================================================');
  
  try {
    // Load test data
    const testData = await loadTestData();
    
    // Test brain analysis
    const analysisResult = await testBrainAnalysis(testData);
    
    // Test slide building
    const slideResult = await testSlideBuilding(analysisResult);
    
    // Final assessment
    console.log('\n📊 FINAL QA ASSESSMENT:');
    console.log('========================');
    
    if (analysisResult && slideResult) {
      console.log('✅ OpenAI Brain Analysis: WORKING');
      console.log('✅ Slide Generation: WORKING');
      console.log('✅ End-to-End Workflow: FUNCTIONAL');
      console.log('\n🎉 CONCLUSION: System is ready for production use with real data!');
      process.exit(0);
    } else if (analysisResult) {
      console.log('✅ OpenAI Brain Analysis: WORKING');
      console.log('❌ Slide Generation: NEEDS FIXES');
      console.log('⚠️ End-to-End Workflow: PARTIALLY FUNCTIONAL');
      console.log('\n⚠️ CONCLUSION: Core analysis works, slide building needs attention');
      process.exit(1);
    } else {
      console.log('❌ OpenAI Brain Analysis: FAILED');
      console.log('❌ Slide Generation: UNTESTED');
      console.log('❌ End-to-End Workflow: BROKEN');
      console.log('\n❌ CONCLUSION: Major fixes needed before production');
      process.exit(2);
    }

  } catch (error) {
    console.error('💥 Test failed with error:', error.message);
    console.error(error.stack);
    process.exit(3);
  }
}

if (require.main === module) {
  main();
}