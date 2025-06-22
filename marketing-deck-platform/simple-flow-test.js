#!/usr/bin/env node

// Simple flow test using curl commands
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function runSimpleFlowTest() {
  console.log('🧪 Simple Flow Test - Using Curl Commands\n');
  
  try {
    // Test 1: Upload CSV file
    console.log('Step 1: Testing file upload...');
    const uploadCmd = `curl -s -X POST http://localhost:3000/api/upload -H "Cookie: demo-user=true" -F "file=@test-data.csv"`;
    const uploadResult = await execAsync(uploadCmd);
    
    if (!uploadResult.stdout) {
      throw new Error('Upload returned empty response');
    }
    
    let uploadData;
    try {
      uploadData = JSON.parse(uploadResult.stdout);
    } catch (e) {
      throw new Error(`Upload returned invalid JSON: ${uploadResult.stdout.substring(0, 200)}`);
    }
    
    if (!uploadData.success) {
      throw new Error(`Upload failed: ${uploadData.error || 'Unknown error'}`);
    }
    
    console.log('✅ Upload successful');
    console.log(`   - File: ${uploadData.file.name}`);
    console.log(`   - Rows: ${uploadData.parsedData.rowCount}`);
    console.log(`   - Data Quality: ${uploadData.insights.dataQuality}`);
    
    // Test 2: Test analysis endpoint
    console.log('\nStep 2: Testing AI analysis...');
    const analysisCmd = `curl -s -X POST http://localhost:3000/api/openai/enhanced-analyze -H "Content-Type: application/json" -H "Cookie: demo-user=true" -d @test-analyze-payload.json`;
    const analysisResult = await execAsync(analysisCmd);
    
    if (!analysisResult.stdout) {
      throw new Error('Analysis returned empty response');
    }
    
    let analysisData;
    try {
      analysisData = JSON.parse(analysisResult.stdout);
    } catch (e) {
      throw new Error(`Analysis returned invalid JSON: ${analysisResult.stdout.substring(0, 200)}`);
    }
    
    if (!analysisData.success) {
      throw new Error(`Analysis failed: ${analysisData.error || 'Unknown error'}`);
    }
    
    console.log('✅ Analysis successful');
    console.log(`   - Insights: ${analysisData.metadata.insightsCount}`);
    console.log(`   - Slides: ${analysisData.metadata.slidesCount}`);
    console.log(`   - Confidence: ${analysisData.metadata.confidence}%`);
    
    // Test 3: Test deck builder route
    console.log('\nStep 3: Testing deck builder route...');
    const deckCmd = `curl -s -I http://localhost:3000/deck-builder/new -H "Cookie: demo-user=true"`;
    const deckResult = await execAsync(deckCmd);
    
    if (!deckResult.stdout.includes('200 OK')) {
      throw new Error(`Deck builder route failed: ${deckResult.stdout}`);
    }
    
    console.log('✅ Deck builder accessible');
    
    console.log('\n🎉 Simple Flow Test PASSED!');
    console.log('\n📊 Summary:');
    console.log('   ✅ File upload working');
    console.log('   ✅ AI analysis working'); 
    console.log('   ✅ Deck builder route accessible');
    console.log('   ✅ Demo authentication working');
    console.log('   ✅ Data parsing working');
    
  } catch (error) {
    console.error('❌ Simple Flow Test FAILED:', error.message);
    if (error.stderr) {
      console.error('STDERR:', error.stderr);
    }
    if (error.stdout) {
      console.error('STDOUT:', error.stdout);
    }
    process.exit(1);
  }
}

runSimpleFlowTest();