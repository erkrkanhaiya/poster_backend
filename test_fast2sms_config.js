require('dotenv').config();

console.log('🔍 Fast2SMS Configuration Check\n');

// Check environment variables
console.log('1️⃣ Environment Variables:');
console.log('FAST2SMS_API_KEY:', process.env.FAST2SMS_API_KEY ? '✅ Set' : '❌ Not set');
console.log('FAST2SMS_SENDER_ID:', process.env.FAST2SMS_SENDER_ID || '❌ Not set');
console.log('FAST2SMS_ROUTE:', process.env.FAST2SMS_ROUTE || '❌ Not set');
console.log('FAST2SMS_TEMPLATE_ID:', process.env.FAST2SMS_TEMPLATE_ID || '❌ Not set');
console.log('DEV_OTP_BYPASS:', process.env.DEV_OTP_BYPASS || '❌ Not set');
console.log('');

// Test Fast2SMS service
async function testFast2SMS() {
  try {
    console.log('2️⃣ Testing Fast2SMS Service:');
    
    const fast2smsService = require('./utils/fast2sms');
    console.log('✅ Fast2SMS service loaded successfully');
    
    // Test with a dummy phone number
    const testPhone = '9999999999';
    const testOTP = '1234';
    
    console.log('📱 Testing OTP sending...');
    const result = await fast2smsService.sendOTP(testPhone, testOTP);
    
    console.log('📊 Result:', {
      success: result.success,
      message: result.message,
      hasError: !!result.error
    });
    
    if (result.error) {
      console.log('❌ Error details:', result.error.message);
    }
    
  } catch (error) {
    console.log('❌ Fast2SMS test failed:', error.message);
  }
}

// Test the login endpoint
async function testLoginEndpoint() {
  try {
    console.log('\n3️⃣ Testing Login Endpoint:');
    
    const axios = require('axios');
    const testPhone = '9999999999';
    
    console.log('📡 Making request to /api/v1/users/login...');
    const response = await axios.post('http://localhost:4000/api/v1/users/login', {
      phone: testPhone
    });
    
    console.log('✅ Login endpoint response:', {
      status: response.data.status,
      message: response.data.message,
      hasOtp: !!response.data.data.otp
    });
    
    if (response.data.data.otp) {
      console.log('🔢 OTP received:', response.data.data.otp);
    }
    
  } catch (error) {
    console.log('❌ Login endpoint test failed:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Message:', error.response.data.message);
      console.log('Data:', error.response.data.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

// Run tests
async function runTests() {
  await testFast2SMS();
  await testLoginEndpoint();
  
  console.log('\n📋 Summary:');
  console.log('- Check if FAST2SMS_API_KEY is set in your .env file');
  console.log('- Make sure your Fast2SMS account has sufficient balance');
  console.log('- Verify your sender ID is approved by Fast2SMS');
  console.log('- Set DEV_OTP_BYPASS=true for development testing');
}

runTests().catch(console.error);
