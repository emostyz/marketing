#!/usr/bin/env node

/**
 * LIVE PIPELINE TESTING AGENT
 * Makes real HTTP requests to test the entire pipeline
 */

const fs = require('fs');

// Real test data - NO DEMO BULLSHIT
const REAL_TEST_DATA = [
  { Date: '2024-01-01', Region: 'North America', Revenue: 125430.50, Units_Sold: 234, Product_Category: 'Software', Customer_Segment: 'Enterprise' },
  { Date: '2024-01-02', Region: 'Europe', Revenue: 89750.25, Units_Sold: 187, Product_Category: 'Hardware', Customer_Segment: 'SMB' },
  { Date: '2024-01-03', Region: 'Asia Pacific', Revenue: 156890.75, Units_Sold: 298, Product_Category: 'Services', Customer_Segment: 'Enterprise' },
  { Date: '2024-01-04', Region: 'North America', Revenue: 143280.00, Units_Sold: 267, Product_Category: 'Software', Customer_Segment: 'Mid-Market' },
  { Date: '2024-01-05', Region: 'Europe', Revenue: 97340.80, Units_Sold: 201, Product_Category: 'Hardware', Customer_Segment: 'SMB' },
  { Date: '2024-01-06', Region: 'Asia Pacific', Revenue: 187650.30, Units_Sold: 342, Product_Category: 'Services', Customer_Segment: 'Enterprise' },
  { Date: '2024-01-07', Region: 'Latin America', Revenue: 67890.45, Units_Sold: 134, Product_Category: 'Software', Customer_Segment: 'SMB' },
  { Date: '2024-01-08', Region: 'Middle East', Revenue: 78340.20, Units_Sold: 156, Product_Category: 'Hardware', Customer_Segment: 'Mid-Market' },
  { Date: '2024-01-09', Region: 'North America', Revenue: 167890.90, Units_Sold: 289, Product_Category: 'Services', Customer_Segment: 'Enterprise' },
  { Date: '2024-01-10', Region: 'Europe', Revenue: 112450.60, Units_Sold: 234, Product_Category: 'Software', Customer_Segment: 'Mid-Market' },
];

class LivePipelineTest {
  constructor() {
    this.errors = [];
    this.results = {};
    this.baseUrl = 'http://localhost:3000';
  }

  log(message, type = 'info') {
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} ${message}`);
    if (type === 'error') this.errors.push(message);
  }

  async testInsightsAPI() {
    this.log('=== TESTING INSIGHTS API ===');
    
    try {
      const testData = JSON.stringify({
        data: REAL_TEST_DATA,
        context: { analysisType: 'insights_generation', industry: 'technology' },
        userFeedback: {},
        learningObjectives: ['Generate strategic insights']
      });

      // Use curl to make real HTTP request
      const { execSync } = require('child_process');
      
      const curlCommand = `curl -s -X POST "${this.baseUrl}/api/ai/ultimate-brain" ` +
        `-H "Content-Type: application/json" ` +
        `-d '${testData}' ` +
        `--max-time 30`;

      this.log('Making real HTTP request to Ultimate Brain API...');
      const response = execSync(curlCommand, { encoding: 'utf8', timeout: 35000 });
      
      let result;
      try {
        result = JSON.parse(response);
      } catch (e) {
        throw new Error(`Invalid JSON response: ${response.substring(0, 200)}`);
      }

      if (!result.success) {
        throw new Error(`API failed: ${result.error}`);
      }

      const insights = result.analysis?.strategicInsights || result.insights || [];
      if (insights.length === 0) {
        throw new Error('NO INSIGHTS GENERATED');
      }

      // Validate insights are real
      for (const insight of insights) {
        if (!insight.title || !insight.description) {
          throw new Error(`Invalid insight: ${JSON.stringify(insight)}`);
        }
        if (insight.title.includes('Demo') || insight.title.includes('Sample')) {
          throw new Error(`DEMO CONTENT DETECTED: ${insight.title}`);
        }
      }

      this.results.insights = insights;
      this.log(`✅ INSIGHTS API WORKS: ${insights.length} real insights generated`, 'success');
      
      // Show examples
      insights.slice(0, 2).forEach((insight, i) => {
        this.log(`📊 Insight ${i+1}: ${insight.title} (${insight.confidence}% confidence)`);
      });

      return true;

    } catch (error) {
      this.log(`INSIGHTS API FAILED: ${error.message}`, 'error');
      return false;
    }
  }

  async testDeckAPI() {
    this.log('=== TESTING DECK GENERATION API ===');
    
    try {
      const testData = JSON.stringify({
        datasetId: 'test-dataset-real-data',
        context: {
          approvedInsights: this.results.insights || [],
          industry: 'technology',
          targetAudience: 'executives',
          presentationGoal: 'strategic review'
        }
      });

      const { execSync } = require('child_process');
      
      const curlCommand = `curl -s -X POST "${this.baseUrl}/api/deck/generate" ` +
        `-H "Content-Type: application/json" ` +
        `-d '${testData}' ` +
        `--max-time 60`;

      this.log('Making real HTTP request to Deck Generation API...');
      const response = execSync(curlCommand, { encoding: 'utf8', timeout: 65000 });
      
      let result;
      try {
        result = JSON.parse(response);
      } catch (e) {
        throw new Error(`Invalid JSON response: ${response.substring(0, 200)}`);
      }

      if (!result.success) {
        throw new Error(`Deck API failed: ${result.error}`);
      }

      if (!result.deckId) {
        throw new Error('NO DECK ID RETURNED');
      }

      if (result.deckId.startsWith('demo-deck-')) {
        throw new Error(`DEMO DECK GENERATED: ${result.deckId} - THIS IS WRONG!`);
      }

      if (!result.slideCount || result.slideCount === 0) {
        throw new Error('NO SLIDES GENERATED');
      }

      this.results.deckId = result.deckId;
      this.results.slideCount = result.slideCount;
      this.log(`✅ DECK API WORKS: Generated deck ${result.deckId} with ${result.slideCount} slides`, 'success');

      return true;

    } catch (error) {
      this.log(`DECK API FAILED: ${error.message}`, 'error');
      return false;
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 LIVE PIPELINE TEST RESULTS');
    console.log('='.repeat(60));
    
    if (this.errors.length === 0) {
      console.log('🎉 ALL TESTS PASSED!');
      console.log('✅ Insights API: WORKING');
      console.log('✅ Deck Generation: WORKING');
      console.log('✅ No demo data detected');
      console.log('✅ Real insights generated');
      console.log('✅ Real deck generated');
    } else {
      console.log('💥 TESTS FAILED!');
      this.errors.forEach(error => console.log(`❌ ${error}`));
    }

    if (this.results.insights) {
      console.log(`\n📊 Generated ${this.results.insights.length} insights:`);
      this.results.insights.forEach((insight, i) => {
        console.log(`   ${i+1}. ${insight.title}`);
      });
    }

    if (this.results.deckId) {
      console.log(`\n📄 Generated deck: ${this.results.deckId}`);
      console.log(`📊 Slide count: ${this.results.slideCount}`);
    }

    console.log('='.repeat(60));
    return this.errors.length === 0;
  }

  async run() {
    console.log('🚀 Starting LIVE pipeline test with REAL HTTP requests...');
    
    // Test insights first
    const insightsWork = await this.testInsightsAPI();
    if (!insightsWork) {
      this.log('Insights API failed - stopping test', 'error');
      return this.generateReport();
    }

    // Test deck generation
    const deckWorks = await this.testDeckAPI();
    
    return this.generateReport();
  }
}

// Run the test
if (require.main === module) {
  const test = new LivePipelineTest();
  test.run().then(success => {
    if (!success) {
      console.log('\n🔧 PIPELINE NEEDS FIXES!');
      process.exit(1);
    } else {
      console.log('\n🎉 PIPELINE IS WORKING CORRECTLY!');
      process.exit(0);
    }
  }).catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
}