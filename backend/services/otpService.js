const axios = require('axios');

/**
 * Build DLT-approved OTP message.
 * Template: Welcome to the ##var## powered by Appzeto.Your OTP for registration is ##var##.BGADEC
 * Template ID: from SMS_INDIA_HUB_TEMPLATE_ID
 */
const buildOtpMessage = (otp) => {
  const brand = process.env.SMS_BRAND_NAME || 'sadabharat';
  const senderId = process.env.SMS_INDIA_HUB_SENDER_ID || 'BGADEC';
  // Exact registered template text — only replace ##var## values
  return `Welcome to the ${brand} powered by Appzeto.Your OTP for registration is ${otp}.${senderId}`;
};

const sendSmsOtp = async (mobile, otp) => {
  const API_KEY = process.env.SMS_INDIA_HUB_API_KEY;
  const SENDER_ID = process.env.SMS_INDIA_HUB_SENDER_ID;
  const TEMPLATE_ID = process.env.SMS_INDIA_HUB_TEMPLATE_ID;
  const ENTITY_ID = process.env.SMS_INDIA_HUB_ENTITY_ID;
  const API_URL =
    process.env.SMS_INDIA_HUB_URL ||
    'http://cloud.smsindiahub.in/vendorsms/pushsms.aspx';

  if (!API_KEY || !SENDER_ID) {
    console.warn('SMS India Hub API Key or Sender ID missing. Skipping SMS sending.');
    return { success: false, message: 'SMS Provider not configured' };
  }

  // Mock only when explicitly enabled or for the test number
  if (process.env.USE_DEFAULT_OTP === 'true' || mobile === '9999988888') {
    console.log(`[MOCK SMS] To: ${mobile} | OTP: ${otp} | Msg: ${buildOtpMessage(otp)}`);
    return { success: true, message: 'OTP sent (Mock)' };
  }

  let cleanMobile = String(mobile).replace(/\D/g, '');
  if (!cleanMobile.startsWith('91') && cleanMobile.length === 10) {
    cleanMobile = '91' + cleanMobile;
  }

  const msg = buildOtpMessage(otp);

  try {
    const params = {
      APIKey: API_KEY,
      msisdn: cleanMobile,
      sid: SENDER_ID,
      msg,
      fl: '0',
      gwid: '2', // transactional / OTP route
    };

    // DLT compliance — required for Indian SMS delivery
    if (TEMPLATE_ID) {
      params.dlttemplateid = TEMPLATE_ID;
    }
    if (ENTITY_ID) {
      params.EntityId = ENTITY_ID;
    }

    console.log(`Sending OTP SMS to ${cleanMobile} via SMS India Hub (template ${TEMPLATE_ID || 'n/a'})`);

    const response = await axios.get(API_URL, {
      params,
      timeout: 15000,
    });

    const data = response.data;
    console.log('SMS India Hub response:', typeof data === 'string' ? data : JSON.stringify(data));

    // Provider may return JSON with ErrorCode or a plain string
    if (data && typeof data === 'object') {
      if (data.ErrorCode && String(data.ErrorCode) !== '000') {
        throw new Error(
          `SMS Provider Error: ${data.ErrorMessage || data.ErrorCode}`
        );
      }
    } else if (typeof data === 'string') {
      const lower = data.toLowerCase();
      if (
        lower.includes('error') ||
        lower.includes('invalid') ||
        lower.includes('fail')
      ) {
        throw new Error(`SMS Provider Error: ${data}`);
      }
    }

    return { success: true, message: 'OTP sent successfully', provider: data };
  } catch (error) {
    console.error(`Failed to send SMS: ${error.message}`);
    return { success: false, message: error.message };
  }
};

module.exports = {
  sendSmsOtp,
  buildOtpMessage,
};
