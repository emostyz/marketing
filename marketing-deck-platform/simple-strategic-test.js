#!/usr/bin/env node

// Simple strategic analysis test
const testData = {
  data: [
    {"Date": "2024-01-01", "Revenue": 125000, "Customer_Acquisition_Cost": 45, "Customer_Lifetime_Value": 1200, "Marketing_Spend": 25000, "Customer_Satisfaction": 4.2, "Churn_Rate": 0.05, "Sales_Team_Size": 12},
    {"Date": "2024-02-01", "Revenue": 132000, "Customer_Acquisition_Cost": 42, "Customer_Lifetime_Value": 1250, "Marketing_Spend": 28000, "Customer_Satisfaction": 4.3, "Churn_Rate": 0.04, "Sales_Team_Size": 12},
    {"Date": "2024-03-01", "Revenue": 128000, "Customer_Acquisition_Cost": 48, "Customer_Lifetime_Value": 1180, "Marketing_Spend": 30000, "Customer_Satisfaction": 4.1, "Churn_Rate": 0.06, "Sales_Team_Size": 13},
    {"Date": "2024-04-01", "Revenue": 145000, "Customer_Acquisition_Cost": 38, "Customer_Lifetime_Value": 1300, "Marketing_Spend": 32000, "Customer_Satisfaction": 4.4, "Churn_Rate": 0.03, "Sales_Team_Size": 13},
    {"Date": "2024-05-01", "Revenue": 158000, "Customer_Acquisition_Cost": 35, "Customer_Lifetime_Value": 1350, "Marketing_Spend": 35000, "Customer_Satisfaction": 4.5, "Churn_Rate": 0.03, "Sales_Team_Size": 14}
  ],
  context: {
    industry: "SaaS Technology",
    targetAudience: "C-Suite Executives", 
    businessContext: "Strategic revenue optimization analysis",
    description: "Deep dive into SaaS metrics to uncover hidden drivers"
  },
  timeFrame: {
    start: "2024-01-01",
    end: "2024-12-01",
    dataFrequency: "monthly",
    analysisType: "strategic"
  },
  requirements: {
    slidesCount: 6,
    presentationDuration: 15,
    style: "strategic"
  }
};

console.log('🧪 Testing Strategic Analysis Flow');
console.log('📊 Sample business data:', testData.data.length, 'rows');
console.log('🎯 Expected:', testData.requirements.slidesCount, 'strategic slides with hidden insights');
console.log('\n✅ Test payload prepared - ready for manual testing!');
console.log('\n📋 TO TEST MANUALLY:');
console.log('1. Go to http://localhost:3002/deck-builder/new');  
console.log('2. Upload the sample_business_data.csv file');
console.log('3. Fill in context: "SaaS Technology", "C-Suite Executives", "Strategic revenue optimization"');
console.log('4. Run analysis and verify strategic slides are generated');
console.log('5. Check that 3-4 slides contain hidden insights and strategic patterns');
console.log('\n🔍 WHAT TO LOOK FOR:');
console.log('- Slides with titles like "Hidden Driver:" or "Strategic Analysis:"');
console.log('- Content mentioning "non-obvious", "threshold effects", "early signals"');
console.log('- Charts showing correlations and strategic patterns');
console.log('- Insights that go beyond obvious revenue trends');

console.log('\n📈 EXPECTED STRATEGIC INSIGHTS:');
console.log('- Efficiency threshold effects at specific team sizes');
console.log('- Non-linear correlation between satisfaction and churn');
console.log('- Hidden patterns in customer acquisition cost optimization');
console.log('- Strategic timing signals for scaling decisions');

console.log('\n🎯 SUCCESS CRITERIA:');
console.log('- 50%+ of slides should be strategic-level insights');
console.log('- Content should mention hidden drivers and non-obvious patterns');
console.log('- Charts should reveal correlations, not just basic trends');
console.log('- Recommendations should be strategic and actionable');

// Write test data to file for easy access
require('fs').writeFileSync('./test-analysis-payload.json', JSON.stringify(testData, null, 2));
console.log('\n💾 Test payload saved to: test-analysis-payload.json');
console.log('   Use this for direct API testing if needed');

console.log('\n🚀 Ready for testing! The enhanced prompts should now generate:');
console.log('   - 2-3 foundation slides (basic data and trends)');  
console.log('   - 3-4 strategic insight slides (hidden drivers, patterns)');
console.log('   - 1-2 strategic recommendation slides');
console.log('\nThe system is configured to create McKinsey-level strategic insights! 🎖️');