require('dotenv').config();
const fast2sms = require('fast-two-sms');

console.log('🔍 Checking Fast2SMS Account Status\n');

async function checkAccount() {
  try {
    console.log('📊 Checking account balance...');
    
    const balanceResponse = await fast2sms.getBalance({
      authorization: process.env.FAST2SMS_API_KEY
    });
    
    console.log('Balance Response:', balanceResponse);
    
    // Try to get sender IDs
    console.log('\n📱 Checking sender IDs...');
    
    const senderResponse = await fast2sms.getSenderId({
      authorization: process.env.FAST2SMS_API_KEY
    });
    
    console.log('Sender ID Response:', senderResponse);
    
  } catch (error) {
    console.log('❌ Error checking account:', error.message);
  }
}

checkAccount().catch(console.error);
