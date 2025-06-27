const http = require('http');

// Test the improved insights and complete flow
const testData = JSON.stringify({
  datasetId: 'demo-strategic-analysis',
  context: {
    audience: 'C-suite executives',
    goal: 'quarterly business review and strategic planning',
    timeLimit: 20,
    industry: 'technology',
    decision: 'resource allocation and growth strategy',
    businessContext: 'Q4 performance review with strategic planning for next fiscal year',
    description: 'Comprehensive analysis of sales performance and market opportunities'
  }
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/deck/generate-world-class',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': testData.length
  }
};

console.log('🚀 Testing ENHANCED insights and complete deck generation flow...');
console.log('📊 Context: C-suite quarterly review with strategic planning');

const startTime = Date.now();

const req = http.request(options, (res) => {
  console.log(`📊 Response status: ${res.statusCode}`);
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    try {
      if (res.statusCode === 200) {
        const result = JSON.parse(body);
        console.log('✅ SUCCESS! Deck generation completed');
        console.log(`⏱️ Total processing time: ${duration} seconds`);
        console.log('📈 Generated slides:', result.slides?.length || result.slidesGenerated || 0);
        console.log('📝 Deck title:', result.title || 'Strategic Analysis');
        console.log('🏷️ Deck ID:', result.deckId);
        console.log('🎯 Quality level:', result.quality || 'professional');
        console.log('📊 Quality score:', result.qualityScore || 'N/A');
        
        if (result.slides && result.slides.length > 0) {
          console.log('\n🎯 SLIDE ANALYSIS:');
          result.slides.forEach((slide, index) => {
            console.log(`   Slide ${index + 1}: ${slide.title}`);
            console.log(`   - Type: ${slide.type || 'standard'}`);
            console.log(`   - Content items: ${slide.content?.length || 0}`);
            console.log(`   - Charts: ${slide.charts?.length || 0}`);
            console.log(`   - Elements: ${slide.elements?.length || 0}`);
            if (slide.content && slide.content.length > 0) {
              console.log(`   - Sample content: "${slide.content[0].substring(0, 80)}..."`);
            }
          });
          
          const slidesWithCharts = result.slides.filter(s => s.charts && s.charts.length > 0).length;
          const slidesWithContent = result.slides.filter(s => s.content && s.content.length > 0).length;
          
          console.log('\n📊 CONTENT QUALITY ANALYSIS:');
          console.log(`   ✅ Slides with charts: ${slidesWithCharts}/${result.slides.length}`);
          console.log(`   ✅ Slides with content: ${slidesWithContent}/${result.slides.length}`);
          console.log(`   ✅ Average content per slide: ${(result.slides.reduce((sum, s) => sum + (s.content?.length || 0), 0) / result.slides.length).toFixed(1)} items`);
        }
        
        if (result.debug) {
          console.log('\n🔍 DEBUG INFO:');
          console.log(`   - AI enhanced slides: ${result.debug.aiEnhancedSlides || 0}`);
          console.log(`   - Saved to database: ${result.debug.savedToDatabase ? 'Yes' : 'No'}`);
          console.log(`   - Has elements: ${result.debug.hasElements ? 'Yes' : 'No'}`);
        }
        
        console.log('\n🎉 DECK GENERATION TEST: PASSED ✅');
        console.log('🚀 Ready for user interaction and presentation creation!');
        
      } else {
        console.log('❌ FAILED with status:', res.statusCode);
        console.log('Error response:', body.substring(0, 1000));
      }
    } catch (error) {
      console.log('💥 Failed to parse response:', error.message);
      console.log('Raw response:', body.substring(0, 500));
    }
  });
});

req.on('error', (error) => {
  console.log('💥 Request failed:', error.message);
});

req.setTimeout(30000, () => {
  console.log('⏰ Request timed out after 30 seconds');
  req.destroy();
});

req.write(testData);
req.end();