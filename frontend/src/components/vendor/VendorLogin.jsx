import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VendorLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    
    if (!email) return setError('Email Required');
    if (!password) return setError('Password Required');

    if (email === 's@gmail.com' && password === '123456') {
      localStorage.setItem('vendor_auth', 'true');
      if (window.showVendorToast) {
        window.showVendorToast('Logged in successfully!', 'success');
      }
      navigate('/vendor');
    } else {
      setError('Invalid Credentials');
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

        {/* Decorative Leaves (Matching user style with slight twist) */}
        <img 
          src="https://cdn-icons-png.flaticon.com/512/3257/3257635.png" 
          alt="leaf" 
          className="absolute top-0 right-0 w-32 h-32 opacity-25 object-contain translate-x-8 -translate-y-8 rotate-45 z-10 pointer-events-none hidden md:block" 
          style={{ filter: 'brightness(0.8) sepia(1) hue-rotate(80deg) saturate(3)' }} 
        />
        <img 
          src="https://cdn-icons-png.flaticon.com/512/3257/3257635.png" 
          alt="leaf" 
          className="absolute bottom-0 right-0 w-24 h-24 md:w-32 md:h-32 opacity-25 object-contain translate-x-2 translate-y-2 md:translate-x-4 md:translate-y-8 -rotate-90 z-[1000] pointer-events-none" 
          style={{ filter: 'brightness(0.8) sepia(1) hue-rotate(80deg) saturate(3)' }} 
        />

        {/* LEFT PANEL (Image & Wave) - Uses a distinct Unsplash image and custom wave */}
        <div className="relative w-full md:w-[50%] lg:w-[55%] h-[32vh] sm:h-[40vh] md:h-full shrink-0">
          <img 
            src="/ayurvedic_background.png" 
            alt="Ayurvedic Background" 
            className="absolute inset-0 w-full h-full object-cover" 
          />
          {/* Greenish Overlay for High Contrast and Premium Feel */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#054425]/90 via-[#054425]/45 to-transparent z-10" />

          {/* SVG Wave separator for Desktop - Distinct asymmetric curve */}
          <div className="hidden md:block absolute top-0 -right-[2px] h-full w-[250px] z-20">
            <svg viewBox="0 0 250 1000" preserveAspectRatio="none" className="w-full h-full text-[#F4F1E1] fill-current">
              <path d="M250,0 L250,1000 L0,1000 C180,920 60,680 120,450 C180,220 80,80 250,0 Z" />
            </svg>
          </div>
          
          {/* Top-right corner cream leaf overlay (different curve) */}
          <div className="hidden md:block absolute top-0 -right-[2px] w-[300px] h-[200px] z-10 pointer-events-none">
            <svg viewBox="0 0 300 200" preserveAspectRatio="none" className="w-full h-full text-[#F2EFE8] fill-current opacity-80">
              <path d="M300,0 L300,200 C180,180 120,80 0,0 Z" />
            </svg>
          </div>

          {/* Bottom-left cream wave overlay on image (different curve) */}
          <div className="hidden md:block absolute bottom-0 left-0 w-full h-[150px] z-20 pointer-events-none">
            <svg viewBox="0 0 1000 150" preserveAspectRatio="none" className="w-full h-full text-[#F4F1E1] fill-current opacity-90">
              <path d="M0,150 L1000,150 L1000,80 C600,120 400,20 0,50 Z" />
            </svg>
          </div>

          {/* SVG Wave separator for Mobile - Distinct curve */}
          <div className="block md:hidden absolute bottom-0 left-0 w-full h-[80px] z-20">
            <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="w-full h-full text-[#F4F1E1] fill-current">
              <path d="M0,100 L1000,100 L1000,40 C800,120 400,0 0,60 Z" />
            </svg>
          </div>

          {/* Logo & Welcome Text */}
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
              <p className="text-xs md:text-lg text-white/95 font-medium max-w-[200px] md:max-w-sm leading-tight md:leading-normal">Sign in to access your seller dashboard.</p>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL (Login Form) */}
        <div className="flex-1 flex flex-col justify-center items-center px-6 py-4 md:px-12 md:py-8 relative z-20 bg-[#F4F1E1] overflow-hidden" data-lenis-prevent="true">
          
          <div className="w-full max-w-md md:-translate-x-8 lg:-translate-x-16 relative z-10 pt-2 md:pt-4">
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

            {error && (
              <div className="mb-4 p-3.5 bg-red-50 text-red-600 rounded-xl text-xs font-semibold border border-red-100 flex items-center gap-2">
                <span className="text-sm">⚠️</span>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-3.5">
              
              {/* Email Address */}
              <div>
                <div className="relative shadow-sm rounded-xl">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address *"
                    className="w-full bg-white border border-gray-200 focus:border-[#054425] focus:ring-[#054425] pl-11 pr-4 py-2.5 md:py-3 rounded-xl text-xs sm:text-sm font-semibold outline-none transition-all text-gray-800 placeholder:text-gray-400"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="relative shadow-sm rounded-xl">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password *"
                    className="w-full bg-white border border-gray-200 focus:border-[#054425] focus:ring-[#054425] pl-11 pr-12 py-2.5 md:py-3 rounded-xl text-xs sm:text-sm font-semibold outline-none transition-all text-gray-800 placeholder:text-gray-400"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between py-1 px-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" id="remember" className="w-3.5 h-3.5 text-[#054425] border-gray-300 rounded focus:ring-[#054425] accent-[#054425]" />
                  <span className="text-[11px] sm:text-xs text-gray-600 font-semibold">Remember Me</span>
                </label>
                <a href="#" className="text-[11px] sm:text-xs font-bold text-[#054425] hover:underline">Forgot Password?</a>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                className="w-full bg-[#0F3520] text-white py-3.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wide hover:bg-[#0d2a1a] transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 mt-4"
              >
                Sign In <ArrowRight size={16} />
              </button>

              {/* OR Divider */}
              <div className="relative flex items-center justify-center py-3">
                <div className="border-t border-gray-200 w-full absolute"></div>
                <span className="bg-[#F4F1E1] px-3 text-[10px] text-gray-450 relative z-10 uppercase font-black tracking-widest">Or</span>
              </div>

              {/* Google Login */}
              <button 
                type="button" 
                className="w-full bg-white border border-gray-200 text-gray-700 text-xs sm:text-sm font-bold py-2.5 sm:py-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2.5 shadow-sm"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-4 h-4" />
                Login with Google
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-xs sm:text-sm font-semibold text-gray-600">
                Don't have a seller account? <Link to="/vendor/register" className="text-[#054425] font-bold hover:underline">Register as Vendor</Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VendorLogin;
