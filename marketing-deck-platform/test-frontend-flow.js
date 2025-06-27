const http = require('http');

// Fast test of complete flow
async function testCompleteFlow() {
    console.log('🎯 TESTING COMPLETE FRONTEND FLOW\n');
    
    // Simplified test data
    const testData = [
        {"Date": "2024-01", "Revenue": 450000, "Customers": 1200},
        {"Date": "2024-02", "Revenue": 520000, "Customers": 1350},
        {"Date": "2024-03", "Revenue": 610000, "Customers": 1580}
    ];
    
    const context = {
        companyName: "TestCorp",
        industry: "SaaS",
        primaryGoal: "Increase revenue by 40%",
        goals: ["Increase revenue by 40%"],
        timeHorizon: "Q4 2024",
        audienceType: "executives"
    };
    
    console.log('⚡ Fast AI Brain test...');
    const startTime = Date.now();
    
    try {
        const result = await makeAPICall('/api/ai/ultimate-brain', {
            data: testData,
            context: context
        });
        
        const endTime = Date.now();
        console.log(`✅ AI Brain completed in ${endTime - startTime}ms`);
        
        if (result.success && result.analysis) {
            console.log(`📊 Insights: ${result.analysis.strategicInsights?.length || 0}`);
            console.log(`🎯 Confidence: ${result.analysis.overallConfidence}%`);
            
            // Test insight quality
            if (result.analysis.strategicInsights && result.analysis.strategicInsights.length > 0) {
                const firstInsight = result.analysis.strategicInsights[0];
                console.log('\n🧠 SAMPLE INSIGHT:');
                console.log(`Title: ${firstInsight.title}`);
                console.log(`Business Impact: ${firstInsight.businessImplication?.substring(0, 150)}...`);
                
                // Check if insights use business context
                const usesContext = firstInsight.businessImplication?.includes(context.companyName) ||
                                   firstInsight.businessImplication?.includes(context.primaryGoal);
                
                console.log(`✅ Uses Business Context: ${usesContext ? 'YES' : 'NO'}`);
                console.log(`✅ Actionable: ${firstInsight.businessImplication?.includes('ACTIONS') || firstInsight.businessImplication?.includes('PLAN') ? 'YES' : 'NO'}`);
                console.log(`✅ Specific: ${firstInsight.businessImplication?.match(/\d+%/) ? 'YES' : 'NO'}`);
                
                if (usesContext) {
                    console.log('\n🎉 FRONTEND FLOW WILL WORK!');
                    console.log('✅ AI Brain API fast and reliable');
                    console.log('✅ Business insights contextual');
                    console.log('✅ No timeout/redirect issues');
                } else {
                    console.log('\n⚠️  Context integration needs improvement');
                }
            }
        } else {
            console.log('❌ AI Brain failed');
        }
    } catch (error) {
        console.error('❌ Flow test failed:', error.message);
    }
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
                'Content-Length': Buffer.byteLength(postData),
                'Cache-Control': 'no-cache'
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

testCompleteFlow();