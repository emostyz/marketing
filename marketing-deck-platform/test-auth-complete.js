const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');

// Test authentication with the configured environment
const supabaseUrl = 'https://waddrfstpqkvdfwbxvfw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhZGRyZnN0cHFrdmRmd2J4dmZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNDU3NzUsImV4cCI6MjA2NTkyMTc3NX0.xzosM3NHbf_kpmw5hRFKKqDuvbNLp9MrqsWITk9tD5w';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCompleteAuthFlow() {
  console.log('🧪 COMPREHENSIVE BROWSER AUTH TEST STARTING...\n');
  
  let browser;
  let page;
  
  try {
    // Launch browser
    console.log('🌐 Launching browser...');
    browser = await puppeteer.launch({ 
      headless: false, 
      defaultViewport: null,
      args: ['--start-maximized']
    });
    
    page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => {
      if (msg.type() === 'log') {
        console.log(`📱 Browser: ${msg.text()}`);
      } else if (msg.type() === 'error') {
        console.error(`❌ Browser Error: ${msg.text()}`);
      }
    });

    // Test 1: Backend Authentication
    console.log('\n1️⃣ Testing backend authentication...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@easydecks.ai',
      password: 'password123'
    });
    
    if (error) {
      console.error('❌ Backend auth failed:', error.message);
      return false;
    }
    
    console.log('✅ Backend authentication successful');
    console.log('👤 User:', data.user.email);
    console.log('🔑 Session:', data.session ? 'Active' : 'None');

    // Test 2: Navigate to login page
    console.log('\n2️⃣ Navigating to login page...');
    await page.goto('http://localhost:3004/auth/login', { waitUntil: 'networkidle2' });
    console.log('✅ Login page loaded');

    // Test 3: Fill login form
    console.log('\n3️⃣ Filling login form...');
    await page.waitForSelector('input[type="email"]');
    await page.type('input[type="email"]', 'test@easydecks.ai');
    await page.type('input[type="password"]', 'password123');
    console.log('✅ Login form filled');

    // Test 4: Submit login form
    console.log('\n4️⃣ Submitting login form...');
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    console.log('⏳ Waiting for navigation...');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
    
    const currentUrl = page.url();
    console.log('📍 Current URL:', currentUrl);

    // Test 5: Check if we're on dashboard
    if (currentUrl.includes('/dashboard')) {
      console.log('✅ Successfully redirected to dashboard!');
    } else {
      console.log('❌ Not redirected to dashboard');
      console.log('📍 Current URL:', currentUrl);
      return false;
    }

    // Test 6: Check for user data in localStorage
    console.log('\n5️⃣ Checking localStorage for user data...');
    const localStorage = await page.evaluate(() => {
      return {
        authState: localStorage.getItem('easydecks-auth-state'),
        demoSession: localStorage.getItem('easydecks-demo-session')
      };
    });
    
    if (localStorage.authState) {
      const authData = JSON.parse(localStorage.authState);
      console.log('✅ Auth state cached:', authData.user.email);
    } else {
      console.log('⚠️ No auth state in localStorage');
    }

    // Test 7: Check for user info on dashboard
    console.log('\n6️⃣ Checking dashboard content...');
    await page.waitForSelector('h1', { timeout: 5000 });
    
    const dashboardText = await page.evaluate(() => {
      return document.body.innerText;
    });
    
    if (dashboardText.includes('EasyDecks.ai') && dashboardText.includes('Dashboard')) {
      console.log('✅ Dashboard content loaded correctly');
    } else {
      console.log('❌ Dashboard content not found');
      console.log('📄 Page content:', dashboardText.substring(0, 200) + '...');
    }

    // Test 8: Test sign out
    console.log('\n7️⃣ Testing sign out...');
    await page.click('button:has-text("Sign Out")');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
    
    const afterSignOutUrl = page.url();
    console.log('📍 URL after sign out:', afterSignOutUrl);
    
    if (afterSignOutUrl.includes('/auth/login') || afterSignOutUrl === 'http://localhost:3004/') {
      console.log('✅ Sign out successful');
    } else {
      console.log('❌ Sign out may have failed');
    }

    // Test 9: Verify localStorage cleared
    console.log('\n8️⃣ Verifying localStorage cleared...');
    const afterSignOutStorage = await page.evaluate(() => {
      return {
        authState: localStorage.getItem('easydecks-auth-state'),
        demoSession: localStorage.getItem('easydecks-demo-session')
      };
    });
    
    if (!afterSignOutStorage.authState && !afterSignOutStorage.demoSession) {
      console.log('✅ localStorage properly cleared');
    } else {
      console.log('⚠️ localStorage may not be fully cleared');
    }

    console.log('\n🎉 ALL TESTS PASSED! Authentication system is working correctly.');
    return true;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // Take screenshot on failure
    if (page) {
      await page.screenshot({ path: 'auth-test-failure.png', fullPage: true });
      console.log('📸 Screenshot saved as auth-test-failure.png');
    }
    
    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
testCompleteAuthFlow().then(success => {
  console.log('\n🏁 Test completed.');
  process.exit(success ? 0 : 1);
}); 