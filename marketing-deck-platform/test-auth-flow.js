/**
 * Authentication Flow Test
 * Tests the demo login API endpoint to ensure it works correctly
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://waddrfstpqkvdfwbxvfw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhZGRyZnN0cHFrdmRmd2J4dmZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNDU3NzUsImV4cCI6MjA2NTkyMTc3NX0.xzosM3NHbf_kpmw5hRFKKqDuvbNLp9MrqsWITk9tD5w';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuthFlow() {
  console.log('🔍 Testing complete authentication flow...\n');
  
  try {
    // Test user credentials
    const email = 'test@easydecks.ai';
    const password = 'password123';
    
    console.log(`🔐 Step 1: Signing in with ${email}`);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.log(`❌ Sign in failed: ${error.message}`);
      return;
    }
    
    if (data.user && data.session) {
      console.log(`✅ Sign in successful!`);
      console.log(`👤 User ID: ${data.user.id}`);
      console.log(`📧 Email: ${data.user.email}`);
      console.log(`🔑 Session token: ${data.session.access_token ? 'Present' : 'Missing'}`);
      
      // Test getting user profile
      console.log(`\n🔍 Step 2: Fetching user profile...`);
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .single();
      
      if (profileError) {
        console.log(`❌ Profile fetch error: ${profileError.message}`);
        if (profileError.code === 'PGRST116') {
          console.log(`📝 Creating new profile...`);
          
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              user_id: data.user.id,
              email: data.user.email,
              full_name: data.user.user_metadata?.full_name || data.user.email,
              subscription_tier: 'free',
              is_active: true,
              email_verified: true
            })
            .select()
            .single();
          
          if (createError) {
            console.log(`❌ Profile creation failed: ${createError.message}`);
          } else {
            console.log(`✅ Profile created successfully:`, newProfile);
          }
        }
      } else {
        console.log(`✅ Profile found:`, profile);
      }
      
      // Test session persistence
      console.log(`\n🔍 Step 3: Testing session persistence...`);
      
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.log(`❌ Session check failed: ${sessionError.message}`);
      } else if (currentSession) {
        console.log(`✅ Session is persistent`);
        console.log(`👤 Current user: ${currentSession.user.email}`);
      } else {
        console.log(`❌ No current session found`);
      }
      
      // Test sign out
      console.log(`\n🔍 Step 4: Testing sign out...`);
      
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        console.log(`❌ Sign out failed: ${signOutError.message}`);
      } else {
        console.log(`✅ Sign out successful`);
        
        // Verify session is cleared
        const { data: { session: afterSignOut } } = await supabase.auth.getSession();
        if (!afterSignOut) {
          console.log(`✅ Session properly cleared`);
        } else {
          console.log(`❌ Session still exists after sign out`);
        }
      }
      
    } else {
      console.log(`❌ Sign in succeeded but no user/session data`);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testAuthFlow();

const testHealthEndpoint = async () => {
  console.log('\n🧪 Testing Health Endpoint...\n')
  
  try {
    const response = await fetch('http://localhost:3002/api/auth/test', {
      method: 'GET'
    })

    console.log('📊 Health Response Status:', response.status)
    console.log('📊 Health Response OK:', response.ok)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('📊 Health Data:', JSON.stringify(data, null, 2))

    if (data.success) {
      console.log('\n✅ Health Check PASSED')
      console.log('✅ Environment check:', JSON.stringify(data.environment, null, 2))
      return true
    } else {
      console.log('\n❌ Health Check FAILED')
      return false
    }

  } catch (error) {
    console.log('\n❌ Health Check FAILED')
    console.error('Error:', error.message)
    return false
  }
}

const runAllTests = async () => {
  console.log('🚀 Starting Authentication Flow Tests\n')
  console.log('=' .repeat(50))

  let allPassed = true

  // Test 1: Health Check
  const healthPassed = await testHealthEndpoint()
  allPassed = allPassed && healthPassed

  // Test 2: Demo Auth
  const demoPassed = await testAuthFlow()
  allPassed = allPassed && demoPassed

  console.log('\n' + '=' .repeat(50))
  console.log('🏁 Test Results Summary')
  console.log('=' .repeat(50))
  
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED!')
    console.log('✅ Authentication system is working correctly')
    console.log('✅ Demo login should work properly')
    console.log('✅ Users should be redirected to dashboard after login')
  } else {
    console.log('❌ SOME TESTS FAILED')
    console.log('🛠️  Please check the server logs and fix any issues')
  }

  return allPassed
}

// For Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testAuthFlow, testHealthEndpoint, runAllTests }
}

// Auto-run if this is the main script
if (typeof window === 'undefined' && typeof process !== 'undefined') {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1)
  })
}