import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiLock, FiEye, FiEyeOff, FiCheckCircle, FiPhone, FiMail } from 'react-icons/fi';
import { useShop } from '../../context/ShopContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { registerFCMToken } from '../../services/pushNotificationService';

import api from '../../utils/api';

const resolveRedirect = (from, fallback = '/') => {
  if (!from) return fallback;
  if (typeof from === 'string') return from;
  return from.pathname || fallback;
};

const Auth = () => {
  const { isAuthenticated, setIsAuthenticated, setUser } = useShop();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminPath = location.pathname.includes('/admin');

  useEffect(() => {
    if (isAuthenticated && !isAdminPath) {
      navigate(resolveRedirect(location.state?.from, '/'), { replace: true });
    }
  }, [isAuthenticated, isAdminPath, navigate, location.state]);

  const [form, setForm] = useState({ mobile: '', email: '', password: '', otp: '' });

  const [errors, setErrors] = useState({});
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    if (name === 'mobile') {
      value = value.replace(/\D/g, '').replace(/^0+/, '').slice(0, 10);
    }
    setForm({ ...form, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleSendOtp = async () => {
    const newErrors = {};
    if (!form.mobile || form.mobile.length !== 10) {
      newErrors.mobile = 'Enter a valid 10-digit mobile number';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const res = await api.post('/users/send-otp', { mobile: form.mobile });
      if (res.data.success) {
        setOtpSent(true);
        setTimer(60);
        // In dev mode, backend returns the OTP - auto-fill it
        if (res.data.devOtp) {
          setForm(prev => ({ ...prev, otp: res.data.devOtp }));
          showNotification(`OTP sent! (Dev mode: ${res.data.devOtp})`);
        } else {
          showNotification("OTP sent successfully to your mobile number.");
        }
      }
    } catch (error) {
      showNotification(error.response?.data?.message || "Failed to send OTP", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};

    if (isAdminPath) {
      if (!form.email) newErrors.email = 'Enter your admin email';
      if (!form.password) newErrors.password = 'Enter your password';
    } else {
      if (!form.mobile || form.mobile.length !== 10) {
        newErrors.mobile = 'Enter a valid 10-digit mobile number';
      }
      if (!form.otp || form.otp.length !== 6) {
        newErrors.otp = 'Enter a valid 6-digit OTP';
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      if (isAdminPath) {
        // Admin Login
        const res = await api.post('/users/login', {
          email: form.email,
          password: form.password
        });
        if (res.data.success) {
          const { token, ...userData } = res.data.data;
          localStorage.setItem('admin_token', token);
          registerFCMToken(true).catch(console.error);
          if (setUser) setUser(userData);
          setIsAuthenticated(true);
          showNotification("Login Successful! Welcome to Sada Bharat.", "success");
          const from = resolveRedirect(location.state?.from, '/admin');
          setTimeout(() => navigate(from), 1200);
        }
      } else {
        // Customer Login
        const res = await api.post('/users/verify-otp', {
          mobile: form.mobile,
          otp: form.otp
        });
        if (res.data.success) {
          const { token, ...userData } = res.data.data;
          localStorage.setItem('customer_token', token);
          registerFCMToken(true).catch(console.error);
          if (setUser) setUser(userData);
          setIsAuthenticated(true);
          showNotification("Login Successful! Welcome to Sada Bharat.", "success");
          const from = resolveRedirect(location.state?.from, '/');
          setTimeout(() => navigate(from), 1200);
        }
      }
    } catch (err) {
      showNotification(err.response?.data?.message || "Invalid credentials.", 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[999] w-full h-[100dvh] bg-[#F4F1E1] font-['Poppins',_sans-serif] overflow-hidden !m-0 !p-0">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col md:flex-row w-full h-full relative"
        >

        {/* Decorative Leaves (Matching Image) */}
        <img src="https://cdn-icons-png.flaticon.com/512/3257/3257635.png" alt="leaf" className="absolute top-0 right-0 w-32 h-32 opacity-80 object-contain translate-x-8 -translate-y-8 rotate-45 z-10 pointer-events-none hidden md:block" style={{ filter: 'brightness(0.8) sepia(1) hue-rotate(80deg) saturate(3)' }} />
        <img src="https://cdn-icons-png.flaticon.com/512/3257/3257635.png" alt="leaf" className="absolute bottom-0 right-0 w-24 h-24 md:w-32 md:h-32 opacity-80 object-contain translate-x-2 translate-y-2 md:translate-x-4 md:translate-y-8 -rotate-90 z-[1000] pointer-events-none" style={{ filter: 'brightness(0.8) sepia(1) hue-rotate(80deg) saturate(3)' }} />
        
        {/* Back to Website Button */}
        <Link 
          to="/" 
          className="absolute top-4 right-4 md:top-8 md:right-12 z-[1000] flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white/70 backdrop-blur-md border border-gray-200 text-[#054425] text-[11px] md:text-sm font-semibold rounded-full shadow-sm hover:bg-white transition-all group"
        >
          <svg className="w-3 h-3 md:w-4 md:h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="hidden sm:inline">Back to Website</span>
          <span className="sm:hidden">Back</span>
        </Link>

        {/* LEFT PANEL (Image & Wave) */}
        <div className="relative w-full md:w-[50%] lg:w-[55%] h-[32vh] sm:h-[40vh] md:h-full shrink-0">
          <img 
            src="/auth-bg.png" 
            alt="Ayurvedic Background" 
            className="absolute inset-0 w-full h-full object-cover" 
          />
          {/* Sunlight Glow Overlay for Text Readability */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white/80 via-white/30 to-transparent" />

          {/* SVG Wave separator for Desktop */}
          <div className="hidden md:block absolute top-0 -right-[2px] h-full w-[250px] z-10">
            <svg viewBox="0 0 250 1000" preserveAspectRatio="none" className="w-full h-full text-[#F4F1E1] fill-current">
              <path d="M250,0 L250,1000 L0,1000 C150,850 50,550 100,300 C125,175 150,50 250,0 Z" />
            </svg>
          </div>
          
          {/* Top-right corner cream leaf overlay (matches image) */}
          <div className="hidden md:block absolute top-0 -right-[2px] w-[300px] h-[200px] z-0 pointer-events-none">
            <svg viewBox="0 0 300 200" preserveAspectRatio="none" className="w-full h-full text-[#F2EFE8] fill-current opacity-80">
              <path d="M300,0 L300,200 C200,200 150,100 0,0 Z" />
            </svg>
          </div>

          {/* Bottom-left cream wave overlay on image (matches image) */}
          <div className="hidden md:block absolute bottom-0 left-0 w-full h-[150px] z-10 pointer-events-none">
            <svg viewBox="0 0 1000 150" preserveAspectRatio="none" className="w-full h-full text-[#F4F1E1] fill-current opacity-90">
              <path d="M0,150 L1000,150 L1000,100 C700,50 300,150 0,50 Z" />
            </svg>
          </div>

          {/* SVG Wave separator for Mobile */}
          <div className="block md:hidden absolute bottom-0 left-0 w-full h-[80px] z-10">
            <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="w-full h-full text-[#F4F1E1] fill-current">
              <path d="M0,100 L1000,100 L1000,50 C700,0 300,100 0,50 Z" />
            </svg>
          </div>

          {/* Logo & Welcome Text */}
          <div className="absolute inset-0 p-4 pt-4 md:p-12 flex flex-col z-20 text-[#054425]">
            <div className="flex items-center gap-3 md:gap-4">
              <img src="/logo.png" alt="Sada Bharat" className="h-10 md:h-20 w-auto drop-shadow-sm" />
              <div className="flex flex-col">
                <h1 className="text-base md:text-2xl font-bold tracking-wider leading-none">SADA BHARAT</h1>
                <p className="text-[10px] md:text-sm font-medium tracking-widest text-[#054425] mt-1">AYURVEDIC</p>
              </div>
            </div>

            <div className="mt-4 md:mt-32">
              <h2 className="text-2xl md:text-5xl font-serif font-bold text-[#054425] mb-2 md:mb-4">Welcome Back!</h2>
              <p className="text-xs md:text-lg text-[#054425]/90 font-medium max-w-[200px] md:max-w-sm leading-tight md:leading-normal">Login to continue your wellness journey</p>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL (Login Form) */}
        <div className="flex-1 flex flex-col justify-start items-center px-6 pt-2 pb-6 md:pb-12 md:px-12 md:pt-16 relative z-20 bg-[#F4F1E1] overflow-y-auto overscroll-contain" data-lenis-prevent="true">
          
          <div className="w-full max-w-md md:-translate-x-8 lg:-translate-x-16 relative z-10">
            <div className="text-center mb-6">
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#054425]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Sign In</h2>
              <div className="flex items-center justify-center gap-3 mt-4">
                <div className="w-16 h-[1.5px] bg-gradient-to-l from-[#CFA767] to-transparent"></div>
                <svg className="w-7 h-7 text-[#054425]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C10 4.5 8.5 7.5 8.5 10.5C8.5 13 10.5 15 12 15C13.5 15 15.5 13 15.5 10.5C15.5 7.5 14 4.5 12 2Z"/>
                  <path d="M10.5 13.5C7.5 13.5 4 11 2.5 8.5C2.5 11.5 4 15 7 16C8.5 16.5 9.5 16 10.5 15V13.5Z"/>
                  <path d="M13.5 13.5C16.5 13.5 20 11 21.5 8.5C21.5 11.5 20 15 17 16C15.5 16.5 14.5 16 13.5 15V13.5Z"/>
                  <path d="M11 14H13V22H11V14Z"/>
                </svg>
                <div className="w-16 h-[1.5px] bg-gradient-to-r from-[#CFA767] to-transparent"></div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2 md:space-y-3">
              {isAdminPath ? (
                <>
                  <div>
                    <div className="relative shadow-sm rounded-xl">
                      <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleInputChange}
                        placeholder="Admin Email *"
                        className={`w-full bg-white border ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-[#054425] focus:ring-[#054425]'} pl-11 pr-4 py-2 md:py-2.5 rounded-xl text-sm font-medium outline-none transition-all text-gray-800 placeholder:text-gray-400`}
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
                  </div>
                  <div>
                    <div className="relative shadow-sm rounded-xl">
                      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={form.password}
                        onChange={handleInputChange}
                        placeholder="Password *"
                        className={`w-full bg-white border ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-[#054425] focus:ring-[#054425]'} pl-11 pr-12 py-2 md:py-2.5 rounded-xl text-sm font-medium outline-none transition-all text-gray-800 placeholder:text-gray-400`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password}</p>}
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !form.email || !form.password}
                    className="w-full bg-[#0F3520] text-white py-3.5 rounded-xl text-sm font-medium tracking-wide hover:bg-[#0d2a1a] transition-all shadow-md active:scale-95 disabled:opacity-50 mt-4"
                  >
                    {loading ? 'Processing...' : 'Admin Login'}
                  </button>
                </>
              ) : (
                <>
                  {/* Mobile Number */}
                  <div>
                    <div className="relative shadow-sm rounded-xl">
                      <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
                      <input
                        type="text"
                        name="mobile"
                        value={form.mobile}
                        onChange={handleInputChange}
                        placeholder="Contact Number *"
                        maxLength={10}
                        className={`w-full bg-white border ${errors.mobile ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-[#054425] focus:ring-[#054425]'} pl-11 pr-24 py-2 md:py-2.5 rounded-xl text-sm font-medium outline-none transition-all text-gray-800 placeholder:text-gray-400`}
                      />
                      <button 
                        type="button" 
                        onClick={handleSendOtp}
                        disabled={otpSent}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] md:text-xs font-bold px-3 py-1.5 md:py-2 rounded-lg transition-all ${
                          otpSent 
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                            : 'bg-[#0F3520] text-white hover:bg-[#0d2a1a]'
                        }`}
                      >
                        {otpSent ? 'Sent' : 'Send OTP'}
                      </button>
                    </div>
                    {errors.mobile && <p className="text-red-500 text-xs mt-1 ml-1">{errors.mobile}</p>}
                  </div>

                  {/* OTP */}
                  <div>
                    <div className="relative shadow-sm rounded-xl">
                      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
                      <input
                        type="text"
                        name="otp"
                        value={form.otp}
                        onChange={handleInputChange}
                        placeholder="Enter OTP *"
                        disabled={!otpSent}
                        maxLength={6}
                        className={`w-full bg-white border ${errors.otp ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-[#054425] focus:ring-[#054425]'} pl-11 pr-16 py-2 md:py-2.5 rounded-xl text-sm font-medium outline-none transition-all text-gray-800 placeholder:text-gray-400 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed`}
                      />
                    </div>
                    {errors.otp && <p className="text-red-500 text-xs mt-1 ml-1">{errors.otp}</p>}
                    
                    {/* Resend OTP Link */}
                    <AnimatePresence>
                      {otpSent && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="flex justify-end mt-1.5 mr-1"
                        >
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={timer > 0}
                            className={`text-[10px] md:text-xs font-bold transition-all ${
                              timer > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-[#054425] hover:underline'
                            }`}
                          >
                            {timer > 0 ? `Resend OTP in 00:${timer < 10 ? '0' : ''}${timer}` : 'Resend OTP'}
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !otpSent || !form.otp || !form.mobile}
                    className="w-full bg-[#0F3520] text-white py-3.5 rounded-xl text-sm font-medium tracking-wide hover:bg-[#0d2a1a] transition-all shadow-md active:scale-95 disabled:opacity-50 mt-4"
                  >
                    {loading ? 'Processing...' : 'Login'}
                  </button>
                </>
              )}
            </form>

            {/* Social logins removed */}

            <div className="mt-8 text-center">
              <p className="text-sm font-medium text-gray-600">
                Don't have an account? <Link to="/register" className="text-[#054425] font-bold hover:underline">Sign Up</Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
      </div>

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-10 left-[5%] right-[5%] md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-auto md:min-w-[300px] z-[1001] bg-white border-l-4 border-[#054425] shadow-xl px-6 py-4 flex items-center gap-4 rounded-r-lg md:rounded-l-lg"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${notification.type === 'error' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-[#054425]'}`}>
              {notification.type === 'error' ? '!' : <FiCheckCircle size={18} />}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">{notification.type === 'error' ? 'Error' : 'Success'}</p>
              <p className="text-xs font-medium text-gray-500">{notification.msg}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Auth;
