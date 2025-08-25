require('dotenv').config();
const fast2smsService = require('./utils/fast2sms');

async function testFast2SMS() {
  console.log('Testing Fast2SMS Integration...\n');

  // Test 1: Check balance
  console.log('1. Testing balance check...');
  const balanceResult = await fast2smsService.checkBalance();
  console.log('Balance Result:', balanceResult);
  console.log('');

  // Test 2: Send OTP (replace with actual phone number for testing)
  console.log('2. Testing OTP sending...');
  const testPhone = '9999999999'; // Replace with actual phone number for testing
  const testOTP = '1234';
  
  const otpResult = await fast2smsService.sendOTP(testPhone, testOTP);
  console.log('OTP Result:', otpResult);
  console.log('');

  // Test 3: Send custom message
  console.log('3. Testing custom message...');
  const customMessageResult = await fast2smsService.sendCustomMessage(
    testPhone, 
    'This is a test message from Banner App'
  );
  console.log('Custom Message Result:', customMessageResult);
  console.log('');

  // Test 4: Test with invalid phone number
  console.log('4. Testing with invalid phone number...');
  const invalidPhoneResult = await fast2smsService.sendOTP('123', '1234');
  console.log('Invalid Phone Result:', invalidPhoneResult);
  console.log('');

  // Test 5: Test with invalid OTP
  console.log('5. Testing with invalid OTP...');
  const invalidOtpResult = await fast2smsService.sendOTP('9999999999', '123');
  console.log('Invalid OTP Result:', invalidOtpResult);
  console.log('');

  console.log('Fast2SMS testing completed!');
}

// Run the test
testFast2SMS().catch(console.error);
