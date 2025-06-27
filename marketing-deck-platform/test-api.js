const testData = {
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
};

async function testAPI() {
  try {
    console.log('Testing AI Brain API...');
    
    const response = await fetch('http://localhost:3000/api/ai/ultimate-brain', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      return;
    }

    const result = await response.json();
    
    console.log('\n=== API RESPONSE ===');
    console.log('Success:', result.success);
    console.log('Insights found:', result.analysis?.strategicInsights?.length || 0);
    
    if (result.analysis?.strategicInsights) {
      console.log('\n=== INSIGHTS QUALITY CHECK ===');
      result.analysis.strategicInsights.forEach((insight, i) => {
        console.log(`\nInsight ${i + 1}:`);
        console.log('Title:', insight.title);
        console.log('Description:', insight.description);
        console.log('Business Impact:', insight.businessImplication);
        console.log('Confidence:', insight.confidence);
        console.log('Evidence:', insight.evidence);
      });
    }
    
    console.log('\n=== OVERALL ASSESSMENT ===');
    console.log('Total insights:', result.analysis?.strategicInsights?.length || 0);
    console.log('Average confidence:', result.analysis?.overallConfidence || 'N/A');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testAPI();