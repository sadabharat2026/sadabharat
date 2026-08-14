import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import registerBg from '../../assets/images/register_herbs.jpg';
import api from '../../utils/api';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    gender: '',
    email: '',
    mobile: '',
    otp: '',
    agreed: false
  });

  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated } = useShop();

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOtp = async () => {
    if (!form.mobile || !/^\d{10}$/.test(form.mobile)) {
      showNotification("Please enter a valid 10-digit mobile number first", "error");
      return;
    }
    
    try {
      const response = await api.post('/users/send-register-otp', { mobile: form.mobile });
      if (response.data.success) {
        setOtpSent(true);
        setTimer(60);
        // In dev mode, backend returns the OTP - auto-fill it
        if (response.data.devOtp) {
          setForm(prev => ({ ...prev, otp: response.data.devOtp }));
          showNotification(`OTP sent! (Dev mode: ${response.data.devOtp})`, "success");
        } else {
          showNotification("OTP sent successfully to your mobile number.", "success");
        }
      }
    } catch (error) {
      showNotification(error.response?.data?.message || "Failed to send OTP", "error");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let nextValue = type === 'checkbox' ? checked : value;
    if (name === 'mobile') {
      nextValue = value.replace(/\D/g, '').replace(/^0+/, '').slice(0, 10);
    }
    setForm(prev => ({
      ...prev,
      [name]: nextValue
    }));
  };

  const isFormComplete = 
    form.name.trim() !== '' &&
    form.gender !== '' &&
    form.email.trim() !== '' &&
    form.mobile.trim() !== '' &&
    form.otp.trim() !== '' &&
    form.agreed;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.agreed) {
      showNotification("Please agree to the Terms & Conditions", "error");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      showNotification("Please enter a valid email address", "error");
      return;
    }
    if (!/^\d{10}$/.test(form.mobile)) {
      showNotification("Please enter a valid 10-digit mobile number", "error");
      return;
    }
    if (!form.otp || form.otp.length !== 6) {
      showNotification("Please enter a valid 6-digit OTP", "error");
      return;
    }

    try {
      const response = await api.post('/users/register', {
        name: form.name,
        gender: form.gender,
        email: form.email,
        mobile: form.mobile,
        otp: form.otp
      });

      if (response.data.success) {
        const token = response.data.data.token;
        const userData = response.data.data;
        
        localStorage.setItem('customer_token', token);
        if (setUser && setIsAuthenticated) {
          setUser(userData);
          setIsAuthenticated(true);
        }

        showNotification("Account created successfully! Welcome to Sada Bharat.", "success");
        setTimeout(() => navigate('/'), 1200);
      }
    } catch (error) {
      showNotification(error.response?.data?.message || "Registration failed", "error");
    }
  };

  return (
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
      <div className="relative w-full md:w-[50%] lg:w-[55%] h-[32vh] sm:h-[35vh] md:h-full shrink-0">
        <img 
          src={registerBg} 
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
            <h2 className="text-2xl md:text-5xl font-serif font-bold text-[#054425] mb-2 md:mb-4">Welcome!</h2>
            <p className="text-xs md:text-lg text-[#054425]/90 font-medium max-w-[200px] md:max-w-sm leading-tight md:leading-normal">Join our Ayurvedic community and start your wellness journey</p>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL (Register Form) */}
      <div className="flex-1 flex flex-col justify-start items-center px-6 pt-2 pb-6 md:pb-12 md:px-12 md:pt-12 relative z-20 bg-[#F4F1E1] overflow-y-auto overscroll-contain" data-lenis-prevent="true">
        
        <div className="w-full max-w-md md:-translate-x-8 lg:-translate-x-16 relative z-10">
          <div className="text-center mb-6">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#054425]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Sign Up</h2>
            <p className="text-sm text-gray-600 mt-1 font-medium">Join our Ayurvedic community</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2 md:space-y-3">
              
              {/* Full Name */}
              <div className="relative shadow-sm rounded-xl">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  placeholder="Full Name"
                  required
                  className="w-full bg-white border border-gray-200 focus:border-[#054425] focus:ring-[#054425] pl-11 pr-4 py-2 md:py-2.5 rounded-xl text-sm font-medium outline-none transition-all text-gray-800 placeholder:text-gray-400"
                />
              </div>

              {/* Gender Custom Dropdown */}
              <div className="relative shadow-sm rounded-xl">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg z-10 pointer-events-none" />
                <div 
                  onClick={() => setIsGenderDropdownOpen(!isGenderDropdownOpen)}
                  className={`w-full bg-white border ${isGenderDropdownOpen ? 'border-[#054425] ring-1 ring-[#054425]' : 'border-gray-200'} pl-11 pr-4 py-2 md:py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all flex items-center justify-between ${form.gender ? 'text-gray-800' : 'text-gray-400'}`}
                >
                  <span className="truncate">{form.gender ? form.gender.charAt(0).toUpperCase() + form.gender.slice(1) : 'Select Gender'}</span>
                  <svg className={`w-4 h-4 text-gray-500 transition-transform ${isGenderDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                <AnimatePresence>
                  {isGenderDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden"
                    >
                      {['female', 'male', 'other'].map((g) => (
                        <div
                          key={g}
                          onClick={() => {
                            setForm({ ...form, gender: g });
                            setIsGenderDropdownOpen(false);
                          }}
                          className="px-4 py-3 text-sm font-medium text-gray-700 hover:bg-[#F4F1E1] hover:text-[#054425] cursor-pointer transition-colors"
                        >
                          {g.charAt(0).toUpperCase() + g.slice(1)}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Email Address */}
              <div className="relative shadow-sm rounded-xl">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleInputChange}
                  placeholder="Email Address"
                  required
                  className="w-full bg-white border border-gray-200 focus:border-[#054425] focus:ring-[#054425] pl-11 pr-4 py-2 md:py-2.5 rounded-xl text-sm font-medium outline-none transition-all text-gray-800 placeholder:text-gray-400"
                />
              </div>

              {/* Mobile Number */}
              <div className="relative shadow-sm rounded-xl">
                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
                <input
                  type="text"
                  name="mobile"
                  value={form.mobile}
                  onChange={handleInputChange}
                  placeholder="10-digit Mobile Number"
                  maxLength={10}
                  required
                  className="w-full bg-white border border-gray-200 focus:border-[#054425] focus:ring-[#054425] pl-11 pr-24 py-2 md:py-2.5 rounded-xl text-sm font-medium outline-none transition-all text-gray-800 placeholder:text-gray-400"
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
                    className="w-full bg-white border border-gray-200 focus:border-[#054425] focus:ring-[#054425] pl-11 pr-16 py-2 md:py-2.5 rounded-xl text-sm font-medium outline-none transition-all text-gray-800 placeholder:text-gray-400 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                  />
                </div>
                
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

              {/* Terms and Conditions Checkbox */}
              <div className="flex items-start gap-2 pt-1">
                <input 
                  type="checkbox" 
                  name="agreed"
                  id="agreed"
                  checked={form.agreed}
                  onChange={handleInputChange}
                  className="mt-1 shrink-0 text-[#054425] focus:ring-[#054425] border-gray-300 rounded"
                />
                <label htmlFor="agreed" className="text-[10px] md:text-xs text-gray-600 leading-tight font-medium">
                  I agree to the <span className="font-bold text-gray-800">Terms & Conditions</span> and <span className="font-bold text-gray-800">Privacy Policy</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isFormComplete}
                className={`w-full py-3 rounded-xl font-bold transition-all mt-4 shadow-md ${
                  isFormComplete 
                    ? 'bg-[#0F3520] hover:bg-[#0d2a1a] text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Sign Up
              </button>
            </form>

            {/* Footer Text */}
            <div className="mt-4 pb-4 text-center">
              <p className="text-xs text-gray-600 font-medium">
                Already have an account? <Link to="/login" className="text-[#054425] font-bold hover:underline">Sign In</Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className={`fixed bottom-6 left-[5%] right-[5%] md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-auto px-6 py-3 rounded-full text-sm font-bold shadow-lg z-[1000] flex items-center justify-center gap-2 ${
              notification.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-[#0F3520] text-[#F4F1E1]'
            }`}
          >
            {notification.type === 'error' ? (
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-brand-gold shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            <span className="truncate">{notification.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Register;
