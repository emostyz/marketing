const http = require('http');

const data = JSON.stringify({
  datasetId: 'demo-dataset-test',
  context: {
    audience: 'executives',
    goal: 'analyze sales performance',
    timeLimit: 15,
    industry: 'technology',
    decision: 'strategic planning',
    businessContext: 'quarterly review',
    description: 'Sales data analysis for Q4 review'
  }
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/deck/generate-world-class',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('🚀 Testing world-class deck generation...');

const req = http.request(options, (res) => {
  console.log(`📊 Response status: ${res.statusCode}`);
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    try {
      if (res.statusCode === 200) {
        const result = JSON.parse(body);
        console.log('✅ SUCCESS!');
        console.log('📈 Generated slides:', result.slides?.length || 0);
        console.log('📝 Deck title:', result.title);
        console.log('🏷️ Deck ID:', result.deckId);
        
        if (result.slides && result.slides.length > 0) {
          console.log('\n🎯 First slide details:');
          console.log('- Title:', result.slides[0].title);
          console.log('- Type:', result.slides[0].type);  
          console.log('- Content items:', result.slides[0].content?.length || 0);
          console.log('- Charts:', result.slides[0].charts?.length || 0);
          
          console.log('\n📊 Total slides with charts:', 
            result.slides.filter(s => s.charts && s.charts.length > 0).length);
        }
      } else {
        console.log('❌ FAILED with status:', res.statusCode);
        console.log('Error:', body.substring(0, 1000));
      }
    } catch (error) {
      console.log('💥 Failed to parse response:', error.message);
      console.log('Raw response:', body.substring(0, 500));
    }
  });
});

req.on('error', (error) => {
  console.log('💥 Request failed:', error.message);
  console.log('Full error:', error);
});

req.setTimeout(20000, () => {
  console.log('⏰ Request timed out after 20 seconds');
  req.destroy();
});

req.write(data);
req.end();