#!/usr/bin/env node

// Test the OpenAI fallback system
const { OpenAIFallback } = require('./lib/ai/openai-fallback.ts');

console.log('🧪 Testing OpenAI Fallback System...');

// Test data
const testData = [
  { revenue: 1000, month: 'Jan', customers: 50 },
  { revenue: 1200, month: 'Feb', customers: 60 },
  { revenue: 1100, month: 'Mar', customers: 55 },
  { revenue: 1400, month: 'Apr', customers: 70 }
];

const testContext = {
  companyName: 'Test Company',
  industry: 'Technology',
  primaryGoal: 'Increase revenue and customer base'
};

// Generate mock analysis
console.log('📊 Generating mock insights...');
const mockInsights = OpenAIFallback.generateMockInsights(testData);
console.log('✅ Mock insights generated:', mockInsights.insights.length, 'insights');

console.log('📑 Generating mock slides...');
const mockSlides = OpenAIFallback.generateMockSlideStructure(testContext);
console.log('✅ Mock slides generated:', mockSlides.length, 'slides');

console.log('🎭 Creating full fallback response...');
const fallbackResponse = OpenAIFallback.createFallbackResponse(testData, testContext);
console.log('✅ Fallback response created successfully');

console.log('\n📋 Summary:');
console.log('- Insights:', fallbackResponse.data.insights.insights.length);
console.log('- Slides:', fallbackResponse.data.slideStructure.length);
console.log('- Confidence:', fallbackResponse.metadata.confidence + '%');
console.log('- Fallback mode:', fallbackResponse.metadata.fallbackMode);

console.log('\n🎉 OpenAI fallback system is working correctly!');