const nodemailer = require('nodemailer');

const trim = (v) => (v == null ? '' : String(v).trim());

const isSmtpConfigured = () =>
  Boolean(
    trim(process.env.SMTP_HOST) &&
      trim(process.env.SMTP_USER) &&
      trim(process.env.SMTP_PASS)
  );

const createTransport = () => {
  const port = Number(process.env.SMTP_PORT || 587);
  const secure =
    process.env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === '1' || port === 465;

  return nodemailer.createTransport({
    host: trim(process.env.SMTP_HOST),
    port,
    secure,
    auth: {
      user: trim(process.env.SMTP_USER),
      pass: trim(process.env.SMTP_PASS),
    },
  });
};

const brandName = () => trim(process.env.MAIL_FROM_NAME) || 'Sada Bharat Ayurvedic';

const buildOtpEmailHtml = ({ otp, purpose, name }) => {
  const title =
    purpose === 'vendor_reset'
      ? 'Reset your vendor password'
      : purpose === 'vendor_login'
        ? 'Sign in to your seller account'
        : 'Verify your vendor email';
  const intro =
    purpose === 'vendor_reset'
      ? 'Use the OTP below to reset your Sada Bharat seller account password.'
      : purpose === 'vendor_login'
        ? 'Use the OTP below to sign in to your Sada Bharat seller dashboard.'
        : 'Use the OTP below to verify your email and continue vendor registration.';
  const greet = name ? `Hi ${name},` : 'Hello,';

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#F4F1E1;font-family:Poppins,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F4F1E1;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(5,68,37,0.08);">
          <tr>
            <td style="background:#054425;padding:28px 24px;text-align:center;">
              <div style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:1px;">SADA BHARAT</div>
              <div style="color:#CFA767;font-size:11px;font-weight:600;letter-spacing:2px;margin-top:6px;">AYURVEDIC · SELLER PORTAL</div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 28px;">
              <p style="margin:0 0 12px;color:#1f2937;font-size:15px;font-weight:600;">${greet}</p>
              <p style="margin:0 0 8px;color:#054425;font-size:18px;font-weight:700;">${title}</p>
              <p style="margin:0 0 24px;color:#6b7280;font-size:13px;line-height:1.6;">${intro}</p>
              <div style="background:#F4F1E1;border:1px dashed #054425;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
                <div style="color:#6b7280;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">Your OTP</div>
                <div style="color:#054425;font-size:32px;font-weight:800;letter-spacing:8px;">${otp}</div>
              </div>
              <p style="margin:0 0 8px;color:#6b7280;font-size:12px;line-height:1.5;">This code is valid for <strong style="color:#054425;">10 minutes</strong>. Do not share it with anyone.</p>
              <p style="margin:0;color:#9ca3af;font-size:11px;line-height:1.5;">If you did not request this, you can safely ignore this email.</p>
            </td>
          </tr>
          <tr>
            <td style="background:#fafafa;padding:16px 28px;text-align:center;border-top:1px solid #f3f4f6;">
              <p style="margin:0;color:#9ca3af;font-size:11px;">© ${new Date().getFullYear()} ${brandName()}. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

const buildOtpEmailText = ({ otp, purpose }) => {
  const title =
    purpose === 'vendor_reset'
      ? 'Reset your vendor password'
      : purpose === 'vendor_login'
        ? 'Sign in to your seller account'
        : 'Verify your vendor email';
  return `${title}\n\nYour OTP is: ${otp}\n\nValid for 10 minutes. Do not share this code.\n\n— ${brandName()}`;
};

/**
 * Send OTP email via SMTP. In development without SMTP, logs OTP and returns success.
 */
const sendOtpEmail = async ({ to, otp, purpose, name }) => {
  const email = trim(to).toLowerCase();
  if (!email) return { success: false, message: 'Email is required' };

  const subject =
    purpose === 'vendor_reset'
      ? `${otp} is your Sada Bharat password reset OTP`
      : purpose === 'vendor_login'
        ? `${otp} is your Sada Bharat seller login OTP`
        : `${otp} is your Sada Bharat vendor verification OTP`;

  const html = buildOtpEmailHtml({ otp, purpose, name });
  const text = buildOtpEmailText({ otp, purpose });

  const mockMode =
    process.env.SMTP_MOCK === 'true' ||
    process.env.USE_DEFAULT_OTP === 'true' ||
    !isSmtpConfigured();

  if (mockMode) {
    console.log(`[MOCK EMAIL] To: ${email} | Purpose: ${purpose} | OTP: ${otp}`);
    return {
      success: true,
      message: 'OTP sent (mock / SMTP not configured)',
      mock: true,
      ...(process.env.NODE_ENV !== 'production' && { devOtp: otp }),
    };
  }

  try {
    const transporter = createTransport();
    const fromAddress =
      trim(process.env.SMTP_FROM) ||
      `"${brandName()}" <${trim(process.env.SMTP_USER)}>`;

    await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject,
      text,
      html,
    });

    return { success: true, message: 'OTP sent to email' };
  } catch (error) {
    console.error('SMTP send failed:', error.message);
    return { success: false, message: error.message || 'Failed to send email' };
  }
};

module.exports = {
  sendOtpEmail,
  isSmtpConfigured,
  buildOtpEmailHtml,
};
