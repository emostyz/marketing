const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://waddrfstpqkvdfwbxvfw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhZGRyZnN0cHFrdmRmd2J4dmZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNDU3NzUsImV4cCI6MjA2NTkyMTc3NX0.xzosM3NHbf_kpmw5hRFKKqDuvbNLp9MrqsWITk9tD5w';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFrontendAuth() {
  console.log('🧪 Testing frontend authentication flow...\n');
  
  try {
    const email = 'test@aedrin.com';
    const password = 'password123';
    
    console.log('1️⃣ Initial session check...');
    const { data: { session: initialSession } } = await supabase.auth.getSession();
    console.log('📊 Initial session:', initialSession ? 'Active' : 'None');
    
    console.log('\n2️⃣ Setting up auth state change listener...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`🔄 Auth state changed: ${event}`, session?.user?.email || 'No user');
    });
    
    console.log('\n3️⃣ Attempting sign in...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('❌ Sign in error:', error);
      return;
    }
    
    console.log('✅ Sign in successful');
    console.log('👤 User:', data.user.email);
    console.log('🔑 Session:', data.session ? 'Active' : 'None');
    
    console.log('\n4️⃣ Waiting for auth state change...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('\n5️⃣ Checking session after delay...');
    const { data: { session: delayedSession } } = await supabase.auth.getSession();
    console.log('📊 Delayed session:', delayedSession ? 'Active' : 'None');
    
    console.log('\n6️⃣ Fetching user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', data.user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Profile error:', profileError);
    } else {
      console.log('✅ Profile fetched:', profile.full_name);
    }
    
    console.log('\n7️⃣ Testing session persistence...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const { data: { session: finalSession } } = await supabase.auth.getSession();
    console.log('📊 Final session:', finalSession ? 'Active' : 'None');
    
    console.log('\n8️⃣ Cleaning up...');
    subscription.unsubscribe();
    await supabase.auth.signOut();
    
    console.log('\n🎉 Frontend auth test completed!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testFrontendAuth(); 