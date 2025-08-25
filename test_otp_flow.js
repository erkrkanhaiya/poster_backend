require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:4000/api/v1/users';

// Test configuration
const TEST_PHONE = '9999999999'; // Replace with actual phone number for testing
const TEST_OTP = '1234';

async function testOTPFlow() {
  console.log('🧪 Testing Complete OTP Flow with Fast2SMS Integration\n');

  try {
    // Test 1: Send OTP
    console.log('1️⃣ Testing Send OTP...');
    const sendOtpResponse = await axios.post(`${BASE_URL}/send-otp`, {
      phone: TEST_PHONE
    });
    
    console.log('✅ Send OTP Response:', {
      status: sendOtpResponse.data.status,
      message: sendOtpResponse.data.message,
      hasOtp: !!sendOtpResponse.data.data.otp
    });

    // Test 2: Verify OTP (should fail with wrong OTP)
    console.log('\n2️⃣ Testing Verify OTP with wrong OTP...');
    try {
      const wrongOtpResponse = await axios.post(`${BASE_URL}/verify-otp`, {
        phone: TEST_PHONE,
        otp: '9999'
      });
      console.log('❌ Unexpected success with wrong OTP');
    } catch (error) {
      console.log('✅ Correctly rejected wrong OTP:', {
        status: error.response.data.status,
        message: error.response.data.message,
        attemptsRemaining: error.response.data.data.attemptsRemaining
      });
    }

    // Test 3: Verify OTP with correct OTP (if in dev mode)
    console.log('\n3️⃣ Testing Verify OTP with correct OTP...');
    if (process.env.DEV_OTP_BYPASS === 'true') {
      const verifyOtpResponse = await axios.post(`${BASE_URL}/verify-otp`, {
        phone: TEST_PHONE,
        otp: TEST_OTP
      });
      
      console.log('✅ Verify OTP Response:', {
        status: verifyOtpResponse.data.status,
        message: verifyOtpResponse.data.message,
        requiresProfileCompletion: verifyOtpResponse.data.data.requiresProfileCompletion,
        isNewUser: verifyOtpResponse.data.data.isNewUser,
        otpVerified: verifyOtpResponse.data.data.otpVerified
      });
    } else {
      console.log('⚠️  Skipping OTP verification test (not in dev mode)');
    }

    // Test 4: Test resend OTP
    console.log('\n4️⃣ Testing Resend OTP...');
    const resendOtpResponse = await axios.post(`${BASE_URL}/resend-otp`, {
      phone: TEST_PHONE
    });
    
    console.log('✅ Resend OTP Response:', {
      status: resendOtpResponse.data.status,
      message: resendOtpResponse.data.message,
      hasOtp: !!resendOtpResponse.data.data.otp
    });

    // Test 5: Test rate limiting
    console.log('\n5️⃣ Testing Rate Limiting...');
    try {
      await axios.post(`${BASE_URL}/resend-otp`, {
        phone: TEST_PHONE
      });
      console.log('❌ Rate limiting not working');
    } catch (error) {
      if (error.response.status === 429) {
        console.log('✅ Rate limiting working correctly:', {
          status: error.response.data.status,
          message: error.response.data.message
        });
      } else {
        console.log('❌ Unexpected error:', error.response.data);
      }
    }

    // Test 6: Test invalid phone number
    console.log('\n6️⃣ Testing Invalid Phone Number...');
    try {
      await axios.post(`${BASE_URL}/send-otp`, {
        phone: '123'
      });
      console.log('❌ Invalid phone number not rejected');
    } catch (error) {
      console.log('✅ Correctly rejected invalid phone number:', {
        status: error.response.data.status,
        message: error.response.data.message
      });
    }

    // Test 7: Test invalid OTP format
    console.log('\n7️⃣ Testing Invalid OTP Format...');
    try {
      await axios.post(`${BASE_URL}/verify-otp`, {
        phone: TEST_PHONE,
        otp: '123'
      });
      console.log('❌ Invalid OTP format not rejected');
    } catch (error) {
      console.log('✅ Correctly rejected invalid OTP format:', {
        status: error.response.data.status,
        message: error.response.data.message
      });
    }

    console.log('\n🎉 OTP Flow Testing Completed Successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Test Fast2SMS service directly
async function testFast2SMSService() {
  console.log('\n📱 Testing Fast2SMS Service Directly...\n');
  
  try {
    const fast2smsService = require('./utils/fast2sms');
    
    // Test balance check
    console.log('1️⃣ Testing Balance Check...');
    const balanceResult = await fast2smsService.checkBalance();
    console.log('Balance Result:', balanceResult);
    
    // Test OTP sending
    console.log('\n2️⃣ Testing OTP Sending...');
    const otpResult = await fast2smsService.sendOTP(TEST_PHONE, TEST_OTP);
    console.log('OTP Result:', otpResult);
    
    // Test custom message
    console.log('\n3️⃣ Testing Custom Message...');
    const customResult = await fast2smsService.sendCustomMessage(
      TEST_PHONE, 
      'Test message from Banner App'
    );
    console.log('Custom Message Result:', customResult);
    
  } catch (error) {
    console.error('❌ Fast2SMS Service Test failed:', error.message);
  }
}

// Run tests
async function runAllTests() {
  console.log('🚀 Starting OTP Flow Tests...\n');
  
  await testOTPFlow();
  await testFast2SMSService();
  
  console.log('\n✨ All tests completed!');
}

// Check if running directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { testOTPFlow, testFast2SMSService };
