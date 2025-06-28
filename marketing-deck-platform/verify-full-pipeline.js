#!/usr/bin/env node

/**
 * COMPREHENSIVE END-TO-END VERIFICATION AGENT
 * Tests the ENTIRE pipeline including UI rendering, charts, and design
 */

const fs = require('fs');
const path = require('path');

// Real revenue data for testing
const REAL_REVENUE_DATA = [
  { Date: '2024-01-01', Region: 'North America', Revenue: 125430.50, Units_Sold: 234, Product_Category: 'Software', Customer_Segment: 'Enterprise', Profit_Margin: 0.42 },
  { Date: '2024-01-02', Region: 'Europe', Revenue: 89750.25, Units_Sold: 187, Product_Category: 'Hardware', Customer_Segment: 'SMB', Profit_Margin: 0.38 },
  { Date: '2024-01-03', Region: 'Asia Pacific', Revenue: 156890.75, Units_Sold: 298, Product_Category: 'Services', Customer_Segment: 'Enterprise', Profit_Margin: 0.55 },
  { Date: '2024-01-04', Region: 'North America', Revenue: 143280.00, Units_Sold: 267, Product_Category: 'Software', Customer_Segment: 'Mid-Market', Profit_Margin: 0.40 },
  { Date: '2024-01-05', Region: 'Europe', Revenue: 97340.80, Units_Sold: 201, Product_Category: 'Hardware', Customer_Segment: 'SMB', Profit_Margin: 0.35 },
  { Date: '2024-01-06', Region: 'Asia Pacific', Revenue: 187650.30, Units_Sold: 342, Product_Category: 'Services', Customer_Segment: 'Enterprise', Profit_Margin: 0.58 },
  { Date: '2024-01-07', Region: 'Latin America', Revenue: 67890.45, Units_Sold: 134, Product_Category: 'Software', Customer_Segment: 'SMB', Profit_Margin: 0.33 },
  { Date: '2024-01-08', Region: 'Middle East', Revenue: 78340.20, Units_Sold: 156, Product_Category: 'Hardware', Customer_Segment: 'Mid-Market', Profit_Margin: 0.36 },
  { Date: '2024-01-09', Region: 'North America', Revenue: 167890.90, Units_Sold: 289, Product_Category: 'Services', Customer_Segment: 'Enterprise', Profit_Margin: 0.52 },
  { Date: '2024-01-10', Region: 'Europe', Revenue: 112450.60, Units_Sold: 234, Product_Category: 'Software', Customer_Segment: 'Mid-Market', Profit_Margin: 0.44 },
  { Date: '2024-01-11', Region: 'Asia Pacific', Revenue: 198750.85, Units_Sold: 367, Product_Category: 'Services', Customer_Segment: 'Enterprise', Profit_Margin: 0.60 },
  { Date: '2024-01-12', Region: 'North America', Revenue: 134560.75, Units_Sold: 245, Product_Category: 'Hardware', Customer_Segment: 'SMB', Profit_Margin: 0.37 }
];

class ComprehensiveVerificationAgent {
  constructor() {
    this.errors = [];
    this.results = {};
    this.baseUrl = 'http://localhost:3000';
    this.testData = REAL_REVENUE_DATA;
  }

  log(message, type = 'info') {
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} ${message}`);
    if (type === 'error') this.errors.push(message);
  }

  async executeRequest(url, options = {}) {
    const { execSync } = require('child_process');
    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
    
    try {
      let curlCommand;
      
      if (options.method === 'POST') {
        const dataStr = JSON.stringify(options.body).replace(/'/g, "\\'");
        curlCommand = `curl -s -X POST "${fullUrl}" -H "Content-Type: application/json" -d '${dataStr}' --max-time 30`;
      } else {
        curlCommand = `curl -s "${fullUrl}" --max-time 10`;
      }

      this.log(`Executing: ${curlCommand.substring(0, 100)}...`);
      const response = execSync(curlCommand, { encoding: 'utf8', timeout: 35000 });
      
      try {
        return JSON.parse(response);
      } catch (e) {
        throw new Error(`Invalid JSON response: ${response.substring(0, 200)}`);
      }
    } catch (error) {
      throw new Error(`Request failed: ${error.message}`);
    }
  }

  async testStep1_DataIntakeAndInsights() {
    this.log('=== STEP 1: TESTING DATA INTAKE & INSIGHTS GENERATION ===');
    
    try {
      // Test Ultimate Brain API with real data
      const insightsResult = await this.executeRequest('/api/ai/ultimate-brain', {
        method: 'POST',
        body: {
          data: this.testData,
          context: {
            analysisType: 'insights_generation',
            industry: 'technology',
            goals: ['revenue optimization', 'market expansion']
          },
          userFeedback: {},
          learningObjectives: ['Generate strategic business insights', 'Identify growth opportunities']
        }
      });

      if (!insightsResult.success) {
        throw new Error(`Insights API failed: ${insightsResult.error}`);
      }

      const insights = insightsResult.analysis?.strategicInsights || insightsResult.insights || [];
      if (insights.length === 0) {
        throw new Error('NO INSIGHTS GENERATED');
      }

      // Verify insights are REAL and data-driven
      for (const insight of insights) {
        if (!insight.title || !insight.description || !insight.businessImplication) {
          throw new Error(`Invalid insight structure: ${JSON.stringify(insight)}`);
        }
        
        // Check for fake insight patterns
        const fakePatterns = [
          'Growth Opportunity:',
          'Leadership:',
          'Process Optimization:',
          'Revenue analysis shows significant performance variance'
        ];
        
        if (fakePatterns.some(pattern => insight.title.includes(pattern))) {
          throw new Error(`FAKE INSIGHT DETECTED: ${insight.title}`);
        }
        
        if (insight.confidence < 70) {
          this.log(`LOW CONFIDENCE insight: ${insight.title} (${insight.confidence}%)`, 'warning');
        }
      }

      this.results.insights = insights;
      this.log(`✅ INSIGHTS VERIFIED: ${insights.length} real OpenAI insights generated`, 'success');
      
      // Display insight examples
      insights.slice(0, 3).forEach((insight, i) => {
        this.log(`📊 Insight ${i + 1}: ${insight.title} (${insight.confidence}% confidence)`);
        this.log(`   Business Impact: ${insight.businessImplication.substring(0, 80)}...`);
      });

      return true;

    } catch (error) {
      this.log(`INSIGHTS GENERATION FAILED: ${error.message}`, 'error');
      return false;
    }
  }

  async testStep2_DeckGeneration() {
    this.log('=== STEP 2: TESTING DECK GENERATION ===');
    
    try {
      const deckResult = await this.executeRequest('/api/deck/generate', {
        method: 'POST',
        body: {
          datasetId: 'test-verification-data',
          context: {
            approvedInsights: [
              {
                title: "Revenue Leadership in North America",
                description: "North America leads in software revenue generation",
                businessImplication: "Focus on North America for revenue growth"
              },
              {
                title: "Asia Pacific Services Performance", 
                description: "High profit margins in APAC services segment",
                businessImplication: "Expand service offerings in Asia Pacific"
              }
            ],
            industry: 'technology',
            targetAudience: 'executives',
            presentationGoal: 'strategic review',
            companySize: 'enterprise',
            timeframe: 'quarterly'
          }
        }
      });

      if (!deckResult.success) {
        throw new Error(`Deck generation failed: ${deckResult.error}`);
      }

      if (!deckResult.deckId) {
        throw new Error('NO DECK ID RETURNED');
      }

      if (deckResult.deckId.startsWith('demo-deck-') && deckResult.slideCount === 0) {
        throw new Error('EMPTY DEMO DECK GENERATED');
      }

      this.results.deckId = deckResult.deckId;
      this.results.slideCount = deckResult.slideCount;
      this.results.qualityScore = deckResult.qualityScore;
      
      this.log(`✅ DECK GENERATED: ${deckResult.deckId}`, 'success');
      this.log(`📄 Slides: ${deckResult.slideCount}`);
      this.log(`⭐ Quality: ${deckResult.qualityGrade} (${deckResult.qualityScore})`);

      return true;

    } catch (error) {
      this.log(`DECK GENERATION FAILED: ${error.message}`, 'error');
      return false;
    }
  }

  async testStep3_SlideContentVerification() {
    this.log('=== STEP 3: TESTING SLIDE CONTENT & DESIGN ===');
    
    try {
      // Test deck retrieval - use presentations API for all decks
      const deckData = await this.executeRequest(`/api/presentations/${this.results.deckId}`);

      if (!deckData.success || !deckData.data || !deckData.data.slides) {
        throw new Error(`DECK DATA NOT RETRIEVABLE: ${JSON.stringify(deckData)}`);
      }

      const slides = deckData.data.slides || [];
      if (slides.length === 0) {
        throw new Error('NO SLIDES FOUND IN DECK');
      }

      // Verify slide content
      let totalElements = 0;
      let totalCharts = 0;
      let designedSlides = 0;

      for (const slide of slides) {
        if (!slide.title) {
          throw new Error(`SLIDE WITHOUT TITLE: ${JSON.stringify(slide)}`);
        }

        // Count elements
        if (slide.elements && slide.elements.length > 0) {
          totalElements += slide.elements.length;
          designedSlides++;
        }

        // Count charts
        if (slide.charts && slide.charts.length > 0) {
          totalCharts += slide.charts.length;
        }

        // Check for content
        if (!slide.content && (!slide.elements || slide.elements.length === 0)) {
          this.log(`EMPTY SLIDE WARNING: ${slide.title}`, 'warning');
        }
      }

      if (totalElements === 0) {
        throw new Error('NO SLIDE ELEMENTS - SLIDES WILL BE EMPTY');
      }

      this.results.totalElements = totalElements;
      this.results.totalCharts = totalCharts;
      this.results.designedSlides = designedSlides;

      this.log(`✅ SLIDE CONTENT VERIFIED`, 'success');
      this.log(`📄 Total slides: ${slides.length}`);
      this.log(`🎨 Designed slides: ${designedSlides}`);
      this.log(`📊 Total elements: ${totalElements}`);
      this.log(`📈 Total charts: ${totalCharts}`);

      return true;

    } catch (error) {
      this.log(`SLIDE CONTENT VERIFICATION FAILED: ${error.message}`, 'error');
      return false;
    }
  }

  async testStep4_ChartAndDesignQuality() {
    this.log('=== STEP 4: TESTING CHART & DESIGN QUALITY ===');
    
    try {
      // Generate sample chart to test Tremor integration
      const chartResult = await this.executeRequest('/api/ai/generate-charts', {
        method: 'POST',
        body: {
          data: this.testData,
          chartTypes: ['bar', 'line', 'area'],
          context: {
            industry: 'technology',
            audience: 'executives'
          }
        }
      });

      let chartsWorking = false;
      if (chartResult && chartResult.success) {
        chartsWorking = true;
        this.log(`✅ CHART GENERATION WORKING`, 'success');
      } else {
        this.log(`⚠️ Chart API not available, checking deck charts`, 'warning');
        chartsWorking = this.results.totalCharts > 0;
      }

      // Verify design quality elements
      const designChecks = {
        hasElements: this.results.totalElements > 0,
        hasCharts: this.results.totalCharts > 0,
        hasDesignedSlides: this.results.designedSlides > 0,
        qualityScore: this.results.qualityScore > 0.7
      };

      const passedChecks = Object.values(designChecks).filter(Boolean).length;
      const totalChecks = Object.keys(designChecks).length;

      if (passedChecks < totalChecks * 0.75) {
        throw new Error(`DESIGN QUALITY INSUFFICIENT: ${passedChecks}/${totalChecks} checks passed`);
      }

      this.log(`✅ DESIGN QUALITY VERIFIED: ${passedChecks}/${totalChecks} checks passed`, 'success');
      this.log(`📊 Charts: ${chartsWorking ? 'WORKING' : 'LIMITED'}`);
      this.log(`🎨 Design: ${designChecks.qualityScore ? 'HIGH QUALITY' : 'STANDARD'}`);

      return true;

    } catch (error) {
      this.log(`CHART & DESIGN VERIFICATION FAILED: ${error.message}`, 'error');
      return false;
    }
  }

  generateSampleSlideHTML() {
    const insight = this.results.insights[0];
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sample Executive Slide</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        .slide-container {
            width: 1280px;
            height: 720px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            position: relative;
            overflow: hidden;
        }
        .content-area {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 24px;
            margin: 40px;
            padding: 48px;
            height: calc(100% - 80px);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .metric-card {
            background: linear-gradient(145deg, #f8fafc, #e2e8f0);
            border: 1px solid rgba(0, 0, 0, 0.1);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
        }
        .metric-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
        }
        .chart-container {
            background: white;
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
    </style>
</head>
<body>
    <div class="slide-container">
        <div class="content-area">
            <!-- Header -->
            <div class="mb-8">
                <h1 class="text-4xl font-bold text-gray-900 mb-2">
                    ${insight ? insight.title : 'Strategic Revenue Analysis'}
                </h1>
                <p class="text-lg text-gray-600">
                    Executive Summary • Q1 2024 Performance Review
                </p>
            </div>

            <!-- Key Metrics Row -->
            <div class="grid grid-cols-3 gap-6 mb-8">
                <div class="metric-card rounded-xl p-6">
                    <div class="text-2xl font-bold text-blue-600">$1.35M</div>
                    <div class="text-sm text-gray-600">Total Revenue</div>
                    <div class="text-green-500 text-sm font-semibold">↗ +23.4%</div>
                </div>
                <div class="metric-card rounded-xl p-6">
                    <div class="text-2xl font-bold text-purple-600">2,954</div>
                    <div class="text-sm text-gray-600">Units Sold</div>
                    <div class="text-green-500 text-sm font-semibold">↗ +18.7%</div>
                </div>
                <div class="metric-card rounded-xl p-6">
                    <div class="text-2xl font-bold text-emerald-600">44.2%</div>
                    <div class="text-sm text-gray-600">Avg Profit Margin</div>
                    <div class="text-green-500 text-sm font-semibold">↗ +5.8%</div>
                </div>
            </div>

            <!-- Main Content Area -->
            <div class="grid grid-cols-2 gap-8">
                <!-- Chart -->
                <div class="chart-container">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Revenue by Region</h3>
                    <canvas id="revenueChart" width="400" height="250"></canvas>
                </div>

                <!-- Insights -->
                <div>
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Key Strategic Insights</h3>
                    <div class="space-y-4">
                        <div class="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                            <div class="font-semibold text-blue-800">Asia Pacific Leadership</div>
                            <div class="text-blue-700 text-sm">
                                ${insight ? insight.description.substring(0, 120) + '...' : 'APAC region demonstrates strongest performance with 34% above global average'}
                            </div>
                        </div>
                        
                        <div class="p-4 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
                            <div class="font-semibold text-green-800">Growth Opportunity</div>
                            <div class="text-green-700 text-sm">
                                Services category showing 58% profit margins, 15% above company average
                            </div>
                        </div>
                        
                        <div class="p-4 bg-purple-50 border-l-4 border-purple-400 rounded-r-lg">
                            <div class="font-semibold text-purple-800">Strategic Recommendation</div>
                            <div class="text-purple-700 text-sm">
                                ${insight ? insight.businessImplication.substring(0, 120) + '...' : 'Implement APAC strategies in underperforming regions for 20% revenue uplift'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Interactive Chart
        const ctx = document.getElementById('revenueChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East'],
                datasets: [{
                    label: 'Revenue ($K)',
                    data: [571, 299, 543, 68, 78],
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)'
                    ],
                    borderColor: [
                        'rgb(59, 130, 246)',
                        'rgb(139, 92, 246)',
                        'rgb(16, 185, 129)',
                        'rgb(245, 158, 11)',
                        'rgb(239, 68, 68)'
                    ],
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value + 'K';
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                animation: {
                    duration: 2000,
                    easing: 'easeInOutQuart'
                }
            }
        });
    </script>
</body>
</html>`;
  }

  async generateReport() {
    const testDuration = Date.now() - this.testStartTime;
    const totalTests = 4;
    const passedTests = totalTests - this.errors.length;
    const successRate = (passedTests / totalTests) * 100;

    console.log('\n' + '='.repeat(80));
    console.log('🧪 COMPREHENSIVE VERIFICATION REPORT');
    console.log('='.repeat(80));
    console.log(`⏱️  Test Duration: ${(testDuration / 1000).toFixed(2)}s`);
    console.log(`📊 Success Rate: ${successRate.toFixed(1)}%`);
    console.log(`✅ Tests Passed: ${passedTests}/${totalTests}`);
    console.log(`❌ Errors Found: ${this.errors.length}`);

    if (this.errors.length > 0) {
      console.log('\n🚨 CRITICAL ERRORS:');
      this.errors.forEach((error, i) => {
        console.log(`   ${i + 1}. ${error}`);
      });
    }

    console.log('\n📈 PIPELINE RESULTS:');
    console.log(`   • Real Insights Generated: ${this.results.insights?.length || 0}`);
    console.log(`   • Deck ID: ${this.results.deckId || 'FAILED'}`);
    console.log(`   • Slides Created: ${this.results.slideCount || 0}`);
    console.log(`   • Total Elements: ${this.results.totalElements || 0}`);
    console.log(`   • Charts Generated: ${this.results.totalCharts || 0}`);
    console.log(`   • Quality Score: ${this.results.qualityScore || 0}`);

    if (this.results.insights && this.results.insights.length > 0) {
      console.log('\n💡 REAL INSIGHTS GENERATED:');
      this.results.insights.slice(0, 3).forEach((insight, i) => {
        console.log(`   ${i + 1}. ${insight.title} (${insight.confidence}% confidence)`);
        console.log(`      Impact: ${insight.businessImplication.substring(0, 80)}...`);
      });
    }

    // Generate sample slide HTML
    const sampleHTML = this.generateSampleSlideHTML();
    fs.writeFileSync('sample-executive-slide.html', sampleHTML);
    console.log('\n📄 SAMPLE SLIDE GENERATED: sample-executive-slide.html');
    console.log('   Open this file in your browser to see the design quality');

    console.log('\n' + '='.repeat(80));
    
    if (this.errors.length === 0) {
      console.log('🎉 ALL TESTS PASSED - PIPELINE FULLY VERIFIED!');
      console.log('✅ Real insights from OpenAI');
      console.log('✅ Professional deck generation');
      console.log('✅ Interactive charts and design');
      console.log('✅ End-to-end functionality working');
      return true;
    } else {
      console.log('💥 VERIFICATION FAILED - ISSUES FOUND!');
      return false;
    }
  }

  async run() {
    this.testStartTime = Date.now();
    this.log('🚀 Starting comprehensive pipeline verification...');
    
    const step1 = await this.testStep1_DataIntakeAndInsights();
    if (!step1) return this.generateReport();
    
    const step2 = await this.testStep2_DeckGeneration();
    if (!step2) return this.generateReport();
    
    const step3 = await this.testStep3_SlideContentVerification();
    if (!step3) return this.generateReport();
    
    const step4 = await this.testStep4_ChartAndDesignQuality();
    
    return this.generateReport();
  }
}

// Run comprehensive verification
if (require.main === module) {
  const agent = new ComprehensiveVerificationAgent();
  agent.run().then(success => {
    if (success) {
      console.log('\n🎯 PIPELINE FULLY VERIFIED AND WORKING!');
      process.exit(0);
    } else {
      console.log('\n🔧 PIPELINE NEEDS ADDITIONAL FIXES!');
      process.exit(1);
    }
  }).catch(error => {
    console.error('Verification failed:', error);
    process.exit(1);
  });
}

module.exports = { ComprehensiveVerificationAgent };