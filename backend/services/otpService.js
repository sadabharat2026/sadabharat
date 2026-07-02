const axios = require('axios');

const sendSmsOtp = async (mobile, otp) => {
  const API_KEY = process.env.SMS_INDIA_HUB_API_KEY;
  const SENDER_ID = process.env.SMS_INDIA_HUB_SENDER_ID;
  const API_URL = process.env.SMS_INDIA_HUB_URL || 'http://cloud.smsindiahub.in/vendorsms/pushsms.aspx';

  if (!API_KEY || !SENDER_ID) {
    console.warn('SMS India Hub API Key or Sender ID missing. Skipping SMS sending.');
    return { success: false, message: 'SMS Provider not configured' };
  }

  // 1. Mock Mode Check (If USE_DEFAULT_OTP is true, we might not want to send real SMS)
  if (process.env.USE_DEFAULT_OTP === 'true') {
    console.log(`[MOCK SMS] To: ${mobile} | OTP: ${otp}`);
    return { success: true, message: 'OTP sent (Mock)' };
  }

  // Normalize mobile (ensure 91 prefix)
  let cleanMobile = mobile.replace(/\D/g, '');
  if (!cleanMobile.startsWith('91') && cleanMobile.length === 10) {
    cleanMobile = '91' + cleanMobile;
  }

  try {
    const params = {
      APIKey: API_KEY,
      msisdn: cleanMobile,
      sid: SENDER_ID,
      msg: `Welcome to the  sadabharat powered by SMSINDIAHUB. Your OTP for registration is ${otp}`,
      fl: '0',
      gwid: '2',
    };

    const response = await axios.get(API_URL, { params });
    
    // Check for specific SMS India HUB error codes
    // Note: SMS India HUB often returns 200 OK even for errors, so check response body
    if (response.data && response.data.ErrorCode && response.data.ErrorCode !== '000') {
       throw new Error(`SMS Provider Error: ${response.data.ErrorMessage || response.data.ErrorCode}`);
    }

    return { success: true, message: 'OTP sent successfully' };
  } catch (error) {
    console.error(`Failed to send SMS: ${error.message}`);
    // We shouldn't necessarily throw here, otherwise the user can't register/login if SMS fails.
    // Throwing an error will abort the request. Let's return false instead.
    return { success: false, message: error.message };
  }
};

module.exports = {
  sendSmsOtp
};
