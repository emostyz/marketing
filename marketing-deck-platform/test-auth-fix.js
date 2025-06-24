const { createClient } = require('@supabase/supabase-js');

// Test authentication with the configured environment
const supabaseUrl = 'https://waddrfstpqkvdfwbxvfw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhZGRyZnN0cHFrdmRmd2J4dmZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNDU3NzUsImV4cCI6MjA2NTkyMTc3NX0.xzosM3NHbf_kpmw5hRFKKqDuvbNLp9MrqsWITk9tD5w';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Connection error:', error);
      return;
    }
    
    console.log('✅ Supabase connection successful');
    console.log('📊 Current session:', data.session ? 'Active' : 'None');
    
    // Test sign up with a test user
    const testEmail = `test${Date.now()}@gmail.com`;
    const testPassword = 'testpassword123';
    
    console.log(`\n🔐 Testing sign up with email: ${testEmail}`);
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });
    
    if (signUpError) {
      console.error('❌ Sign up error:', signUpError);
      return;
    }
    
    console.log('✅ Sign up successful');
    console.log('👤 User ID:', signUpData.user?.id);
    
    // Test sign in
    console.log('\n🔑 Testing sign in...');
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (signInError) {
      console.error('❌ Sign in error:', signInError);
      return;
    }
    
    console.log('✅ Sign in successful');
    console.log('🎉 Authentication test completed successfully!');
    
    // Clean up - sign out
    await supabase.auth.signOut();
    console.log('🧹 Cleaned up test session');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testAuth(); 