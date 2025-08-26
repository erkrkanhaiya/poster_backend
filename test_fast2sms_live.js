require('dotenv').config();

console.log('🔍 Testing Fast2SMS Live Routes\n');

const fast2smsService = require('./utils/fast2sms');

async function testFast2SMSRoutes() {
  const testPhone = '9999999999';
  const testOTP = '1234';
  
  console.log('📱 Testing Fast2SMS with different routes...');
  console.log('API Key:', process.env.FAST2SMS_API_KEY ? '✅ Set' : '❌ Not set');
  console.log('Sender ID:', process.env.FAST2SMS_SENDER_ID || '❌ Not set');
  console.log('');
  
  try {
    const result = await fast2smsService.sendOTP(testPhone, testOTP);
    
    console.log('📊 Final Result:');
    console.log('Success:', result.success);
    console.log('Message:', result.message);
    
    if (result.error) {
      console.log('Error:', result.error.message);
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testFast2SMSRoutes().catch(console.error);
