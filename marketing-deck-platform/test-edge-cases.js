// Test edge cases for upload-to-slides flow
async function testEdgeCases() {
  console.log('🧪 Testing edge cases for upload-to-slides flow\n');
  
  const API_BASE_URL = 'http://localhost:3000/api';
  
  // Test 1: Empty file upload
  console.log('1️⃣ Testing empty file upload...');
  try {
    const formData = new FormData();
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        'x-demo-mode': 'true',
        'x-demo-user-id': 'demo-user-id',
      },
      body: formData,
    });
    
    const data = await response.json();
    console.log('Empty file result:', {
      success: response.ok,
      status: response.status,
      error: data.error
    });
  } catch (error) {
    console.error('Empty file test error:', error.message);
  }
  
  // Test 2: Invalid CSV format
  console.log('\n2️⃣ Testing invalid CSV format...');
  try {
    const formData = new FormData();
    const invalidCsv = `Invalid format
    ,no,headers
    malformed,data`;
    const blob = new Blob([invalidCsv], { type: 'text/csv' });
    formData.append('file', blob, 'invalid.csv');
    
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        'x-demo-mode': 'true',
        'x-demo-user-id': 'demo-user-id',
      },
      body: formData,
    });
    
    const data = await response.json();
    console.log('Invalid CSV result:', {
      success: response.ok,
      status: response.status,
      datasets: data?.datasets?.length || 0,
      fileType: data?.files?.[0]?.fileType,
      dataRows: data?.files?.[0]?.data?.length || 0
    });
  } catch (error) {
    console.error('Invalid CSV test error:', error.message);
  }
  
  // Test 3: Unsupported file type
  console.log('\n3️⃣ Testing unsupported file type...');
  try {
    const formData = new FormData();
    const textContent = 'This is a plain text file';
    const blob = new Blob([textContent], { type: 'text/plain' });
    formData.append('file', blob, 'test.txt');
    
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        'x-demo-mode': 'true',
        'x-demo-user-id': 'demo-user-id',
      },
      body: formData,
    });
    
    const data = await response.json();
    console.log('Unsupported file result:', {
      success: response.ok,
      status: response.status,
      fileType: data?.files?.[0]?.fileType,
      message: data?.files?.[0]?.message
    });
  } catch (error) {
    console.error('Unsupported file test error:', error.message);
  }
  
  // Test 4: Analysis with missing required fields
  console.log('\n4️⃣ Testing analysis with missing fields...');
  try {
    const response = await fetch(`${API_BASE_URL}/openai/enhanced-analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-demo-mode': 'true',
      },
      body: JSON.stringify({
        data: [{ test: 'data' }]
        // Missing context, timeFrame, requirements
      }),
    });
    
    const data = await response.json();
    console.log('Missing fields result:', {
      success: response.ok,
      status: response.status,
      error: data.error
    });
  } catch (error) {
    console.error('Missing fields test error:', error.message);
  }
  
  // Test 5: Very large CSV (simulate)
  console.log('\n5️⃣ Testing large CSV handling...');
  try {
    const formData = new FormData();
    let csvContent = 'Date,Revenue,Customers,Product\n';
    
    // Create 100 rows of data
    for (let i = 1; i <= 100; i++) {
      csvContent += `2024-${String(i % 12 + 1).padStart(2, '0')}-${String(i % 28 + 1).padStart(2, '0')},${50000 + i * 100},${1200 + i * 10},Product ${String.fromCharCode(65 + (i % 3))}\n`;
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    formData.append('file', blob, 'large-data.csv');
    
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        'x-demo-mode': 'true',
        'x-demo-user-id': 'demo-user-id',
      },
      body: formData,
    });
    
    const data = await response.json();
    console.log('Large CSV result:', {
      success: response.ok,
      status: response.status,
      dataRows: data?.files?.[0]?.data?.length || 0,
      fileSize: data?.files?.[0]?.fileSize || 0
    });
  } catch (error) {
    console.error('Large CSV test error:', error.message);
  }
  
  console.log('\n✅ Edge case testing completed!');
}

testEdgeCases();