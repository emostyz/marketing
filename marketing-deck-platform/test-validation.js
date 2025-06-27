// Comprehensive validation test for EasyDecks.ai application
// Run this after starting the dev server

const tests = [
  {
    name: "Homepage loads",
    url: "http://localhost:3000",
    expected: 200
  },
  {
    name: "Dashboard loads", 
    url: "http://localhost:3000/dashboard",
    expected: 200
  },
  {
    name: "Login page loads",
    url: "http://localhost:3000/auth/login", 
    expected: 200
  },
  {
    name: "Editor new page loads",
    url: "http://localhost:3000/editor/new",
    expected: 200
  },
  {
    name: "API generate endpoint works",
    url: "http://localhost:3000/api/generate",
    method: "POST",
    body: JSON.stringify({ title: "Test Presentation", data: [] }),
    headers: { "Content-Type": "application/json" },
    expected: 200
  }
];

async function runTest(test) {
  try {
    const options = {
      method: test.method || "GET",
      headers: test.headers || {},
      body: test.body || undefined
    };
    
    const response = await fetch(test.url, options);
    const status = response.status;
    const success = status === test.expected;
    
    console.log(`${success ? '✅' : '❌'} ${test.name}: ${status} (expected ${test.expected})`);
    
    if (!success) {
      const text = await response.text();
      console.log(`   Error: ${text.substring(0, 200)}...`);
    }
    
    return success;
  } catch (error) {
    console.log(`❌ ${test.name}: ERROR - ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log("🧪 Running EasyDecks.ai Application Tests...\n");
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    const success = await runTest(test);
    if (success) passed++;
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
  }
  
  console.log(`\n📊 Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log("🎉 All tests passed! EasyDecks.ai is working correctly.");
  } else {
    console.log("⚠️  Some tests failed. Please check the issues above.");
  }
}

// Check if server is running first
async function checkServer() {
  try {
    await fetch("http://localhost:3000");
    return true;
  } catch (error) {
    console.log("❌ Server not running on localhost:3000");
    console.log("Please run 'npm run dev' first");
    return false;
  }
}

// Main execution
(async () => {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runAllTests();
  }
})();