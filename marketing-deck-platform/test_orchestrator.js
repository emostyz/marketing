// Test script for orchestrator
import fs from 'fs';
import path from 'path';
import { orchestrateEnhancedDeckGeneration } from './lib/orchestrator.ts';

// Read test CSV data
const csvPath = './test_sales_data.csv';
const csvData = fs.readFileSync(csvPath, 'utf8');

// Mock presentation ID and user context
const testInput = {
  presentationId: 'test-presentation-123',
  csvData: csvData,
  businessContext: 'Business executive wants to understand quarterly sales performance across regions and products',
  userContext: {
    userId: 'test-user-123',
    companyName: 'Test Company',
    industry: 'Technology',
    targetAudience: 'Executive Team'
  },
  options: {
    maxSlides: 6,
    focusAreas: ['performance_analysis', 'regional_comparison', 'product_insights'],
    chartPreferences: ['line', 'bar', 'metrics'],
    includeExecutiveSummary: true
  }
};

console.log('🚀 Testing Enhanced AI Pipeline Orchestrator...');
console.log('📊 Test Data Preview:', csvData.split('\n').slice(0, 3).join('\n'));
console.log('🎯 Business Context:', testInput.businessContext);

async function testOrchestrator() {
  try {
    console.log('\n⏱️  Starting orchestration...');
    const startTime = Date.now();
    
    const result = await orchestrateEnhancedDeckGeneration(testInput);
    
    const duration = Date.now() - startTime;
    console.log(`\n✅ Orchestration completed in ${duration}ms`);
    console.log('🎯 Result Summary:');
    console.log('- Success:', result.success);
    console.log('- Total slides:', result.slideData?.slides?.length || 0);
    console.log('- Charts generated:', result.chartData?.length || 0);
    console.log('- Python analysis quality:', result.pythonAnalysis?.data_quality_score || 'N/A');
    
    if (result.slideData?.slides) {
      console.log('\n📑 Generated Slides:');
      result.slideData.slides.forEach((slide, index) => {
        console.log(`  ${index + 1}. ${slide.title || 'Untitled'} (${slide.layout || 'default'})`);
      });
    }
    
    if (result.errors && result.errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      result.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
    
    // Save results for inspection
    fs.writeFileSync('./test_orchestrator_result.json', JSON.stringify(result, null, 2));
    console.log('\n💾 Full results saved to test_orchestrator_result.json');
    
  } catch (error) {
    console.error('\n❌ Orchestration failed:', error);
    process.exit(1);
  }
}

testOrchestrator();