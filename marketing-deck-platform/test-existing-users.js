const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://waddrfstpqkvdfwbxvfw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhZGRyZnN0cHFrdmRmd2J4dmZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNDU3NzUsImV4cCI6MjA2NTkyMTc3NX0.xzosM3NHbf_kpmw5hRFKKqDuvbNLp9MrqsWITk9tD5w';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testExistingUsers() {
  console.log('🔍 Checking for existing users in the system...\n');
  
  try {
    // Test some common email patterns
    const testEmails = [
      'admin@aedrin.com',
      'test@aedrin.com',
      'demo@aedrin.com',
      'user@aedrin.com',
      'admin@example.com',
      'test@example.com',
      'demo@example.com',
      'user@example.com',
      'emil@example.com',
      'emil@gmail.com',
      'test@gmail.com',
      'demo@gmail.com'
    ];
    
    const testPassword = 'password123';
    
    for (const email of testEmails) {
      console.log(`🔐 Testing login with: ${email}`);
      
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: testPassword
        });
        
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            console.log(`❌ Invalid credentials for ${email}`);
          } else if (error.message.includes('Email not confirmed')) {
            console.log(`⚠️  Email not confirmed for ${email}`);
          } else {
            console.log(`❌ Error for ${email}: ${error.message}`);
          }
        } else if (data.user) {
          console.log(`✅ SUCCESS! Found working user: ${email}`);
          console.log(`👤 User ID: ${data.user.id}`);
          console.log(`📧 Email confirmed: ${data.user.email_confirmed_at ? 'Yes' : 'No'}`);
          console.log(`🔑 Session: ${data.session ? 'Active' : 'None'}`);
          
          // Sign out and continue testing
          await supabase.auth.signOut();
          console.log(`🚪 Signed out from ${email}\n`);
        }
      } catch (err) {
        console.log(`❌ Exception for ${email}: ${err.message}`);
      }
    }
    
    console.log('🏁 Finished testing existing users');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testExistingUsers(); 