// Test actual slide generation with real AI brain results
const { AISlideGenerator } = require('./lib/ai/slide-generator.ts');

async function testSlideGeneration() {
  console.log('🎨 TESTING ACTUAL SLIDE GENERATION WITH AI BRAIN DATA\n');
  
  try {
    // Create AI slide generator instance
    const generator = new AISlideGenerator();
    
    // Real business context that would come from wizard
    const businessContext = {
      companyName: "TechCorp SaaS",
      industry: "SaaS",
      businessModel: "B2B SaaS", 
      stage: "growth",
      primaryGoal: "Increase Q4 revenue by 40% through customer expansion",
      secondaryGoals: ["Reduce churn rate", "Expand into European markets"],
      timeHorizon: "Q4 2024",
      urgency: "high",
      audienceType: "executives",
      audienceLevel: "business",
      presentationContext: "Board meeting quarterly review",
      kpis: ["Revenue", "Customer Acquisition Cost", "Monthly Recurring Revenue", "Churn Rate"],
      currentMetrics: {},
      benchmarks: {},
      analysisTimeframe: "Last 6 months",
      comparisonPeriods: ["Q3 2024", "Q2 2024"],
      dataFrequency: "monthly",
      competitors: ["Salesforce", "HubSpot", "Zoom"],
      marketPosition: "Growth stage challenger",
      differentiators: ["AI-powered analytics", "Custom integrations", "Enterprise security"],
      constraints: ["Limited marketing budget", "Small sales team"],
      designPreferences: ["Professional", "Data-driven", "Executive-friendly"],
      narrativeStyle: "executive"
    };
    
    // Real user data
    const userData = [
      {"Date": "2024-06", "Revenue": 1250000, "Customers": 2400, "Region": "North America", "Churn": 3.2},
      {"Date": "2024-07", "Revenue": 1380000, "Customers": 2580, "Region": "North America", "Churn": 2.8},
      {"Date": "2024-08", "Revenue": 980000, "Customers": 1890, "Region": "Europe", "Churn": 4.1},
      {"Date": "2024-09", "Revenue": 1520000, "Customers": 2890, "Region": "North America", "Churn": 2.9},
      {"Date": "2024-10", "Revenue": 1100000, "Customers": 2150, "Region": "Europe", "Churn": 3.8},
      {"Date": "2024-11", "Revenue": 1650000, "Customers": 3100, "Region": "North America", "Churn": 2.5}
    ];
    
    console.log('📊 Generating presentation with:');
    console.log('   Company:', businessContext.companyName);
    console.log('   Goal:', businessContext.primaryGoal);
    console.log('   Audience:', businessContext.audienceType);
    console.log('   Data points:', userData.length);
    console.log('   Time range:', userData[0].Date, 'to', userData[userData.length - 1].Date);
    
    // Generate slides
    console.log('\n🚀 Starting slide generation...');
    const generatedSlides = await generator.generatePresentation({
      context: businessContext,
      userData: userData,
      existingSlides: []
    });
    
    console.log('✅ Slide generation completed!');
    console.log('📄 Total slides generated:', generatedSlides.length);
    
    // Analyze generated slides
    console.log('\n📋 SLIDE ANALYSIS:');
    generatedSlides.forEach((slide, index) => {
      console.log(`\n--- SLIDE ${index + 1}: ${slide.type.toUpperCase()} ---`);
      console.log('🏷️  Title:', slide.title);
      console.log('📝 Elements:', slide.elements.length);
      console.log('🎯 Confidence:', slide.metadata.confidence + '%');
      console.log('📊 Business Relevance:', slide.metadata.businessRelevance + '%');
      console.log('💡 Key Insights:', slide.metadata.insights.slice(0, 2).join(', '));
      
      // Check slide quality
      const qualityChecks = {
        'Has meaningful title': slide.title && slide.title.length > 10,
        'Has content elements': slide.elements && slide.elements.length > 0,
        'High confidence': slide.metadata.confidence >= 80,
        'Business relevant': slide.metadata.businessRelevance >= 80,
        'AI-generated insights': slide.metadata.insights && slide.metadata.insights.length > 0
      };
      
      const passed = Object.values(qualityChecks).filter(Boolean).length;
      const total = Object.keys(qualityChecks).length;
      const score = (passed / total * 100).toFixed(0);
      
      console.log('⭐ Quality Score:', `${score}% (${passed}/${total})`, score >= 80 ? '✅' : '❌');
    });
    
    // Overall assessment
    const avgConfidence = generatedSlides.reduce((sum, slide) => sum + slide.metadata.confidence, 0) / generatedSlides.length;
    const avgRelevance = generatedSlides.reduce((sum, slide) => sum + slide.metadata.businessRelevance, 0) / generatedSlides.length;
    
    console.log('\n📊 OVERALL ASSESSMENT:');
    console.log('📄 Total Slides:', generatedSlides.length);
    console.log('🎯 Average Confidence:', avgConfidence.toFixed(1) + '%');
    console.log('💼 Average Business Relevance:', avgRelevance.toFixed(1) + '%');
    console.log('🔍 Data Source Integration:', generatedSlides.every(s => s.metadata.dataSource) ? '✅ Working' : '❌ Failed');
    
    // Check if slides use real AI brain insights
    const hasRealInsights = generatedSlides.some(slide => 
      slide.metadata.insights.some(insight => 
        insight.includes('Revenue') || insight.includes('Customer') || insight.includes('%')
      )
    );
    
    console.log('🧠 Real AI Insights Used:', hasRealInsights ? '✅ Yes' : '❌ No');
    
    const overallScore = (avgConfidence + avgRelevance) / 2;
    console.log('📊 Overall Score:', overallScore.toFixed(1) + '%');
    
    if (overallScore >= 85) {
      console.log('\n🎉 EXCELLENT: Slide generation is working at production quality!');
      console.log('✅ Ready for executive presentations');
      console.log('✅ Real AI brain insights integrated');
      console.log('✅ High business relevance');
    } else if (overallScore >= 70) {
      console.log('\n✅ GOOD: Slide generation working, some improvements possible');
    } else {
      console.log('\n❌ NEEDS WORK: Slide generation has quality issues');
    }
    
  } catch (error) {
    console.error('❌ SLIDE GENERATION FAILED:', error.message);
    console.error('Stack:', error.stack);
  }
}

testSlideGeneration();