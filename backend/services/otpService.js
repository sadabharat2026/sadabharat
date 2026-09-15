const axios = require('axios');

const env = (name, fallback = '') => {
  const value = process.env[name];
  if (value == null || value === '') return fallback;
  return String(value).trim();
};

/**
 * Build DLT-approved OTP message.
 * Template: Welcome to the ##var## powered by Appzeto.Your OTP for registration is ##var##.BGADEC
 * Template ID: from SMS_INDIA_HUB_TEMPLATE_ID
 */
const buildOtpMessage = (otp) => {
  const brand = env('SMS_BRAND_NAME', 'sadabharat');
  const senderId = env('SMS_INDIA_HUB_SENDER_ID', 'BGADEC');
  // Exact registered template text — only replace ##var## values
  return `Welcome to the ${brand} powered by Appzeto.Your OTP for registration is ${otp}.${senderId}`;
};

const sendSmsOtp = async (mobile, otp) => {
  const API_KEY = env('SMS_INDIA_HUB_API_KEY');
  const USERNAME = env('SMS_INDIA_HUB_USERNAME');
  const PASSWORD = env('SMS_INDIA_HUB_PASSWORD');
  const SENDER_ID = env('SMS_INDIA_HUB_SENDER_ID').toUpperCase();
  const TEMPLATE_ID = env('SMS_INDIA_HUB_TEMPLATE_ID');
  const ENTITY_ID = env('SMS_INDIA_HUB_ENTITY_ID');
  const API_URL =
    env('SMS_INDIA_HUB_URL') ||
    'http://cloud.smsindiahub.in/vendorsms/pushsms.aspx';

  if (!SENDER_ID || SENDER_ID.length !== 6) {
    return {
      success: false,
      message: 'SMS Sender ID must be exactly 6 characters (DLT header). Check SMS_INDIA_HUB_SENDER_ID.',
    };
  }

  if (!API_KEY && !(USERNAME && PASSWORD)) {
    console.warn('SMS India Hub credentials missing (API key or user/password).');
    return { success: false, message: 'SMS Provider not configured' };
  }

  // Mock only when explicitly enabled or for the test number
  if (env('USE_DEFAULT_OTP') === 'true' || mobile === '9999988888') {
    console.log(`[MOCK SMS] To: ${mobile} | OTP: ${otp} | Msg: ${buildOtpMessage(otp)}`);
    return { success: true, message: 'OTP sent (Mock)' };
  }

  let cleanMobile = String(mobile).replace(/\D/g, '');
  if (!cleanMobile.startsWith('91') && cleanMobile.length === 10) {
    cleanMobile = `91${cleanMobile}`;
  }

  const msg = buildOtpMessage(otp);

  try {
    const params = {
      msisdn: cleanMobile,
      sid: SENDER_ID,
      msg,
      fl: '0',
      gwid: '2', // transactional / OTP route
    };

    if (API_KEY) {
      params.APIKey = API_KEY;
    }
    if (USERNAME && PASSWORD) {
      params.user = USERNAME;
      params.password = PASSWORD;
    }

    // DLT compliance — required for Indian SMS delivery
    if (TEMPLATE_ID) {
      params.dlttemplateid = TEMPLATE_ID;
    }
    if (ENTITY_ID) {
      params.EntityID = ENTITY_ID;
      params.EntityId = ENTITY_ID;
    } else {
      console.warn(
        'SMS_INDIA_HUB_ENTITY_ID is empty. DLT often requires PE/Entity ID mapped to sender header.'
      );
    }

    console.log(
      `Sending OTP SMS → mobile=${cleanMobile} sid=${SENDER_ID} template=${TEMPLATE_ID || 'n/a'} entity=${ENTITY_ID || 'n/a'} auth=${API_KEY ? 'APIKey' : 'user/pass'}`
    );

    const response = await axios.get(API_URL, {
      params,
      timeout: 20000,
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
        if (lower.includes('senderid')) {
          throw new Error(
            `SMS Provider Error: ${data}. Sender ID "${SENDER_ID}" is not approved on this SMS India Hub account / API key. Register header in DLT + map it in SMS India Hub dashboard, or use the API key that owns this sender.`
          );
        }
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
