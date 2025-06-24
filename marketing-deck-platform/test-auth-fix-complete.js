const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

const supabaseUrl = 'https://waddrfstpqkvdfwbxvfw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhZGRyZnN0cHFrdmRmd2J4dmZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNDU3NzUsImV4cCI6MjA2NTkyMTc3NX0.xzosM3NHbf_kpmw5hRFKKqDuvbNLp9MrqsWITk9tD5w';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCompleteAuthFlow() {
  console.log('🧪 COMPREHENSIVE AUTH TEST STARTING...\n');
  
  const testResults = {
    supabaseConnection: false,
    signIn: false,
    sessionPersistence: false,
    profileFetch: false,
    signOut: false,
    errors: []
  };

  try {
    // Step 1: Test Supabase Connection
    console.log('1️⃣ Testing Supabase connection...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      testResults.errors.push(`Connection error: ${sessionError.message}`);
      console.error('❌ Connection error:', sessionError);
    } else {
      testResults.supabaseConnection = true;
      console.log('✅ Supabase connection successful');
      console.log('📊 Current session:', session ? 'Active' : 'None\n');
    }

    // Step 2: Test Sign In with Real User
    console.log('2️⃣ Testing sign in with real user...');
    const email = 'test@aedrin.com';
    const password = 'password123';
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      testResults.errors.push(`Sign in error: ${error.message}`);
      console.error('❌ Sign in error:', error);
    } else if (data.user && data.session) {
      testResults.signIn = true;
      console.log('✅ Sign in successful!');
      console.log('👤 User ID:', data.user.id);
      console.log('📧 Email:', data.user.email);
      console.log('🔑 Session token:', data.session.access_token ? 'Present' : 'Missing');
      console.log('📅 Email confirmed:', data.user.email_confirmed_at ? 'Yes' : 'No\n');
    } else {
      testResults.errors.push('Sign in returned no user or session');
      console.error('❌ Sign in returned no user or session');
    }

    // Step 3: Test Session Persistence
    if (testResults.signIn) {
      console.log('3️⃣ Testing session persistence...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { data: { session: persistentSession }, error: persistError } = await supabase.auth.getSession();
      
      if (persistError) {
        testResults.errors.push(`Session persistence error: ${persistError.message}`);
        console.error('❌ Session persistence error:', persistError);
      } else if (persistentSession) {
        testResults.sessionPersistence = true;
        console.log('✅ Session persists correctly');
        console.log('👤 Session user:', persistentSession.user.email);
        console.log('🔑 Access token:', persistentSession.access_token ? 'Present' : 'Missing\n');
      } else {
        testResults.errors.push('Session not found after sign in');
        console.error('❌ Session not found after sign in');
      }
    }

    // Step 4: Test Profile Fetch
    if (testResults.signIn) {
      console.log('4️⃣ Testing profile fetch...');
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .single();
      
      if (profileError) {
        testResults.errors.push(`Profile error: ${profileError.message}`);
        console.error('❌ Profile error:', profileError);
      } else if (profile) {
        testResults.profileFetch = true;
        console.log('✅ Profile fetched successfully');
        console.log('👤 Name:', profile.full_name);
        console.log('🏢 Company:', profile.company_name);
        console.log('💳 Subscription:', profile.subscription_tier);
        console.log('✅ Email verified:', profile.email_verified);
        console.log('✅ Is active:', profile.is_active);
      } else {
        testResults.errors.push('No profile found');
        console.log('⚠️  No profile found');
      }
    }

    // Step 5: Test Frontend Auth API
    console.log('\n5️⃣ Testing frontend auth API...');
    try {
      const response = await fetch('http://localhost:3004/api/auth/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test: true })
      });
      
      if (response.ok) {
        const apiData = await response.json();
        console.log('✅ Frontend auth API working');
        console.log('📊 API response:', apiData);
      } else {
        testResults.errors.push(`Frontend API error: ${response.status}`);
        console.error('❌ Frontend API error:', response.status);
      }
    } catch (apiError) {
      testResults.errors.push(`Frontend API connection error: ${apiError.message}`);
      console.error('❌ Frontend API connection error:', apiError.message);
    }

    // Step 6: Test Sign Out
    if (testResults.signIn) {
      console.log('\n6️⃣ Testing sign out...');
      
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        testResults.errors.push(`Sign out error: ${signOutError.message}`);
        console.error('❌ Sign out error:', signOutError);
      } else {
        testResults.signOut = true;
        console.log('✅ Sign out successful');
      }
    }

    // Step 7: Verify Session is Cleared
    if (testResults.signOut) {
      console.log('\n7️⃣ Verifying session cleanup...');
      
      const { data: { session: finalSession } } = await supabase.auth.getSession();
      
      if (!finalSession) {
        console.log('✅ Session properly cleared');
      } else {
        testResults.errors.push('Session still exists after sign out');
        console.error('❌ Session still exists after sign out');
      }
    }

    // Final Results
    console.log('\n' + '='.repeat(60));
    console.log('🎯 COMPREHENSIVE AUTH TEST RESULTS');
    console.log('='.repeat(60));
    
    const allTests = [
      { name: 'Supabase Connection', result: testResults.supabaseConnection },
      { name: 'Sign In', result: testResults.signIn },
      { name: 'Session Persistence', result: testResults.sessionPersistence },
      { name: 'Profile Fetch', result: testResults.profileFetch },
      { name: 'Sign Out', result: testResults.signOut }
    ];
    
    allTests.forEach(test => {
      console.log(`${test.result ? '✅' : '❌'} ${test.name}: ${test.result ? 'PASS' : 'FAIL'}`);
    });
    
    if (testResults.errors.length > 0) {
      console.log('\n❌ ERRORS FOUND:');
      testResults.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    const passedTests = allTests.filter(test => test.result).length;
    const totalTests = allTests.length;
    
    console.log(`\n📊 OVERALL RESULT: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      console.log('🎉 ALL TESTS PASSED! Authentication system is working correctly.');
      console.log('\n🔑 WORKING CREDENTIALS:');
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
    } else {
      console.log('⚠️  SOME TESTS FAILED. Authentication system needs fixing.');
    }
    
    return testResults;
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    testResults.errors.push(`Unexpected error: ${error.message}`);
    return testResults;
  }
}

// Run the test
testCompleteAuthFlow().then(results => {
  console.log('\n🏁 Test completed. Exiting...');
  process.exit(results.errors.length > 0 ? 1 : 0);
}); 