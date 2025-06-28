// Quick test to see if basic Next.js works
const { spawn } = require('child_process');

console.log('🚀 Starting test server...');

const nextDev = spawn('npx', ['next', 'dev', '--port', '3005'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

nextDev.on('error', (error) => {
  console.error('❌ Server error:', error);
});

nextDev.on('close', (code) => {
  console.log(`❌ Server exited with code ${code}`);
});

// Auto-kill after 30 seconds
setTimeout(() => {
  console.log('🛑 Stopping test server');
  nextDev.kill();
}, 30000);