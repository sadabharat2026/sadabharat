import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, ArrowRight, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';
import { registerFCMToken } from '../../services/pushNotificationService';
import api from '../../utils/api';

const VendorLogin = () => {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (timer <= 0) return undefined;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const handleSendOtp = async (e) => {
    e?.preventDefault?.();
    setError('');
    setInfo('');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return setError('Please enter a valid email address');
    }

    setSendingOtp(true);
    try {
      const res = await api.post('/vendors/send-login-otp', { email });
      if (res.data.success) {
        setOtpSent(true);
        setTimer(60);
        if (res.data.devOtp) {
          setOtp(res.data.devOtp);
          setInfo(`OTP sent! (Dev: ${res.data.devOtp})`);
        } else {
          setInfo('OTP sent to your email. Check inbox / spam.');
        }
        if (res.data.pendingApproval) {
          setInfo((prev) => `${prev} Note: account is pending admin approval.`);
        }
      }
    } catch (err) {
      const data = err.response?.data || {};
      if (data.code === 'VENDOR_NOT_FOUND' || err.response?.status === 404) {
        setInfo(data.message || 'Seller not found. Please register first.');
        setTimeout(() => navigate('/vendor/register'), 1800);
      } else {
        setError(data.message || err.parsedMessage || 'Failed to send OTP');
      }
    } finally {
      setSendingOtp(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!email) return setError('Email required');
    if (!otpSent) return setError('Please send OTP to your email first');
    if (!otp || otp.length !== 6) return setError('Enter the 6-digit OTP from email');

    setIsSubmitting(true);
    try {
      const res = await api.post('/vendors/verify-login-otp', { email, otp });
      if (res.data.success) {
        localStorage.setItem('vendor_token', res.data.data.token);
        localStorage.setItem('vendor_auth', 'true');
        registerFCMToken(true).catch(console.error);
        if (window.showVendorToast) {
          window.showVendorToast('Logged in successfully!', 'success');
        }
        navigate('/vendor');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.parsedMessage || 'Invalid or expired OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] w-full h-[100dvh] bg-[#F4F1E1] font-vendor-panel overflow-hidden !m-0 !p-0">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col md:flex-row w-full h-full relative"
      >
        <div className="relative w-full md:w-[50%] lg:w-[55%] h-[32vh] sm:h-[40vh] md:h-full shrink-0">
          <img src="/ayurvedic_background.png" alt="Ayurvedic Background" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#054425]/90 via-[#054425]/45 to-transparent z-10" />
          <div className="absolute inset-0 p-4 pt-4 md:p-12 flex flex-col z-30 text-white">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-9 h-9 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center p-1 shrink-0 shadow-md">
                <img src="/logo.png" alt="Sada Bharat" className="w-full h-full object-contain rounded-full" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-base md:text-2xl font-bold tracking-wider leading-none text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>SADA BHARAT</h1>
                <p className="text-[10px] md:text-xs font-semibold tracking-widest text-white/90 mt-1">AYURVEDIC</p>
              </div>
            </div>
            <div className="mt-4 md:mt-32">
              <h2 className="text-2xl md:text-5xl font-serif font-bold text-white mb-2 md:mb-4">Welcome Back!</h2>
              <p className="text-xs md:text-lg text-white/95 font-medium max-w-[220px] md:max-w-sm leading-tight md:leading-normal">
                Sign in with the OTP sent to your registered email.
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center px-6 py-4 md:px-12 md:py-8 relative z-20 bg-[#F4F1E1] overflow-hidden" data-lenis-prevent="true">
          <div className="w-full max-w-md md:-translate-x-8 lg:-translate-x-16 relative z-10 pt-2 md:pt-4">
            <div className="text-center mb-6">
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#054425]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Sign In</h2>
              <p className="text-xs text-gray-500 font-semibold mt-3">Email OTP login — no password needed</p>
            </div>

            {error && (
              <div className="mb-4 p-3.5 bg-red-50 text-red-600 rounded-xl text-xs font-semibold border border-red-100">
                {error}
              </div>
            )}
            {info && !error && (
              <div className="mb-4 p-3.5 bg-amber-50 text-amber-800 rounded-xl text-xs font-semibold border border-amber-100">
                {info}
              </div>
            )}

            <form onSubmit={otpSent ? handleLogin : handleSendOtp} className="space-y-3.5">
              <div className="relative shadow-sm rounded-xl">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setOtpSent(false);
                    setOtp('');
                  }}
                  placeholder="Email Address *"
                  className="w-full bg-white border border-gray-200 focus:border-[#054425] pl-11 pr-4 py-2.5 md:py-3 rounded-xl text-xs sm:text-sm font-semibold outline-none"
                  required
                />
              </div>

              {otpSent && (
                <div className="relative shadow-sm rounded-xl">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="6-digit Email OTP *"
                    className="w-full bg-white border border-gray-200 focus:border-[#054425] pl-11 pr-4 py-2.5 md:py-3 rounded-xl text-xs sm:text-sm font-semibold outline-none tracking-widest"
                    required
                  />
                </div>
              )}

              {otpSent && (
                <button
                  type="button"
                  disabled={timer > 0 || sendingOtp}
                  onClick={handleSendOtp}
                  className="text-[11px] font-bold text-[#054425] hover:underline disabled:text-gray-400 disabled:no-underline"
                >
                  {timer > 0 ? `Resend OTP in 00:${timer < 10 ? `0${timer}` : timer}` : 'Resend OTP'}
                </button>
              )}

              <button
                type="submit"
                disabled={isSubmitting || sendingOtp}
                className={`w-full text-white py-3.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 mt-2 ${
                  isSubmitting || sendingOtp ? 'bg-gray-500 cursor-not-allowed' : 'bg-[#0F3520] hover:bg-[#0d2a1a]'
                }`}
              >
                {otpSent
                  ? isSubmitting
                    ? 'Verifying...'
                    : 'Verify OTP & Sign In'
                  : sendingOtp
                    ? 'Sending OTP...'
                    : 'Send OTP to Email'}
                {!isSubmitting && !sendingOtp && <ArrowRight size={16} />}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-xs sm:text-sm font-semibold text-gray-600">
                Don't have a seller account?{' '}
                <Link to="/vendor/register" className="text-[#054425] font-bold hover:underline">
                  Register as Vendor
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VendorLogin;
