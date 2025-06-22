// Test EnhancedBrainV2 import and instantiation
import { EnhancedBrainV2 } from './lib/ai/enhanced-brain-v2.ts';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testBrainImport() {
  console.log('🧪 Testing EnhancedBrainV2 import and instantiation...\n');
  
  try {
    console.log('1. Checking environment variables...');
    console.log('OPENAI_API_KEY present:', !!process.env.OPENAI_API_KEY);
    console.log('OPENAI_API_KEY starts with:', process.env.OPENAI_API_KEY?.substring(0, 10) + '...');
    
    console.log('\n2. Importing EnhancedBrainV2...');
    console.log('EnhancedBrainV2 class:', typeof EnhancedBrainV2);
    console.log('EnhancedBrainV2 constructor:', typeof EnhancedBrainV2.prototype.constructor);
    
    console.log('\n3. Instantiating EnhancedBrainV2...');
    const brain = new EnhancedBrainV2(process.env.OPENAI_API_KEY);
    console.log('Brain instance created:', !!brain);
    console.log('Brain analyzeData method:', typeof brain.analyzeData);
    
    console.log('\n4. Testing with minimal data...');
    const testData = [{ test: 'data' }];
    const testContext = {
      description: 'test',
      factors: ['test'],
      industry: 'test',
      businessContext: 'test',
      dataQuality: 'good',
      dataSource: 'test',
      collectionMethod: 'test',
      lastUpdated: '2024-01-01',
      confidence: 80
    };
    const testTimeFrame = {
      primaryPeriod: { start: '2024-01-01', end: '2024-01-31', label: 'test' },
      analysisType: 'm/m',
      includeTrends: true,
      includeSeasonality: false,
      includeOutliers: false
    };
    const testRequirements = {
      slideCount: 1,
      targetDuration: 1,
      structure: 'ai_suggested',
      keyPoints: ['test'],
      slideDescriptions: [],
      audienceType: 'executive',
      presentationStyle: 'formal',
      includeAppendix: false,
      includeSources: false
    };
    
    console.log('Calling analyzeData...');
    const result = await brain.analyzeData(testData, testContext, testTimeFrame, testRequirements);
    console.log('✅ analyzeData completed successfully!');
    console.log('Result insights count:', result.insights.length);
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return false;
  }
}

testBrainImport().then(success => {
  console.log('\n🎯 Import test result:', success ? 'PASSED' : 'FAILED');
  process.exit(success ? 0 : 1);
}); 