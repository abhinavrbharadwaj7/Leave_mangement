// Test the send-otp API endpoint
const axios = require('axios');

async function testSendOTP() {
  console.log('=== Testing /api/send-otp endpoint ===\n');
  
  const testEmail = 'manger6700@gmail.com'; // Use your email for testing
  
  try {
    console.log(`Sending OTP to: ${testEmail}`);
    const response = await axios.post('http://localhost:3001/api/send-otp', {
      email: testEmail
    });
    
    console.log('✅ API Response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.otp) {
      console.log('\n🔑 OTP Code (development mode):', response.data.otp);
    }
    
  } catch (error) {
    console.error('❌ API Request Failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received from server');
      console.error('Request:', error.request);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testSendOTP();
