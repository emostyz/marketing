const https = require('https');
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
    goals: ["increase revenue"],
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
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      try {
        const result = JSON.parse(data);
        console.log('\n=== API SUCCESS ===');
        console.log('Insights:', result.analysis?.strategicInsights?.length || 0);
        
        if (result.analysis?.strategicInsights) {
          result.analysis.strategicInsights.forEach((insight, i) => {
            console.log(`\nInsight ${i + 1}:`);
            console.log('Title:', insight.title);
            console.log('Business Impact:', insight.businessImplication?.substring(0, 100) + '...');
            console.log('Confidence:', insight.confidence);
          });
        }
      } catch (error) {
        console.log('JSON parse error:', error.message);
        console.log('Raw response:', data.substring(0, 500));
      }
    } else {
      console.log('ERROR RESPONSE:', data.substring(0, 500));
    }
  });
});

req.on('error', (e) => {
  console.error(`Request error: ${e.message}`);
});

req.write(testData);
req.end();