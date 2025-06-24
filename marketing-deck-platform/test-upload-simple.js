// Simple upload test
async function testUpload() {
  console.log('🚀 Testing upload endpoint...');
  
  const formData = new FormData();
  const csvContent = `Date,Revenue,Customers,Product
2024-01,50000,1200,Product A
2024-02,55000,1350,Product A
2024-03,48000,1150,Product B`;
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  formData.append('file', blob, 'test-data.csv');
  
  try {
    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      headers: {
        'x-demo-mode': 'true',
        'x-demo-user-id': 'demo-user-id',
      },
      body: formData,
    });

    const data = await response.json();
    
    console.log('Upload response:', {
      success: response.ok,
      status: response.status,
      datasets: data?.datasets?.length || 0,
      files: data?.files?.length || 0,
      firstDataset: data?.datasets?.[0],
      firstFileData: data?.files?.[0]?.data?.length || 0,
    });
    
    if (response.ok) {
      console.log('✅ Upload test successful!');
      console.log('Dataset ID:', data.datasets?.[0]?.id);
      console.log('Data rows:', data.files?.[0]?.data?.length);
      console.log('Sample data:', data.files?.[0]?.data?.[0]);
    } else {
      console.log('❌ Upload failed:', data);
    }
    
  } catch (error) {
    console.error('❌ Upload error:', error.message);
  }
}

testUpload();