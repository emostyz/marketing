const http = require('http');

// Test the complete slide generation with real data and show actual output
async function testRealSlideGeneration() {
    console.log('🎯 TESTING REAL SLIDE GENERATION WITH ACTUAL OUTPUT\n');
    
    const realData = [
        {"Date": "2024-01", "Revenue": 450000, "Customers": 1200, "Region": "North America", "Churn_Rate": 3.2, "CAC": 180, "MRR": 85000, "Growth_Rate": 15.2},
        {"Date": "2024-02", "Revenue": 520000, "Customers": 1350, "Region": "North America", "Churn_Rate": 2.8, "CAC": 165, "MRR": 95000, "Growth_Rate": 18.5},
        {"Date": "2024-03", "Revenue": 380000, "Customers": 980, "Region": "Europe", "Churn_Rate": 4.1, "CAC": 220, "MRR": 72000, "Growth_Rate": 8.3},
        {"Date": "2024-04", "Revenue": 610000, "Customers": 1580, "Region": "North America", "Churn_Rate": 2.9, "CAC": 155, "MRR": 115000, "Growth_Rate": 22.1},
        {"Date": "2024-05", "Revenue": 420000, "Customers": 1100, "Region": "Europe", "Churn_Rate": 3.8, "CAC": 210, "MRR": 78000, "Growth_Rate": 12.7}
    ];

    const businessContext = {
        industry: "SaaS",
        goals: ["Increase Q4 revenue by 40%", "Reduce customer churn", "Expand European market"],
        targetAudience: "executives",
        timeHorizon: "Q4 2024",
        companyName: "TechCorp SaaS",
        primaryGoal: "Accelerate revenue growth through strategic market expansion"
    };

    try {
        console.log('📊 Calling AI Brain with real SaaS data...');
        console.log(`   Company: ${businessContext.companyName}`);
        console.log(`   Goal: ${businessContext.primaryGoal}`);
        console.log(`   Data points: ${realData.length} months of performance data`);
        console.log(`   Audience: ${businessContext.targetAudience}`);
        
        const result = await makeAPICall('/api/ai/ultimate-brain', {
            data: realData,
            context: businessContext
        });

        if (result.success && result.analysis) {
            console.log('\n✅ AI BRAIN ANALYSIS COMPLETE');
            console.log(`📈 Insights Generated: ${result.analysis.strategicInsights?.length || 0}`);
            console.log(`🎯 Confidence: ${result.analysis.overallConfidence}%`);
            console.log(`📊 Visualizations: ${result.analysis.visualizations?.length || 0}`);
            
            // Show actual insights generated
            console.log('\n🧠 ACTUAL AI-GENERATED INSIGHTS:');
            console.log('=====================================');
            
            if (result.analysis.strategicInsights) {
                result.analysis.strategicInsights.forEach((insight, index) => {
                    console.log(`\n📋 INSIGHT ${index + 1}:`);
                    console.log(`Title: ${insight.title}`);
                    console.log(`Description: ${insight.description}`);
                    console.log(`Business Impact: ${insight.businessImplication}`);
                    console.log(`Confidence: ${insight.confidence}%`);
                    console.log(`Evidence: ${insight.evidence.join(', ')}`);
                    console.log(`Source: ${insight.learningSource}`);
                });
            }

            // Generate actual slide content
            console.log('\n🎨 GENERATING ACTUAL SLIDES:');
            console.log('============================');
            
            generateActualSlides(result.analysis, businessContext, realData);
            
        } else {
            console.log('❌ AI Brain failed or returned invalid data');
            console.log('Response:', JSON.stringify(result, null, 2));
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

function generateActualSlides(analysis, context, data) {
    
    // SLIDE 1: TITLE SLIDE
    console.log('\n📄 SLIDE 1: TITLE SLIDE');
    console.log('┌────────────────────────────────────────────────┐');
    console.log(`│                                                │`);
    console.log(`│              ${context.companyName.padStart(20).padEnd(40)}              │`);
    console.log(`│                                                │`);
    console.log(`│        ${context.primaryGoal.substring(0, 40).padStart(25).padEnd(40)}        │`);
    console.log(`│                                                │`);
    console.log(`│         Executive Briefing • ${context.timeHorizon}          │`);
    console.log(`│                                                │`);
    console.log(`│              AI-Powered Analysis               │`);
    console.log(`│                                                │`);
    console.log('└────────────────────────────────────────────────┘');

    // SLIDE 2: KEY METRICS
    const totalRevenue = data.reduce((sum, row) => sum + row.Revenue, 0);
    const avgCustomers = Math.round(data.reduce((sum, row) => sum + row.Customers, 0) / data.length);
    const avgChurn = (data.reduce((sum, row) => sum + row.Churn_Rate, 0) / data.length).toFixed(1);
    const avgGrowth = (data.reduce((sum, row) => sum + row.Growth_Rate, 0) / data.length).toFixed(1);
    
    console.log('\n📄 SLIDE 2: KEY METRICS DASHBOARD');
    console.log('┌────────────────────────────────────────────────┐');
    console.log(`│              Key Performance Metrics          │`);
    console.log(`│                                                │`);
    console.log(`│  ┌──────────────┐    ┌──────────────┐         │`);
    console.log(`│  │   Revenue    │    │  Customers   │         │`);
    console.log(`│  │  $${(totalRevenue/1000000).toFixed(1)}M Total  │    │   ${avgCustomers} Avg    │         │`);
    console.log(`│  │   ↗ Growing  │    │  ↗ +${avgGrowth}%     │         │`);
    console.log(`│  └──────────────┘    └──────────────┘         │`);
    console.log(`│                                                │`);
    console.log(`│  ┌──────────────┐    ┌──────────────┐         │`);
    console.log(`│  │  Churn Rate  │    │ Growth Rate  │         │`);
    console.log(`│  │    ${avgChurn}%      │    │    ${avgGrowth}%     │         │`);
    console.log(`│  │ ⚠ Attention  │    │  ↗ Strong   │         │`);
    console.log(`│  └──────────────┘    └──────────────┘         │`);
    console.log(`│                                                │`);
    console.log('└────────────────────────────────────────────────┘');

    // SLIDE 3: AI INSIGHTS
    console.log('\n📄 SLIDE 3: AI-GENERATED STRATEGIC INSIGHTS');
    console.log('┌────────────────────────────────────────────────┐');
    console.log(`│         AI-Generated Strategic Insights       │`);
    console.log(`│                                                │`);
    
    if (analysis.strategicInsights && analysis.strategicInsights.length > 0) {
        analysis.strategicInsights.slice(0, 2).forEach((insight, index) => {
            const title = insight.title.substring(0, 42);
            const description = insight.description.substring(0, 84);
            const impact = insight.businessImplication.substring(0, 84);
            
            console.log(`│  📋 ${(index + 1)}. ${title.padEnd(40)} │`);
            console.log(`│                                                │`);
            console.log(`│     ${description.substring(0, 42).padEnd(42)} │`);
            console.log(`│     ${description.substring(42, 84).padEnd(42)} │`);
            console.log(`│                                                │`);
            console.log(`│     💡 ${impact.substring(0, 39).padEnd(39)} │`);
            console.log(`│     ${impact.substring(39, 78).padEnd(42)} │`);
            console.log(`│                                                │`);
            console.log(`│     Confidence: ${insight.confidence}%                     │`);
            console.log(`│                                                │`);
        });
    } else {
        console.log(`│     No insights generated                      │`);
    }
    
    console.log('└────────────────────────────────────────────────┘');

    // SLIDE 4: RECOMMENDATIONS
    console.log('\n📄 SLIDE 4: STRATEGIC RECOMMENDATIONS');
    console.log('┌────────────────────────────────────────────────┐');
    console.log(`│           Strategic Recommendations            │`);
    console.log(`│                                                │`);
    
    const recommendations = analysis.recommendations || [];
    if (recommendations.length > 0) {
        recommendations.slice(0, 2).forEach((rec, index) => {
            console.log(`│  ${index + 1}. ${rec.title.substring(0, 38).padEnd(38)} │`);
            console.log(`│     ${rec.description.substring(0, 42).padEnd(42)} │`);
            console.log(`│     Timeline: ${rec.timeline}                      │`);
            console.log(`│     Expected ROI: ${rec.expectedROI ? (rec.expectedROI * 100).toFixed(0) + '%' : 'TBD'}                     │`);
            console.log(`│                                                │`);
        });
    }
    
    // Add key insight as recommendation
    if (analysis.strategicInsights && analysis.strategicInsights.length > 0) {
        const keyInsight = analysis.strategicInsights[0];
        console.log(`│  Key Action: ${keyInsight.title.substring(0, 28).padEnd(28)} │`);
        console.log(`│  ${keyInsight.businessImplication.substring(0, 44).padEnd(44)} │`);
        console.log(`│  ${keyInsight.businessImplication.substring(44, 88).padEnd(44)} │`);
    }
    
    console.log(`│                                                │`);
    console.log(`│  Next Steps: Review with leadership team      │`);
    console.log('└────────────────────────────────────────────────┘');

    console.log('\n🎯 SLIDE GENERATION COMPLETE!');
    console.log(`✅ Generated 4 professional slides`);
    console.log(`📊 Used ${analysis.strategicInsights?.length || 0} AI insights`);
    console.log(`🎯 ${analysis.overallConfidence}% confidence level`);
    console.log(`📈 Ready for executive presentation`);
}

function makeAPICall(path, data) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(data);
        
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        resolve(JSON.parse(responseData));
                    } catch (error) {
                        reject(new Error('Invalid JSON response'));
                    }
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${responseData.substring(0, 200)}`));
                }
            });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

// Run the test
testRealSlideGeneration();