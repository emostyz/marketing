const fs = require('fs')
const path = require('path')

// Test the complete Ultimate Deck Builder flow
async function testUltimateFlow() {
  console.log('🧪 Testing Ultimate Deck Builder Flow...\n')

  const tests = [
    {
      name: 'Enhanced Brain API',
      test: async () => {
        const response = await fetch('http://localhost:3000/api/openai/enhanced-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: [
              { month: 'Jan', sales: 100, profit: 20 },
              { month: 'Feb', sales: 120, profit: 25 },
              { month: 'Mar', sales: 140, profit: 30 },
              { month: 'Apr', sales: 160, profit: 35 },
              { month: 'May', sales: 180, profit: 40 }
            ],
            context: {
              businessGoals: 'Increase sales and profitability',
              targetAudience: 'executive',
              keyQuestions: ['What are the growth trends?', 'How can we optimize profit?'],
              industry: 'Technology',
              dataDescription: 'Monthly sales and profit data',
              influencingFactors: ['Market conditions', 'Seasonality']
            },
            timeFrame: {
              primaryPeriod: { start: '2024-01-01', end: '2024-05-31', label: 'Q1-Q2 2024' },
              analysisType: 'm/m'
            },
            requirements: {
              slideCount: 5,
              targetDuration: 10,
              structure: 'ai_suggested',
              keyPoints: ['Growth trends', 'Profit optimization'],
              audienceType: 'executive',
              presentationStyle: 'formal'
            },
            userFeedback: []
          })
        })

        const result = await response.json()
        return result.success && result.result && result.result.insights.length > 0
      }
    },
    {
      name: 'Database Connection',
      test: async () => {
        try {
          // Test if we can access the database helpers
          const { dbHelpers } = require('./lib/supabase/database-helpers')
          return true
        } catch (error) {
          return false
        }
      }
    },
    {
      name: 'Component Imports',
      test: async () => {
        try {
          // Test if all required components can be imported
          const components = [
            './components/deck-builder/UltimateDeckBuilder',
            './components/data-upload/AdvancedDataIntake',
            './components/real-time/RealTimeFeedback',
            './components/templates/TemplateLibrary',
            './components/charts/AdvancedTremorChartStudio',
            './components/themes/AdvancedThemeStudio'
          ]

          for (const component of components) {
            require(component)
          }
          return true
        } catch (error) {
          console.error('Component import error:', error.message)
          return false
        }
      }
    },
    {
      name: 'Enhanced Brain System',
      test: async () => {
        try {
          const { EnhancedBrainV2 } = require('./lib/ai/enhanced-brain-v2')
          const brain = new EnhancedBrainV2('test-key')
          return brain && typeof brain.analyzeData === 'function'
        } catch (error) {
          console.error('Enhanced brain error:', error.message)
          return false
        }
      }
    },
    {
      name: 'File Structure',
      test: async () => {
        const requiredFiles = [
          'app/deck-builder/new/page.tsx',
          'components/deck-builder/UltimateDeckBuilder.tsx',
          'lib/ai/enhanced-brain-v2.ts',
          'app/api/openai/enhanced-analyze/route.ts'
        ]

        for (const file of requiredFiles) {
          if (!fs.existsSync(file)) {
            console.error(`Missing file: ${file}`)
            return false
          }
        }
        return true
      }
    },
    {
      name: 'Environment Configuration',
      test: async () => {
        const envFile = '.env.local'
        if (!fs.existsSync(envFile)) {
          console.error('Missing .env.local file')
          return false
        }

        const envContent = fs.readFileSync(envFile, 'utf8')
        return envContent.includes('OPENAI_API_KEY=')
      }
    }
  ]

  let passed = 0
  let total = tests.length

  for (const test of tests) {
    try {
      console.log(`🔍 Testing: ${test.name}`)
      const result = await test.test()
      
      if (result) {
        console.log(`✅ ${test.name}: PASSED`)
        passed++
      } else {
        console.log(`❌ ${test.name}: FAILED`)
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR - ${error.message}`)
    }
    console.log('')
  }

  console.log(`📊 Test Results: ${passed}/${total} tests passed`)
  
  if (passed === total) {
    console.log('🎉 All tests passed! The Ultimate Deck Builder is ready.')
    console.log('\n🚀 Next Steps:')
    console.log('1. Go to http://localhost:3000/dashboard')
    console.log('2. Click "Create New Presentation"')
    console.log('3. Upload your data and complete the intake form')
    console.log('4. Watch the enhanced brain analyze your data')
    console.log('5. Select a template and customize your deck')
    console.log('6. Create your presentation and navigate to the editor')
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.')
  }

  return passed === total
}

// Run the test
testUltimateFlow().catch(console.error) 