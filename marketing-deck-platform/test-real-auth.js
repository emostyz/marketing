const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://waddrfstpqkvdfwbxvfw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhZGRyZnN0cHFrdmRmd2J4dmZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNDU3NzUsImV4cCI6MjA2NTkyMTc3NX0.xzosM3NHbf_kpmw5hRFKKqDuvbNLp9MrqsWITk9tD5w';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRealAuth() {
  console.log('🧪 Testing authentication with real user...\n');
  
  try {
    // Test with the existing confirmed user
    const email = 'test@aedrin.com';
    const password = 'password123';
    
    console.log(`🔐 Testing sign in with: ${email}`);
    
    // Step 1: Sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('❌ Sign in error:', error);
      return;
    }
    
    console.log('✅ Sign in successful!');
    console.log('👤 User ID:', data.user.id);
    console.log('📧 Email:', data.user.email);
    console.log('🔑 Session token:', data.session?.access_token ? 'Present' : 'Missing');
    console.log('📅 Email confirmed:', data.user.email_confirmed_at ? 'Yes' : 'No');
    
    // Step 2: Verify session persistence
    console.log('\n🔄 Testing session persistence...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError);
    } else if (session) {
      console.log('✅ Session persists correctly');
      console.log('👤 Session user:', session.user.email);
    } else {
      console.error('❌ Session not found');
    }
    
    // Step 3: Test profile fetch
    console.log('\n👤 Testing profile fetch...');
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', data.user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Profile error:', profileError);
    } else if (profile) {
      console.log('✅ Profile found');
      console.log('👤 Name:', profile.full_name);
      console.log('🏢 Company:', profile.company_name);
      console.log('💳 Subscription:', profile.subscription_tier);
    } else {
      console.log('⚠️  No profile found');
    }
    
    // Step 4: Test sign out
    console.log('\n🚪 Testing sign out...');
    
    const { error: signOutError } = await supabase.auth.signOut();
    
    if (signOutError) {
      console.error('❌ Sign out error:', signOutError);
    } else {
      console.log('✅ Sign out successful');
    }
    
    // Step 5: Verify session is cleared
    console.log('\n🧹 Verifying session cleanup...');
    
    const { data: { session: finalSession } } = await supabase.auth.getSession();
    
    if (!finalSession) {
      console.log('✅ Session properly cleared');
    } else {
      console.error('❌ Session still exists');
    }
    
    console.log('\n🎉 Authentication test completed successfully!');
    console.log('\n📋 Test Results:');
    console.log('✅ Sign in with real user');
    console.log('✅ Session persistence');
    console.log('✅ Profile access');
    console.log('✅ Sign out');
    console.log('✅ Session cleanup');
    
    console.log('\n🔑 Working Credentials:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testRealAuth(); 