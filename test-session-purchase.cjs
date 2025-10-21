const jwt = require('jsonwebtoken');

async function testSessionPurchase() {
  // Create a JWT token for Simon
  const userId = 'cfc5354a-97fc-432c-822c-9f899f37bc4a';
  const institutionId = '12345678-1234-1234-1234-123456789012';
  const token = jwt.sign(
    { 
      userId, 
      email: 'supremeesimon@gmail.com',
      name: 'Simon Onabanjo',
      institutionId,
      role: 'institution_admin'
    }, 
    'octavia_interview_buddy_jwt_secret_key_32_chars', 
    { expiresIn: '1h' }
  );

  console.log('JWT Token created for Simon Onabanjo');
  console.log('User ID:', userId);
  console.log('Institution ID:', institutionId);

  // Use dynamic import for node-fetch
  const fetch = (await import('node-fetch')).default;

  try {
    // Test the session purchase with this token
    const response = await fetch('http://localhost:3005/api/sessions/purchases', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        sessionCount: 5,
        pricePerSession: 1000,
        institutionId: '12345678-1234-1234-1234-123456789012'
      })
    });
    
    const data = await response.json();
    console.log('Purchase response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testSessionPurchase();