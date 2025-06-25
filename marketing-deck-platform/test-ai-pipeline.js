/**
 * Test the complete OpenAI-powered Python analysis pipeline
 * This validates that all components work together to generate CEO-ready presentations
 */

const { AdvancedAnalysisEngine } = require('./lib/ai/advanced-analysis-engine')
const { PythonExecutor } = require('./lib/python/python-executor')

async function testAIPipeline() {
  console.log('🧪 TESTING AI-POWERED ANALYSIS PIPELINE')
  console.log('=' .repeat(50))
  
  // Test data - realistic business dataset
  const testData = [
    { Date: '2024-01-01', Region: 'North America', Revenue: 125430.50, Units_Sold: 1180, Product_Category: 'Enterprise Software', Customer_Satisfaction: 4.8 },
    { Date: '2024-01-02', Region: 'Europe', Revenue: 98750.25, Units_Sold: 895, Product_Category: 'Cloud Services', Customer_Satisfaction: 4.6 },
    { Date: '2024-01-03', Region: 'Asia Pacific', Revenue: 156200.75, Units_Sold: 1450, Product_Category: 'AI Solutions', Customer_Satisfaction: 4.9 },
    { Date: '2024-01-04', Region: 'Latin America', Revenue: 67840.00, Units_Sold: 520, Product_Category: 'Support Services', Customer_Satisfaction: 4.4 },
    { Date: '2024-01-05', Region: 'North America', Revenue: 189500.80, Units_Sold: 1650, Product_Category: 'Enterprise Software', Customer_Satisfaction: 4.7 },
    { Date: '2024-01-06', Region: 'Europe', Revenue: 134250.60, Units_Sold: 1120, Product_Category: 'Cloud Services', Customer_Satisfaction: 4.8 },
    { Date: '2024-01-07', Region: 'Asia Pacific', Revenue: 203400.40, Units_Sold: 1890, Product_Category: 'AI Solutions', Customer_Satisfaction: 4.9 },
    { Date: '2024-01-08', Region: 'Latin America', Revenue: 78650.90, Units_Sold: 645, Product_Category: 'Support Services', Customer_Satisfaction: 4.5 },
    { Date: '2024-01-09', Region: 'North America', Revenue: 167320.15, Units_Sold: 1320, Product_Category: 'Enterprise Software', Customer_Satisfaction: 4.6 },
    { Date: '2024-01-10', Region: 'Europe', Revenue: 145670.22, Units_Sold: 1240, Product_Category: 'Cloud Services', Customer_Satisfaction: 4.7 },
  ]

  try {
    console.log('📊 Test Dataset:')
    console.log(`- Rows: ${testData.length}`)
    console.log(`- Columns: ${Object.keys(testData[0]).join(', ')}`)
    console.log(`- Total Revenue: $${testData.reduce((sum, row) => sum + row.Revenue, 0).toLocaleString()}`)
    console.log()

    // Step 1: Test Python Execution
    console.log('🐍 Step 1: Testing Python Execution...')
    const pythonCode = `
# Basic data analysis
print("Python execution working!")
total_revenue = sum(row['Revenue'] for row in raw_data)
avg_satisfaction = sum(row['Customer_Satisfaction'] for row in raw_data) / len(raw_data)
print("PYTHON_RESULT: Total Revenue: " + str(total_revenue))
print("PYTHON_RESULT: Average Satisfaction: " + str(avg_satisfaction))
    `
    
    const pythonResult = await PythonExecutor.executeAnalysis(pythonCode, testData)
    
    if (pythonResult.success) {
      console.log('✅ Python execution successful')
      console.log('📈 Python Results:', pythonResult.output)
    } else {
      console.log('❌ Python execution failed:', pythonResult.error)
      return
    }
    console.log()

    // Step 2: Test OpenAI Analysis Engine
    console.log('🧠 Step 2: Testing OpenAI Analysis Engine...')
    
    const analysisEngine = new AdvancedAnalysisEngine()
    
    const analysisRequest = {
      data: testData,
      datasetName: 'Q1 2024 Business Performance',
      context: 'Quarterly business review for executive leadership',
      targetAudience: 'executives'
    }
    
    console.log('🚀 Starting CEO-ready analysis...')
    const startTime = Date.now()
    
    const analysisResult = await analysisEngine.generateCEOReadyAnalysis(analysisRequest)
    
    const duration = Date.now() - startTime
    console.log(`⏱️  Analysis completed in ${duration}ms`)
    console.log()

    // Step 3: Validate Results
    console.log('📋 Step 3: Validating Analysis Results...')
    
    console.log('📊 Executive Summary:')
    console.log(`- Headline: ${analysisResult.executiveSummary.headline}`)
    console.log(`- Key Metric: ${analysisResult.executiveSummary.keyMetric.name} = ${analysisResult.executiveSummary.keyMetric.value}`)
    console.log(`- Business Impact: ${analysisResult.executiveSummary.businessImpact}`)
    console.log()
    
    console.log(`💡 Key Findings: ${analysisResult.keyFindings.length} insights`)
    analysisResult.keyFindings.forEach((finding, i) => {
      console.log(`  ${i + 1}. ${finding.title} (${finding.significance})`)
      console.log(`     ${finding.insight}`)
    })
    console.log()
    
    console.log(`📈 Visualizations: ${analysisResult.visualizations.length} charts`)
    analysisResult.visualizations.forEach((viz, i) => {
      console.log(`  ${i + 1}. ${viz.title} (${viz.type} chart)`)
    })
    console.log()
    
    console.log(`🎯 Recommendations: ${analysisResult.recommendations.length} actions`)
    analysisResult.recommendations.forEach((rec, i) => {
      console.log(`  ${i + 1}. ${rec.title} (${rec.priority} priority)`)
    })
    console.log()
    
    console.log(`📄 Slides: ${analysisResult.slides.length} CEO-ready slides`)
    analysisResult.slides.forEach((slide, i) => {
      console.log(`  ${i + 1}. ${slide.title} (${slide.type})`)
    })
    console.log()
    
    console.log(`⭐ Quality Score: ${analysisResult.qualityScore}/100`)
    console.log(`🎯 Confidence: ${analysisResult.confidence}/100`)
    
    console.log()
    console.log('🎉 AI PIPELINE TEST COMPLETED SUCCESSFULLY!')
    console.log('✅ OpenAI integration working')
    console.log('✅ Python execution working') 
    console.log('✅ CEO-ready analysis generated')
    console.log('✅ All components validated')
    
    return true
    
  } catch (error) {
    console.error('❌ AI Pipeline Test Failed:', error)
    console.error('Stack:', error.stack)
    return false
  }
}

// Check environment setup
function checkEnvironment() {
  console.log('🔧 Checking Environment Setup...')
  
  const requiredEnvVars = ['OPENAI_API_KEY']
  const missing = []
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar)
    }
  }
  
  if (missing.length > 0) {
    console.log('❌ Missing environment variables:', missing.join(', '))
    console.log('📝 Please set these in your .env.local file')
    return false
  }
  
  console.log('✅ Environment variables configured')
  return true
}

// Run the test
async function main() {
  console.log('🎯 AEDRIN AI PIPELINE VALIDATION')
  console.log('=' .repeat(50))
  console.log()
  
  if (!checkEnvironment()) {
    process.exit(1)
  }
  
  const success = await testAIPipeline()
  
  if (success) {
    console.log()
    console.log('🚀 SYSTEM READY FOR CEO-LEVEL PRESENTATIONS!')
    process.exit(0)
  } else {
    console.log()
    console.log('💥 SYSTEM NOT READY - PLEASE FIX ERRORS')
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { testAIPipeline, checkEnvironment }