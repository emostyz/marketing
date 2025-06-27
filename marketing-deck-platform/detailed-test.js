const http = require('http');

const testData = JSON.stringify({
  data: [
    {"Date": "2024-01", "Revenue": 45000, "Customers": 1200, "Region": "North America"},
    {"Date": "2024-02", "Revenue": 52000, "Customers": 1350, "Region": "North America"},
    {"Date": "2024-03", "Revenue": 38000, "Customers": 980, "Region": "Europe"},
    {"Date": "2024-04", "Revenue": 61000, "Customers": 1580, "Region": "North America"},
    {"Date": "2024-05", "Revenue": 42000, "Customers": 1100, "Region": "Europe"}
  ],
  context: {
    industry: "SaaS",
    goals: ["increase revenue", "expand market share"],
    targetAudience: "executives"
  }
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/ai/ultimate-brain',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(testData)
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      const result = JSON.parse(data);
      
      console.log('=== AI BRAIN QUALITY ASSESSMENT ===\n');
      console.log('✅ SUCCESS: API Working');
      console.log('📊 Total Insights:', result.analysis.strategicInsights.length);
      console.log('🎯 Average Confidence:', result.analysis.overallConfidence + '%');
      console.log('📈 Visualizations:', result.analysis.visualizations.length);
      
      console.log('\n=== INSIGHT QUALITY REVIEW ===');
      result.analysis.strategicInsights.forEach((insight, i) => {
        console.log(`\n--- INSIGHT ${i + 1} ---`);
        console.log('📋 Title:', insight.title);
        console.log('📝 Description:', insight.description);
        console.log('💡 Business Impact:', insight.businessImplication);
        console.log('🎯 Confidence:', insight.confidence + '%');
        console.log('📊 Evidence:', insight.evidence);
        console.log('🔍 Source:', insight.learningSource);
        
        // Quality assessment
        const hasTitle = insight.title && insight.title.length > 10;
        const hasDescription = insight.description && insight.description.length > 20;
        const hasImpact = insight.businessImplication && insight.businessImplication.length > 50;
        const hasEvidence = insight.evidence && insight.evidence.length > 0;
        
        const qualityScore = [hasTitle, hasDescription, hasImpact, hasEvidence].filter(Boolean).length;
        console.log('⭐ Quality Score:', `${qualityScore}/4`, qualityScore >= 3 ? '✅ GOOD' : '❌ NEEDS WORK');
      });
      
      console.log('\n=== OVERALL ASSESSMENT ===');
      const avgQuality = result.analysis.strategicInsights.map(insight => {
        const hasTitle = insight.title && insight.title.length > 10;
        const hasDescription = insight.description && insight.description.length > 20;
        const hasImpact = insight.businessImplication && insight.businessImplication.length > 50;
        const hasEvidence = insight.evidence && insight.evidence.length > 0;
        return [hasTitle, hasDescription, hasImpact, hasEvidence].filter(Boolean).length;
      }).reduce((a, b) => a + b, 0) / result.analysis.strategicInsights.length;
      
      console.log('📊 Average Quality Score:', (avgQuality / 4 * 100).toFixed(1) + '%');
      console.log('🎯 Production Ready:', avgQuality >= 3.5 ? '✅ YES' : '❌ NO');
      
      if (avgQuality >= 3.5) {
        console.log('\n🎉 CONGRATULATIONS: AI Brain is generating world-class insights!');
      } else {
        console.log('\n⚠️  NEEDS IMPROVEMENT: Some insights are still generic or incomplete.');
      }
      
    } else {
      console.log('❌ API FAILED:', res.statusCode, data);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Request error: ${e.message}`);
});

req.write(testData);
req.end();