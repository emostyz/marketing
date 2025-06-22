import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

async function testOpenAI() {
  console.log('🧪 Testing OpenAI API Key in Isolation...\n');
  console.log('API Key present:', !!process.env.OPENAI_API_KEY);
  console.log('API Key starts with:', process.env.OPENAI_API_KEY?.substring(0, 10) + '...');
  
  try {
    console.log('📞 Making OpenAI API call...');
    const res = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'Hello world' }],
      max_tokens: 50
    });
    
    console.log('✅ OpenAI call successful!');
    console.log('Response:', res.choices[0].message.content);
    return true;
  } catch (err) {
    console.error('❌ OpenAI call failed:', err);
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    if (err.response) {
      console.error('Error response:', err.response.data);
    }
    return false;
  }
}

testOpenAI().then(success => {
  console.log('\n🎯 Test result:', success ? 'PASSED' : 'FAILED');
  process.exit(success ? 0 : 1);
}); 