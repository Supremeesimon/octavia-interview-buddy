async function testAuthError() {
  try {
    // Dynamically import node-fetch
    const { default: fetch } = await import('node-fetch');
    
    // Try to access a protected endpoint with an expired token
    const response = await fetch('http://localhost:3005/api/sessions/purchases', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJzdHVkZW50IiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyNDI2MjJ9.6YcFbJvM4bW3qJyvJQ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5' // Expired token
      },
      body: JSON.stringify({
        sessionCount: 1,
        pricePerSession: 10
      })
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

testAuthError();