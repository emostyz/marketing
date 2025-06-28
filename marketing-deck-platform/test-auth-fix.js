const { spawn } = require('child_process');

async function testServer() {
  console.log('🤖 Testing server startup and auth...');
  
  const server = spawn('npm', ['run', 'dev'], { 
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'development' }
  });
  
  let logs = '';
  
  server.stdout.on('data', (data) => {
    const output = data.toString();
    logs += output;
    console.log('📝', output.trim());
  });
  
  server.stderr.on('data', (data) => {
    const output = data.toString();
    logs += output;
    console.log('❌', output.trim());
  });
  
  // Test for 15 seconds
  setTimeout(() => {
    console.log('🔍 Analyzing logs...');
    
    if (logs.includes('Ready in')) {
      console.log('✅ Server started successfully');
    } else {
      console.log('❌ Server failed to start');
    }
    
    if (logs.includes('Auth session missing')) {
      console.log('❌ Auth still broken');
    }
    
    if (logs.includes('MODULE_NOT_FOUND')) {
      console.log('❌ Build issues detected');
    }
    
    server.kill();
    console.log('⏹️ Test complete');
  }, 15000);
}

testServer();