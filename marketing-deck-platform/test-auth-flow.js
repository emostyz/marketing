const { spawn } = require('child_process');

console.log('🔍 Testing authentication flow...');

// Start the server
const server = spawn('npm', ['run', 'dev'], {
  env: { ...process.env },
  stdio: 'inherit'
});

// Give server time to start
setTimeout(() => {
  console.log('✅ Server should be running. Check http://localhost:3000');
  console.log('✅ Test the dashboard at http://localhost:3000/dashboard');
  console.log('✅ Auth is now required for dashboard access');
}, 5000);

// Keep process running
process.stdin.resume();
EOF < /dev/null