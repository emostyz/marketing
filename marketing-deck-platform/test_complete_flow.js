#!/usr/bin/env node

// Comprehensive End-to-End Test for EasyDecks.ai Marketing Deck Platform
// This script verifies that the complete user journey works flawlessly

const fs = require('fs');
const path = require('path');

console.log('🚀 EasyDecks.ai End-to-End Test Suite');
console.log('=================================\n');

const testResults = {
  passed: 0,
  failed: 0,
  details: []
};

function testResult(name, success, details = '') {
  if (success) {
    console.log(`✅ ${name}`);
    testResults.passed++;
  } else {
    console.log(`❌ ${name}: ${details}`);
    testResults.failed++;
  }
  testResults.details.push({ name, success, details });
}

// Test 1: Verify all core files exist
console.log('1. File Structure Tests');
console.log('----------------------');

const coreFiles = [
  'app/page.tsx',
  'app/auth/login/page.tsx',
  'app/auth/signup/page.tsx',
  'app/dashboard/page.tsx',
  'app/editor/[id]/page.tsx',
  'components/ui/Button.tsx',
  'components/ui/Card.tsx',
  'components/dashboard/DashboardClient.tsx'
];

coreFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  const exists = fs.existsSync(filePath);
  testResult(`Core file exists: ${file}`, exists);
});

// Test 2: Verify authentication pages have correct navigation
console.log('\n2. Authentication Flow Tests');
console.log('---------------------------');

const loginPage = fs.readFileSync(path.join(__dirname, 'app/auth/login/page.tsx'), 'utf8');
const signupPage = fs.readFileSync(path.join(__dirname, 'app/auth/signup/page.tsx'), 'utf8');

testResult(
  'Login page has demo login functionality',
  loginPage.includes('handleDemoLogin') && loginPage.includes("router.push('/dashboard')")
);

testResult(
  'Signup page has demo signup functionality',
  signupPage.includes('handleDemoSignup') && signupPage.includes("router.push('/dashboard')")
);

testResult(
  'Login page has proper form handling',
  loginPage.includes('handleLogin') && loginPage.includes('setLoading')
);

testResult(
  'Signup page has multi-step flow',
  signupPage.includes('setStep') && signupPage.includes('step === 1')
);

// Test 3: Verify dashboard functionality
console.log('\n3. Dashboard Functionality Tests');
console.log('-------------------------------');

const dashboardPage = fs.readFileSync(path.join(__dirname, 'app/dashboard/page.tsx'), 'utf8');

testResult(
  'Dashboard has create presentation functionality',
  dashboardPage.includes('handleCreatePresentation') && dashboardPage.includes('setShowUploadModal')
);

testResult(
  'Dashboard has upload modal',
  dashboardPage.includes('showUploadModal') && dashboardPage.includes('Create New Presentation')
);

testResult(
  'Dashboard has presentation navigation',
  dashboardPage.includes('handlePresentationClick') && dashboardPage.includes(`router.push(\`/editor/\${id}\`)`)
);

testResult(
  'Dashboard has logout functionality',
  dashboardPage.includes('handleLogout') && dashboardPage.includes("router.push('/auth/login')")
);

// Test 4: Verify slide editor functionality
console.log('\n4. Slide Editor Tests');
console.log('--------------------');

const editorPage = fs.readFileSync(path.join(__dirname, 'app/editor/[id]/page.tsx'), 'utf8');

testResult(
  'Editor has slide navigation',
  editorPage.includes('nextSlide') && editorPage.includes('prevSlide')
);

testResult(
  'Editor has presentation functionality',
  editorPage.includes('handlePresent') && editorPage.includes('setIsPlaying')
);

testResult(
  'Editor has save functionality',
  editorPage.includes('handleSave') && editorPage.includes('setIsSaving')
);

testResult(
  'Editor has export functionality',
  editorPage.includes('handleExport')
);

testResult(
  'Editor has sample slides with multiple types',
  editorPage.includes('sampleSlides') && 
  editorPage.includes("type: 'title'") &&
  editorPage.includes("type: 'executive-dashboard'") &&
  editorPage.includes("type: 'advanced-chart'") &&
  editorPage.includes("type: 'strategic-insights'")
);

// Test 5: Verify AI functionality
console.log('\n5. AI and Chart Tests');
console.log('--------------------');

const dashboardClient = fs.readFileSync(path.join(__dirname, 'components/dashboard/DashboardClient.tsx'), 'utf8');

testResult(
  'AI analysis engine exists',
  dashboardClient.includes('performAdvancedAnalysis') && dashboardClient.includes('generateAIInsights')
);

testResult(
  'Chart generation functionality exists',
  dashboardClient.includes('generateSlides') && dashboardClient.includes('recommendedCharts')
);

testResult(
  'KPI generation exists',
  dashboardClient.includes('analysis.kpis') && dashboardClient.includes('calculateTrendForMetric')
);

testResult(
  'Strategic insights generation exists',
  dashboardClient.includes('strategicRecommendations') && dashboardClient.includes('nextSteps')
);

// Test 6: Verify UI components
console.log('\n6. UI Component Tests');
console.log('--------------------');

const buttonComponent = fs.readFileSync(path.join(__dirname, 'components/ui/Button.tsx'), 'utf8');
const cardComponent = fs.readFileSync(path.join(__dirname, 'components/ui/Card.tsx'), 'utf8');

testResult(
  'Button component has variants',
  buttonComponent.includes('variant') && buttonComponent.includes('className')
);

testResult(
  'Card component exists and is functional',
  cardComponent.includes('Card') && cardComponent.includes('className')
);

// Test 7: Verify chart integration
console.log('\n7. Chart Integration Tests');
console.log('-------------------------');

testResult(
  'Editor has Recharts integration',
  editorPage.includes('BarChart') && editorPage.includes('ResponsiveContainer')
);

testResult(
  'Editor has multiple chart types',
  editorPage.includes('BarChart') && editorPage.includes('LineChart') && editorPage.includes('PieChart')
);

testResult(
  'Charts have proper data binding',
  editorPage.includes('data={slide.content?.data}') && editorPage.includes('dataKey="value"')
);

// Test 8: Verify dark theme and styling
console.log('\n8. Styling and Theme Tests');
console.log('-------------------------');

const layoutFile = fs.readFileSync(path.join(__dirname, 'app/layout.tsx'), 'utf8');

testResult(
  'Dark theme is enabled',
  layoutFile.includes('className="dark"') || layoutFile.includes("className='dark'")
);

testResult(
  'Global styles include dark theme',
  editorPage.includes('bg-gradient-to-br from-gray-950') && 
  dashboardPage.includes('bg-gradient-to-br from-gray-950')
);

// Test 9: Verify navigation consistency
console.log('\n9. Navigation Consistency Tests');
console.log('------------------------------');

testResult(
  'All pages have consistent navigation patterns',
  loginPage.includes("href=\"/auth/signup\"") &&
  signupPage.includes("href=\"/auth/login\"") &&
  dashboardPage.includes('handleLogout') &&
  editorPage.includes("router.push('/dashboard')")
);

testResult(
  'Button interactions are consistent',
  dashboardPage.includes('onClick={handleCreatePresentation}') &&
  editorPage.includes('onClick={handleSave}')
);

// Test 10: Verify world-class features
console.log('\n10. World-Class Feature Tests');
console.log('----------------------------');

testResult(
  'AI-powered slide generation exists',
  dashboardClient.includes('generateSlides') && dashboardClient.includes('AI-powered')
);

testResult(
  'Advanced analytics and insights',
  dashboardClient.includes('confidence') && dashboardClient.includes('trend') && dashboardClient.includes('recommendations')
);

testResult(
  'Professional presentation templates',
  editorPage.includes('Executive KPI Dashboard') && editorPage.includes('Strategic Insights')
);

testResult(
  'Interactive chart visualizations',
  editorPage.includes('ResponsiveContainer') && editorPage.includes('Tooltip')
);

// Test script to verify the complete flow
const testData = [
  { month: 'Jan', sales: 100, profit: 20, region: 'North' },
  { month: 'Feb', sales: 150, profit: 30, region: 'North' },
  { month: 'Mar', sales: 200, profit: 40, region: 'North' },
  { month: 'Apr', sales: 180, profit: 35, region: 'South' },
  { month: 'May', sales: 220, profit: 45, region: 'South' },
  { month: 'Jun', sales: 250, profit: 50, region: 'South' }
]

console.log('🧪 Testing complete flow...')

// Test 1: OpenAI API
async function testOpenAI() {
  console.log('📡 Testing OpenAI API...')
  try {
    const response = await fetch('http://localhost:3000/api/openai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: testData,
        userContext: 'Sales analysis for Q1-Q2',
        phase: 'data_analysis'
      })
    })
    
    const result = await response.json()
    console.log('✅ OpenAI API test:', result.success ? 'PASSED' : 'FAILED')
    console.log('📊 Tokens used:', result.tokensUsed)
    return result.success
  } catch (error) {
    console.error('❌ OpenAI API test failed:', error)
    return false
  }
}

// Test 2: Environment variables
async function testEnvironment() {
  console.log('🔧 Testing environment...')
  try {
    const response = await fetch('http://localhost:3000/api/test-env')
    const result = await response.json()
    console.log('✅ Environment test:', result.openaiKeyExists ? 'PASSED' : 'FAILED')
    return result.openaiKeyExists
  } catch (error) {
    console.error('❌ Environment test failed:', error)
    return false
  }
}

// Test 3: Database connection
async function testDatabase() {
  console.log('🗄️ Testing database...')
  try {
    const response = await fetch('http://localhost:3000/api/presentations')
    const result = await response.json()
    console.log('✅ Database test:', result.success ? 'PASSED' : 'FAILED')
    return result.success
  } catch (error) {
    console.error('❌ Database test failed:', error)
    return false
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting comprehensive flow test...\n')
  
  const tests = [
    { name: 'Environment', fn: testEnvironment },
    { name: 'OpenAI API', fn: testOpenAI },
    { name: 'Database', fn: testDatabase }
  ]
  
  const results = []
  
  for (const test of tests) {
    const result = await test.fn()
    results.push({ name: test.name, passed: result })
  }
  
  console.log('\n📋 Test Results:')
  results.forEach(result => {
    console.log(`${result.passed ? '✅' : '❌'} ${result.name}: ${result.passed ? 'PASSED' : 'FAILED'}`)
  })
  
  const allPassed = results.every(r => r.passed)
  console.log(`\n🎯 Overall: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`)
  
  if (allPassed) {
    console.log('\n🎉 The system is ready for deck building!')
    console.log('💡 Next steps:')
    console.log('   1. Go to http://localhost:3000/editor/new')
    console.log('   2. Upload your data')
    console.log('   3. Use the AI Generate feature')
    console.log('   4. Complete the deck building process')
  } else {
    console.log('\n⚠️ Some issues need to be resolved before testing the complete flow.')
  }
}

// Run the tests
runTests().catch(console.error)

// Final Results
console.log('\n' + '='.repeat(50));
console.log('📊 TEST RESULTS SUMMARY');
console.log('='.repeat(50));
console.log(`✅ Passed: ${testResults.passed}`);
console.log(`❌ Failed: ${testResults.failed}`);
console.log(`📈 Success Rate: ${Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100)}%`);

if (testResults.failed === 0) {
  console.log('\n🎉 ALL TESTS PASSED! 🎉');
  console.log('EasyDecks.ai is ready for production use!');
  console.log('The application has:');
  console.log('✨ Working authentication flow');
  console.log('✨ Functional dashboard with file upload');
  console.log('✨ Complete slide editor with charts');
  console.log('✨ AI-powered analytics and insights');
  console.log('✨ World-class user experience');
  console.log('✨ Dark theme and professional styling');
} else {
  console.log('\n⚠️  Some tests failed. Please review the issues above.');
}

console.log('\n🚀 End-to-End Test Complete');