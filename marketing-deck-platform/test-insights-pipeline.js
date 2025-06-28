// Simple test script to verify the insights pipeline
const https = require('https')
const http = require('http')

function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url)
    const isHttps = parsedUrl.protocol === 'https:'
    const httpModule = isHttps ? https : http
    
    const req = httpModule.request({
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          json: () => Promise.resolve(JSON.parse(data))
        })
      })
    })
    
    req.on('error', reject)
    
    if (options.body) {
      req.write(options.body)
    }
    
    req.end()
  })
}

const TEST_USER_ID = 'test-user-123'
const BASE_URL = 'http://localhost:3001'

async function testInsightsPipeline() {
  console.log('🧪 Testing Insights Pipeline...\n')

  try {
    // Step 1: Test insights generation
    console.log('1️⃣ Testing insights generation...')
    const insightsResponse = await fetch(`${BASE_URL}/api/ai/analyze-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: TEST_USER_ID,
        chatContinuity: true,
        analysisType: 'insights_generation'
      })
    })

    if (!insightsResponse.ok) {
      throw new Error(`Insights generation failed: ${insightsResponse.status}`)
    }

    const insightsData = await insightsResponse.json()
    console.log('✅ Insights generated:', insightsData.insights?.length, 'insights')

    // Step 2: Test structure generation
    console.log('\n2️⃣ Testing structure generation...')
    const structureResponse = await fetch(`${BASE_URL}/api/ai/generate-outline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: TEST_USER_ID,
        chatContinuity: true,
        insights: insightsData.insights,
        feedback: { 'insight-1': 'thumbsup', 'insight-2': 'thumbsup' },
        requestType: 'structure_proposal'
      })
    })

    if (!structureResponse.ok) {
      throw new Error(`Structure generation failed: ${structureResponse.status}`)
    }

    const structureData = await structureResponse.json()
    console.log('✅ Structure generated:', structureData.slides?.length, 'slides')

    // Step 3: Test Python analysis
    console.log('\n3️⃣ Testing Python analysis...')
    const pythonResponse = await fetch(`${BASE_URL}/api/ai/run-python-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: TEST_USER_ID,
        chatContinuity: true,
        presentationId: 'test-pres-123',
        structure: structureData.slides,
        phase: 'data_processing'
      })
    })

    if (!pythonResponse.ok) {
      throw new Error(`Python analysis failed: ${pythonResponse.status}`)
    }

    const pythonData = await pythonResponse.json()
    console.log('✅ Python analysis completed:', pythonData.pythonResults?.trends?.length, 'trends found')

    // Step 4: Test interpretation
    console.log('\n4️⃣ Testing AI interpretation...')
    const interpretationResponse = await fetch(`${BASE_URL}/api/ai/interpret-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: TEST_USER_ID,
        chatContinuity: true,
        presentationId: 'test-pres-123',
        pythonResults: pythonData.pythonResults,
        structure: structureData.slides
      })
    })

    if (!interpretationResponse.ok) {
      throw new Error(`Interpretation failed: ${interpretationResponse.status}`)
    }

    const interpretationData = await interpretationResponse.json()
    console.log('✅ Interpretation completed:', interpretationData.interpretation?.keyInsights?.length, 'insights')

    // Step 5: Test chart generation
    console.log('\n5️⃣ Testing chart generation...')
    const chartsResponse = await fetch(`${BASE_URL}/api/ai/generate-charts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: TEST_USER_ID,
        chatContinuity: true,
        presentationId: 'test-pres-123',
        analysisResults: interpretationData.interpretation,
        structure: structureData.slides,
        framework: 'tremor'
      })
    })

    if (!chartsResponse.ok) {
      throw new Error(`Chart generation failed: ${chartsResponse.status}`)
    }

    const chartsData = await chartsResponse.json()
    console.log('✅ Charts generated:', chartsData.charts?.length, 'charts with Tremor framework')

    // Step 6: Test QA
    console.log('\n6️⃣ Testing QA with revisions...')
    const qaResponse = await fetch(`${BASE_URL}/api/ai/qa-deck`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: TEST_USER_ID,
        chatContinuity: true,
        presentationId: 'test-pres-123',
        contentData: chartsData,
        structure: structureData.slides,
        enableRevisions: true,
        maxRevisions: 2
      })
    })

    if (!qaResponse.ok) {
      throw new Error(`QA failed: ${qaResponse.status}`)
    }

    const qaData = await qaResponse.json()
    console.log('✅ QA completed:', qaData.qaResults?.revisions?.length, 'revisions performed')
    console.log('   Final quality score:', qaData.finalDeck?.metadata?.finalQualityScore)

    // Final Summary
    console.log('\n🎉 PIPELINE TEST COMPLETED SUCCESSFULLY!')
    console.log('Pipeline stages verified:')
    console.log('  ✅ Insights Generation')
    console.log('  ✅ Structure Proposal')
    console.log('  ✅ Python Data Analysis')
    console.log('  ✅ AI Interpretation')
    console.log('  ✅ Tremor Chart Generation')
    console.log('  ✅ QA with Revisions')
    console.log('\nFinal output:')
    console.log(`  - ${qaData.finalDeck?.slides?.length} slides generated`)
    console.log(`  - ${qaData.finalDeck?.charts?.length} charts with Tremor`)
    console.log(`  - Quality score: ${qaData.finalDeck?.metadata?.finalQualityScore}`)
    console.log(`  - Revisions: ${qaData.finalDeck?.metadata?.revisionsPerformed}`)

  } catch (error) {
    console.error('❌ Pipeline test failed:', error.message)
    process.exit(1)
  }
}

// Run the test
testInsightsPipeline()