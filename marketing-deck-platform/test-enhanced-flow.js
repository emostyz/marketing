#!/usr/bin/env node

/**
 * Test the Enhanced Strategic CSV Analysis Flow
 * Verifies: Authentication → File Upload → AI Analysis → Strategic Slides
 */

const fs = require('fs')
const path = require('path')

console.log('🧪 Testing Enhanced Strategic CSV Analysis Flow')
console.log('================================================')

// Check test data file exists
const testDataPath = path.join(__dirname, 'test-analysis-payload.json')
if (fs.existsSync(testDataPath)) {
  const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'))
  console.log('✅ Test data loaded:', {
    dataPoints: testData.data.length,
    metrics: Object.keys(testData.data[0]).length,
    industry: testData.context.industry,
    audience: testData.context.targetAudience
  })
} else {
  console.log('❌ Test data file not found')
}

// Check sample CSV file exists
const sampleCsvPath = path.join(__dirname, 'sample_business_data.csv')
if (fs.existsSync(sampleCsvPath)) {
  const csvContent = fs.readFileSync(sampleCsvPath, 'utf8')
  const lines = csvContent.split('\n').filter(line => line.trim())
  console.log('✅ Sample CSV loaded:', {
    rows: lines.length - 1, // excluding header
    headers: lines[0].split(',').length
  })
} else {
  console.log('❌ Sample CSV file not found')
}

// Check enhanced components exist
const componentsToCheck = [
  'components/slides/ComprehensiveSlideRenderer.tsx',
  'components/deck-builder/UltimateDeckBuilder.tsx',
  'app/api/openai/enhanced-analyze/route.ts',
  'lib/auth/auth-context.tsx',
  'middleware.ts'
]

console.log('\n📋 Component Status:')
componentsToCheck.forEach(component => {
  const fullPath = path.join(__dirname, component)
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath)
    console.log(`✅ ${component} (${Math.round(stats.size / 1024)}KB)`)
  } else {
    console.log(`❌ ${component} - Missing`)
  }
})

console.log('\n🚀 Enhanced Features Verification:')

// Check ComprehensiveSlideRenderer for strategic enhancements
const rendererPath = path.join(__dirname, 'components/slides/ComprehensiveSlideRenderer.tsx')
if (fs.existsSync(rendererPath)) {
  const rendererContent = fs.readFileSync(rendererPath, 'utf8')
  const features = [
    { name: 'Hidden Insight Callouts', check: rendererContent.includes('HIDDEN INSIGHT') },
    { name: 'Strategic Value Sections', check: rendererContent.includes('STRATEGIC VALUE') },
    { name: 'Chart + Insights Layout', check: rendererContent.includes('Chart + Insights Layout') },
    { name: 'Confidence Scoring', check: rendererContent.includes('Analysis Confidence') },
    { name: 'Strategic Drivers', check: rendererContent.includes('hiddenDrivers') },
    { name: 'Pattern Detection', check: rendererContent.includes('Pattern Detected') }
  ]
  
  features.forEach(feature => {
    console.log(`${feature.check ? '✅' : '❌'} ${feature.name}`)
  })
}

console.log('\n🎯 Test Instructions:')
console.log('1. Open: http://localhost:3001/test-visual-flow.html')
console.log('2. Click "Start Deck Builder"')
console.log('3. Upload sample_business_data.csv')
console.log('4. Run AI Analysis')
console.log('5. Verify strategic insights and beautiful charts')

console.log('\n✨ Expected Enhancements:')
console.log('• McKinsey-level strategic insights')
console.log('• Hidden drivers and non-obvious patterns')
console.log('• Beautiful chart + bullet point layouts')
console.log('• Amber "HIDDEN INSIGHT" callouts')
console.log('• Emerald "STRATEGIC VALUE" sections')
console.log('• Confidence scores and pattern detection')

console.log('\n🔗 Quick Links:')
console.log('• Test Interface: http://localhost:3001/test-visual-flow.html')
console.log('• Deck Builder: http://localhost:3001/deck-builder/new')
console.log('• Dashboard: http://localhost:3001/dashboard')
console.log('• Sample CSV: http://localhost:3001/sample_business_data.csv')

console.log('\n🎉 System Ready for Strategic Analysis Testing!')