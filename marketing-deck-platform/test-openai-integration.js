#!/usr/bin/env node

async function testOpenAIIntegration() {
  console.log('🧠 Testing OpenAI Integration...\n');
  
  const baseUrl = 'http://localhost:3004';
  
  const testData = {
    data: [
      {
        period: '2024-01',
        revenue: 75000,
        growth: 15.2,
        category: 'Product A',
        customers: 850
      },
      {
        period: '2024-02', 
        revenue: 82000,
        growth: 18.5,
        category: 'Product B',
        customers: 920
      }
    ],
    context: {
      industry: 'SaaS',
      targetAudience: 'C-level executives',
      businessContext: 'Quarterly growth review',
      description: 'Monthly revenue and customer growth data'
    },
    timeFrame: {
      start: '2024-01',
      end: '2024-12',
      dataFrequency: 'monthly',
      analysisType: 'trend'
    },
    requirements: {
      slidesCount: 8,
      presentationDuration: 15,
      focusAreas: ['Revenue Growth', 'Customer Metrics', 'Recommendations'],
      style: 'modern',
      includeCharts: true,
      includeExecutiveSummary: true
    }
  };

  try {
    console.log('📤 Sending request to OpenAI enhanced-analyze endpoint...');
    
    const response = await fetch(`${baseUrl}/api/openai/enhanced-analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log(`📥 Response status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const result = await response.json();
      console.log('✅ OpenAI Integration Response:');
      console.log('- Success:', result.success);
      
      if (result.result) {
        console.log('- Insights generated:', result.result.insights?.length || 0);
        console.log('- Slides created:', result.result.slideStructure?.length || 0);
        console.log('- Narrative created:', !!result.result.narrative);
        
        if (result.result.insights && result.result.insights.length > 0) {
          console.log('\n📊 Sample Insights:');
          result.result.insights.slice(0, 2).forEach((insight, i) => {
            console.log(`  ${i + 1}. ${insight.title} (${insight.type})`);
            console.log(`     ${insight.description}`);
          });
        }

        if (result.result.slideStructure && result.result.slideStructure.length > 0) {
          console.log('\n📋 Sample Slides:');
          result.result.slideStructure.slice(0, 3).forEach((slide, i) => {
            console.log(`  Slide ${slide.number}: ${slide.title}`);
            console.log(`    Type: ${slide.type}`);
            console.log(`    Charts: ${slide.charts?.length || 0}`);
          });
        }
      }
      
      console.log('\n🎉 OpenAI Integration is WORKING!');
      
      // Test deck creation
      console.log('\n📝 Testing deck creation...');
      const deckResponse = await fetch(`${baseUrl}/api/presentations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Test Deck from OpenAI',
          intakeData: testData,
          analysisResult: result.result,
          slideStructure: result.result?.slideStructure || []
        })
      });

      if (deckResponse.ok) {
        const deckResult = await deckResponse.json();
        console.log('✅ Deck Creation Response:');
        console.log('- Success:', deckResult.success);
        console.log('- Deck ID:', deckResult.presentation?.id);
        console.log('- Slides:', deckResult.presentation?.slides?.length || 0);
        console.log('\n🎉 Deck Creation is WORKING!');
      } else {
        console.log('❌ Deck creation failed:', deckResponse.status);
      }

    } else {
      const error = await response.text();
      console.log('❌ OpenAI Integration failed:');
      console.log('Response:', error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  console.log('\n📋 Summary:');
  console.log('This test checks if:');
  console.log('- OpenAI API key is working');
  console.log('- Enhanced analysis endpoint processes data');
  console.log('- AI generates insights and slides');
  console.log('- Presentations are saved to database');
}

testOpenAIIntegration().catch(console.error);