#!/usr/bin/env node

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Simple fetch implementation
function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request({
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          statusCode: res.statusCode,
          json: () => Promise.resolve(JSON.parse(data)),
          text: () => Promise.resolve(data)
        });
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

const BASE_URL = 'http://localhost:3002';

async function testStrategicAnalysisFlow() {
  console.log('🧪 Testing Complete CSV → Strategic Insights → Slides Flow\n');

  try {
    // Test 1: Upload CSV File
    console.log('📤 Step 1: Uploading CSV file...');
    const form = new FormData();
    form.append('file', fs.createReadStream('./sample_business_data.csv'));
    form.append('projectName', 'Strategic SaaS Analysis');

    const uploadResponse = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      body: form
    });

    const uploadResult = await uploadResponse.json();
    
    if (!uploadResult.success) {
      throw new Error(`Upload failed: ${uploadResult.error}`);
    }

    console.log('✅ Upload successful!');
    console.log(`   Files processed: ${uploadResult.totalFiles}`);
    console.log(`   Datasets saved: ${uploadResult.datasets.length}`);
    console.log(`   File types: ${uploadResult.files.map(f => f.fileType).join(', ')}\n`);

    // Test 2: Strategic Analysis with Enhanced Prompts
    console.log('🧠 Step 2: Running Strategic Analysis...');
    
    const analysisPayload = {
      data: [
        {"Date": "2024-01-01", "Revenue": 125000, "Customer_Acquisition_Cost": 45, "Customer_Lifetime_Value": 1200, "Marketing_Spend": 25000, "Product_Category": "Software", "Region": "North", "Customer_Satisfaction": 4.2, "Churn_Rate": 0.05, "Sales_Team_Size": 12, "Economic_Indicator": 2.1},
        {"Date": "2024-02-01", "Revenue": 132000, "Customer_Acquisition_Cost": 42, "Customer_Lifetime_Value": 1250, "Marketing_Spend": 28000, "Product_Category": "Software", "Region": "North", "Customer_Satisfaction": 4.3, "Churn_Rate": 0.04, "Sales_Team_Size": 12, "Economic_Indicator": 2.3},
        {"Date": "2024-03-01", "Revenue": 128000, "Customer_Acquisition_Cost": 48, "Customer_Lifetime_Value": 1180, "Marketing_Spend": 30000, "Product_Category": "Software", "Region": "North", "Customer_Satisfaction": 4.1, "Churn_Rate": 0.06, "Sales_Team_Size": 13, "Economic_Indicator": 2.0},
        {"Date": "2024-04-01", "Revenue": 145000, "Customer_Acquisition_Cost": 38, "Customer_Lifetime_Value": 1300, "Marketing_Spend": 32000, "Product_Category": "Software", "Region": "North", "Customer_Satisfaction": 4.4, "Churn_Rate": 0.03, "Sales_Team_Size": 13, "Economic_Indicator": 2.4},
        {"Date": "2024-05-01", "Revenue": 158000, "Customer_Acquisition_Cost": 35, "Customer_Lifetime_Value": 1350, "Marketing_Spend": 35000, "Product_Category": "Software", "Region": "North", "Customer_Satisfaction": 4.5, "Churn_Rate": 0.03, "Sales_Team_Size": 14, "Economic_Indicator": 2.6},
        {"Date": "2024-06-01", "Revenue": 142000, "Customer_Acquisition_Cost": 52, "Customer_Lifetime_Value": 1280, "Marketing_Spend": 38000, "Product_Category": "Software", "Region": "North", "Customer_Satisfaction": 4.2, "Churn_Rate": 0.07, "Sales_Team_Size": 14, "Economic_Indicator": 2.2}
      ],
      context: {
        industry: "SaaS Technology",
        targetAudience: "C-Suite Executives", 
        businessContext: "Strategic revenue optimization and customer acquisition efficiency analysis",
        description: "Deep dive into SaaS metrics to uncover hidden drivers of revenue performance and customer acquisition efficiency"
      },
      timeFrame: {
        start: "2024-01-01",
        end: "2024-12-01",
        dataFrequency: "monthly",
        analysisType: "strategic_deep_dive"
      },
      requirements: {
        slidesCount: 7,
        presentationDuration: 20,
        style: "strategic",
        focusAreas: ["Hidden Drivers", "Strategic Insights", "Competitive Advantages", "Early Warning Signals"]
      }
    };

    const analysisResponse = await fetch(`${BASE_URL}/api/openai/enhanced-analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(analysisPayload)
    });

    const analysisResult = await analysisResponse.json();
    
    if (!analysisResult.success) {
      throw new Error(`Analysis failed: ${analysisResult.error}`);
    }

    console.log('✅ Strategic Analysis completed!');
    console.log(`   Insights generated: ${analysisResult.result?.insights?.length || 0}`);
    console.log(`   Slides created: ${analysisResult.result?.slideStructure?.length || 0}`);
    console.log(`   Analysis depth: ${analysisResult.metadata?.analysisDepth || 'Unknown'}`);
    console.log(`   Strategic value: ${analysisResult.metadata?.strategicValue || 'Unknown'}`);
    console.log(`   Hidden insights: ${analysisResult.metadata?.hiddenInsightsCount || 0}\n`);

    // Test 3: Analyze Generated Insights
    console.log('🔍 Step 3: Analyzing Generated Strategic Insights...');
    
    const insights = analysisResult.result?.insights || [];
    const slides = analysisResult.result?.slideStructure || [];
    
    console.log('\n📊 INSIGHT BREAKDOWN:');
    insights.forEach((insight, idx) => {
      console.log(`   ${idx + 1}. [${insight.type?.toUpperCase()}] ${insight.title}`);
      console.log(`      Hidden Drivers: ${insight.hiddenDrivers || 'None specified'}`);
      console.log(`      Strategic Value: ${insight.strategicValue || 'None specified'}`);
      console.log(`      Confidence: ${insight.confidence || 'N/A'}%\n`);
    });

    console.log('🎯 SLIDE BREAKDOWN:');
    slides.forEach((slide, idx) => {
      console.log(`   ${idx + 1}. [${slide.type?.toUpperCase()}] ${slide.title}`);
      console.log(`      Insight Level: ${slide.insightLevel || 'basic'}`);
      console.log(`      Hidden Insight: ${slide.content?.hiddenInsight || 'None'}`);
      console.log(`      Charts: ${slide.charts?.length || 0}\n`);
    });

    // Test 4: Verify Strategic Quality
    console.log('🎖️  Step 4: Verifying Strategic Quality...');
    
    const strategicInsights = insights.filter(i => 
      ['strategic', 'hidden_driver', 'early_signal', 'competitive_advantage'].includes(i.type)
    );
    
    const strategicSlides = slides.filter(s => 
      ['hidden_insight', 'strategic_analysis'].includes(s.type) || 
      s.insightLevel === 'strategic' || 
      s.insightLevel === 'breakthrough'
    );

    console.log(`✅ Strategic insights: ${strategicInsights.length}/${insights.length} (${Math.round(strategicInsights.length/insights.length*100)}%)`);
    console.log(`✅ Strategic slides: ${strategicSlides.length}/${slides.length} (${Math.round(strategicSlides.length/slides.length*100)}%)`);
    console.log(`✅ Hidden insights count: ${analysisResult.metadata?.hiddenInsightsCount || 0}`);
    console.log(`✅ Novelty score: ${analysisResult.metadata?.noveltyScore || 0}/100`);
    
    // Success Summary
    console.log('\n🎉 STRATEGIC ANALYSIS FLOW TEST RESULTS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ CSV Upload: SUCCESS`);
    console.log(`✅ Strategic Analysis: SUCCESS`);
    console.log(`✅ Insights Generated: ${insights.length} total, ${strategicInsights.length} strategic`);
    console.log(`✅ Slides Created: ${slides.length} total, ${strategicSlides.length} strategic`);
    console.log(`✅ Hidden Drivers: ${analysisResult.metadata?.hiddenInsightsCount || 0} identified`);
    console.log(`✅ Strategic Value: ${analysisResult.metadata?.strategicValue || 'Generated'}`);
    
    const qualityScore = Math.round(
      (strategicInsights.length / insights.length * 40) +
      (strategicSlides.length / slides.length * 30) +
      ((analysisResult.metadata?.noveltyScore || 0) / 100 * 30)
    );
    
    console.log(`✅ Overall Quality Score: ${qualityScore}/100`);
    
    if (qualityScore >= 70) {
      console.log('🏆 EXCELLENT: Strategic analysis meets high-quality standards!');
    } else if (qualityScore >= 50) {
      console.log('👍 GOOD: Strategic analysis meets basic standards');
    } else {
      console.log('⚠️  NEEDS IMPROVEMENT: Consider enhancing strategic analysis prompts');
    }

    return true;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('   Stack:', error.stack);
    return false;
  }
}

// Run the test
testStrategicAnalysisFlow()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });