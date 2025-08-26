export const sendOTP = async (mobile, otp) => {
  try {
    // if (process.env.NODE_ENV !== "production") {
    //   console.log(`Dev mode: OTP ${otp} sent to ${mobile}`);
    //   return { success: true, dev: true, otp };
    // }

    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: "POST",
      headers: {
        Authorization: process.env.FAST2SMS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        route: "q", // or 'otp' if DLT approved
        numbers: mobile,
        message: `Your OTP is ${otp}. Valid for 5 minutes.`,
      }),
    });

    const data = await response.json();

    if (data.return) {
      return { success: true, data };
    } else {
      throw new Error(data.message || "Failed to send OTP");
    }
  } catch (error) {
    console.error("Fast2SMS OTP Error:", error.message);
    return { success: false, message: error.message };
  }
};


// const fast2sms = require('fast-two-sms');

// class Fast2SMSService {
//   constructor() {
//     this.apiKey = process.env.FAST2SMS_API_KEY;
//     this.senderId = process.env.FAST2SMS_SENDER_ID || 'BANNER';
//     this.route = process.env.FAST2SMS_ROUTE || 'otp';
//     this.templateId = process.env.FAST2SMS_TEMPLATE_ID;
//   }

//   /**
//    * Send OTP via Fast2SMS
//    * @param {string} phone - Phone number (10 digits)
//    * @param {string} otp - 4-digit OTP
//    * @returns {Promise<Object>} - Response from Fast2SMS
//    */
//   async sendOTP(phone, otp) {
//     try {
//       // Validate phone number (should be 10 digits for India)
//       if (!phone || phone.length !== 10 || !/^\d{10}$/.test(phone)) {
//         throw new Error('Invalid phone number. Must be 10 digits.');
//       }

//       // Validate OTP (should be 4 digits)
//       if (!otp || otp.length !== 4 || !/^\d{4}$/.test(otp)) {
//         throw new Error('Invalid OTP. Must be 4 digits.');
//       }

//       // Check if API key is configured
//       if (!this.apiKey) {
//         throw new Error('Fast2SMS API key not configured');
//       }

//       // If template ID is configured, use template-based sending
//       if (this.templateId) {
//         return await this.sendOTPWithTemplate(phone, otp, this.templateId);
//       }

//       // Prepare OTP message (shorter and more focused for better delivery)
//       const message = `Your Banner App OTP is ${otp}. Valid for 5 minutes.`;

//       // Try different routes in order of preference
//       const routes = ['q', 'otp', 'normal', 'promotional'];
//       let response = null;
//       let lastError = null;

//       for (const route of routes) {
//         try {
//           console.log(`Trying Fast2SMS with route: ${route}`);
//           response = await fast2sms.sendMessage({
//             authorization: this.apiKey,
//             message: message,
//             numbers: [phone], // Fast2SMS expects an array of numbers
//             route: route,
//             flash: 0,
//             variables_values: otp // Some providers use this for OTP
//           });
          
//           // If successful, break out of the loop
//           if (response.return === true) {
//             console.log(`Fast2SMS successful with route: ${route}`);
//             break;
//           } else {
//             lastError = response.message || 'Unknown error';
//             console.log(`Route ${route} failed: ${lastError}`);
//           }
//         } catch (error) {
//           lastError = error.message;
//           console.log(`Route ${route} error: ${lastError}`);
//         }
//       }

//       // If all routes failed, check if we should fall back to development mode
//       if (!response || response.return !== true) {
//         console.log('⚠️ All Fast2SMS routes failed. This usually means:');
//         console.log('1. Routes are not approved for your account');
//         console.log('2. Insufficient balance');
//         console.log('3. Sender ID not approved');
//         console.log('');
//         console.log('💡 Recommendation: Contact Fast2SMS support to get routes approved');
//         console.log('📧 Email: support@fast2sms.com');
//         console.log('🌐 Website: https://www.fast2sms.com/');
//       }
      
//       console.log('Fast2SMS OTP Response:', response);

//       // Check if SMS was sent successfully
//       if (response && response.return === true) {
//         return {
//           success: true,
//           message: 'OTP sent successfully',
//           data: response
//         };
//       } else {
//         // If all routes failed, throw the last error
//         throw new Error(`OTP sending failed: ${lastError || 'All routes failed'}`);
//       }

//     } catch (error) {
//       console.error('Fast2SMS OTP Error:', error);
//       return {
//         success: false,
//         message: error.message || 'Failed to send OTP',
//         error: error
//       };
//     }
//   }

//   /**
//    * Send custom message via Fast2SMS
//    * @param {string} phone - Phone number (10 digits)
//    * @param {string} message - Custom message
//    * @returns {Promise<Object>} - Response from Fast2SMS
//    */
//   async sendCustomMessage(phone, message) {
//     try {
//       // Validate phone number
//       if (!phone || phone.length !== 10 || !/^\d{10}$/.test(phone)) {
//         throw new Error('Invalid phone number. Must be 10 digits.');
//       }

//       // Check if API key is configured
//       if (!this.apiKey) {
//         throw new Error('Fast2SMS API key not configured');
//       }

//       // Send SMS using Fast2SMS v3.0.0 API
//       const response = await fast2sms.sendMessage({
//         authorization: this.apiKey,
//         message: message,
//         numbers: [phone], // Fast2SMS expects an array of numbers
//         route: 'q', // Use 'q' route which is commonly available
//         flash: 0
//       });
      
//       console.log('Fast2SMS Custom Message Response:', response);

//       if (response.return === true) {
//         return {
//           success: true,
//           message: 'SMS sent successfully',
//           data: response
//         };
//       } else {
//         throw new Error(`SMS sending failed: ${response.message || 'Unknown error'}`);
//       }

//     } catch (error) {
//       console.error('Fast2SMS Custom Message Error:', error);
//       return {
//         success: false,
//         message: error.message || 'Failed to send SMS',
//         error: error
//       };
//     }
//   }

//   /**
//    * Send OTP using template (if available)
//    * @param {string} phone - Phone number (10 digits)
//    * @param {string} otp - 4-digit OTP
//    * @param {string} templateId - Template ID (optional)
//    * @returns {Promise<Object>} - Response from Fast2SMS
//    */
//   async sendOTPWithTemplate(phone, otp, templateId = null) {
//     try {
//       // Validate phone number (should be 10 digits for India)
//       if (!phone || phone.length !== 10 || !/^\d{10}$/.test(phone)) {
//         throw new Error('Invalid phone number. Must be 10 digits.');
//       }

//       // Validate OTP (should be 4 digits)
//       if (!otp || otp.length !== 4 || !/^\d{4}$/.test(otp)) {
//         throw new Error('Invalid OTP. Must be 4 digits.');
//       }

//       // Check if API key is configured
//       if (!this.apiKey) {
//         throw new Error('Fast2SMS API key not configured');
//       }

//       // If template ID is provided, use template-based sending
//       if (templateId) {
//         const response = await fast2sms.sendMessage({
//           authorization: this.apiKey,
//           message: `Your Banner App OTP is ${otp}. Valid for 5 minutes.`,
//           numbers: [phone], // Fast2SMS expects an array of numbers
//           route: 'q', // Use 'q' route which is commonly available
//           flash: 0,
//           template_id: templateId,
//           variables_values: otp
//         });
        
//         console.log('Fast2SMS Template OTP Response:', response);
        
//         if (response.return === true) {
//           return {
//             success: true,
//             message: 'OTP sent successfully via template',
//             data: response
//           };
//         } else {
//           throw new Error(`Template OTP sending failed: ${response.message || 'Unknown error'}`);
//         }
//       } else {
//         // Fallback to regular OTP sending
//         return await this.sendOTP(phone, otp);
//       }

//     } catch (error) {
//       console.error('Fast2SMS Template OTP Error:', error);
//       return {
//         success: false,
//         message: error.message || 'Failed to send OTP via template',
//         error: error
//       };
//     }
//   }

//   /**
//    * Check Fast2SMS balance
//    * @returns {Promise<Object>} - Balance information
//    */
//   async checkBalance() {
//     try {
//       if (!this.apiKey) {
//         throw new Error('Fast2SMS API key not configured');
//       }

//       const response = await fast2sms.balance({
//         authorization: this.apiKey
//       });

//       console.log('Fast2SMS Balance Response:', response);

//       if (response.return === true) {
//         return {
//           success: true,
//           balance: response.balance,
//           currency: response.currency,
//           data: response
//         };
//       } else {
//         throw new Error(`Balance check failed: ${response.message || 'Unknown error'}`);
//       }

//     } catch (error) {
//       console.error('Fast2SMS Balance Error:', error);
//       return {
//         success: false,
//         message: error.message || 'Failed to check balance',
//         error: error
//       };
//     }
//   }
// }

// module.exports = new Fast2SMSService();
