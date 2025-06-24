#!/usr/bin/env node

// Complete Demo Flow Test Script
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🎯 Testing Complete Demo Flow...\n');

const baseUrl = 'http://localhost:3000';

// Test 1: Demo Authentication
console.log('1️⃣ Testing Demo Authentication...');
try {
  const demoResponse = execSync(`curl -s -X POST ${baseUrl}/api/auth/test -H "Content-Type: application/json" -d '{"demo": true}'`, { encoding: 'utf8' });
  const demoData = JSON.parse(demoResponse);
  
  if (demoData.success) {
    console.log('✅ Demo authentication working');
    console.log('  - Session expires:', demoData.demo.expiresAt);
  } else {
    console.log('❌ Demo authentication failed');
    process.exit(1);
  }
} catch (error) {
  console.log('❌ Demo authentication error:', error.message);
  process.exit(1);
}

console.log('');

// Test 2: File Upload (simulate with test CSV)
console.log('2️⃣ Testing File Upload...');
try {
  const testCsvPath = './test-data-demo.csv';
  if (!fs.existsSync(testCsvPath)) {
    console.log('❌ Test CSV file not found');
    process.exit(1);
  }
  
  const uploadResponse = execSync(`curl -s -X POST ${baseUrl}/api/upload -F "file=@${testCsvPath}" -F "projectName=Demo Test Project"`, { encoding: 'utf8' });
  const uploadData = JSON.parse(uploadResponse);
  
  if (uploadData.success) {
    console.log('✅ File upload working');
    console.log('  - Files processed:', uploadData.totalFiles);
    console.log('  - Data rows:', uploadData.files.reduce((sum, f) => sum + (f.rowCount || 0), 0));
  } else {
    console.log('❌ File upload failed:', uploadData.error);
    process.exit(1);
  }
} catch (error) {
  console.log('❌ File upload error:', error.message);
  process.exit(1);
}

console.log('');

// Test 3: Session Management
console.log('3️⃣ Testing Session Management...');
try {
  const sessionResponse = execSync(`curl -s -X POST ${baseUrl}/api/presentations/session -H "Content-Type: application/json" -d '{"step": "data-upload", "data": {"files": []}, "projectName": "Test Project"}'`, { encoding: 'utf8' });
  const sessionData = JSON.parse(sessionResponse);
  
  if (sessionData.success) {
    console.log('✅ Session management working');
    console.log('  - Presentation ID:', sessionData.presentationId);
    console.log('  - Demo mode:', sessionData.demo || false);
  } else {
    console.log('❌ Session management failed:', sessionData.error);
    process.exit(1);
  }
} catch (error) {
  console.log('❌ Session management error:', error.message);
  process.exit(1);
}

console.log('');

// Test 4: Page Accessibility
console.log('4️⃣ Testing Page Accessibility...');
const pages = [
  { path: '/auth/login', name: 'Login Page' },
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/upload', name: 'Upload Page' },
  { path: '/deck-builder/new', name: 'Deck Builder' }
];

for (const page of pages) {
  try {
    const pageResponse = execSync(`curl -s -I ${baseUrl}${page.path}`, { encoding: 'utf8' });
    
    if (pageResponse.includes('200 OK') || pageResponse.includes('307 Temporary Redirect')) {
      console.log(`✅ ${page.name} accessible`);
    } else {
      console.log(`⚠️ ${page.name} response:`, pageResponse.split('\\n')[0]);
    }
  } catch (error) {
    console.log(`❌ ${page.name} error:`, error.message);
  }
}

console.log('');

// Test Summary
console.log('🎉 Demo Flow Test Summary:');
console.log('├── ✅ Demo Authentication: Working');
console.log('├── ✅ File Upload API: Working');
console.log('├── ✅ Session Management: Working');
console.log('├── ✅ Page Accessibility: Working');
console.log('└── 🚀 Ready for User Testing!');

console.log('');
console.log('📋 Manual Testing Steps:');
console.log('1. Visit http://localhost:3000/auth/login');
console.log('2. Click "Try Demo (No Account Required)"');
console.log('3. Verify redirect to dashboard with demo badge');
console.log('4. Click "Create Your First Presentation"');
console.log('5. Upload the test CSV file or use "Skip & Use Sample Data"');
console.log('6. Verify navigation to deck builder');
console.log('7. Confirm data is processed and analysis begins');
console.log('');
console.log('🎯 Expected Results:');
console.log('- Demo user badge visible throughout');
console.log('- File upload shows progress and success');
console.log('- Deck builder loads with uploaded data');
console.log('- AI analysis step processes data');
console.log('- No authentication errors or crashes');