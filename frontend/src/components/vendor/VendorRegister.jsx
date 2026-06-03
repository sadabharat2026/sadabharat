import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Upload, CheckCircle2, ChevronRight, ChevronLeft, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const steps = [
  { id: 1, title: 'Personal Info' },
  { id: 2, title: 'Business Info' },
  { id: 3, title: 'Bank Details' },
  { id: 4, title: 'Store Info' },
  { id: 5, title: 'Documents' },
];

const VendorRegister = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [direction, setDirection] = useState(1); // 1 for next, -1 for prev
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    gstNumber: '',
    businessType: '',
    businessAddress: '',
    city: '',
    state: '',
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: '',
    storeName: '',
    storeDescription: '',
    categories: [],
    termsAccepted: false,
    policiesAccepted: false,
  });

  const [error, setError] = useState('');

  const nextStep = () => {
    if (currentStep < steps.length) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setError('');
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const validateStep = () => {
    setError('');
    
    if (currentStep === 1) {
      if (!formData.fullName.trim() || formData.fullName.trim().length < 3) {
        setError('Full Name must be at least 3 characters.');
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address.');
        return false;
      }
      const mobileRegex = /^[0-9]{10}$/;
      if (!mobileRegex.test(formData.mobile)) {
        setError('Mobile number must be exactly 10 digits.');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        return false;
      }
    }
    
    if (currentStep === 2) {
      if (!formData.businessName.trim()) {
        setError('Business Name is required.');
        return false;
      }
      if (!formData.gstNumber || formData.gstNumber.trim().length !== 15) {
        setError('GST number must be exactly 15 alphanumeric characters.');
        return false;
      }
      if (!formData.businessType) {
        setError('Please select a business type.');
        return false;
      }
      if (!formData.businessAddress.trim()) {
        setError('Business Address is required.');
        return false;
      }
      if (!formData.city.trim()) {
        setError('City is required.');
        return false;
      }
      if (!formData.state.trim()) {
        setError('State is required.');
        return false;
      }
    }
    
    if (currentStep === 3) {
      if (!formData.accountHolderName.trim()) {
        setError('Account Holder Name is required.');
        return false;
      }
      if (!formData.bankName.trim()) {
        setError('Bank Name is required.');
        return false;
      }
      const accRegex = /^[0-9]{9,18}$/;
      if (!accRegex.test(formData.accountNumber)) {
        setError('Account number must be between 9 and 18 digits.');
        return false;
      }
      if (!formData.ifscCode || formData.ifscCode.trim().length !== 11) {
        setError('IFSC code must be exactly 11 characters (e.g. HDFC0001234).');
        return false;
      }
    }
    
    if (currentStep === 4) {
      if (!formData.storeName.trim() || formData.storeName.trim().length < 3) {
        setError('Store Name must be at least 3 characters.');
        return false;
      }
      if (!formData.storeDescription.trim() || formData.storeDescription.trim().length < 10) {
        setError('Store Description must be at least 10 characters.');
        return false;
      }
    }
    
    if (currentStep === 5) {
      if (!formData.termsAccepted) {
        setError('You must accept the Seller Terms and Conditions.');
        return false;
      }
      if (!formData.policiesAccepted) {
        setError('You must accept the Marketplace Policies.');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    
    if (currentStep === steps.length) {
      setSubmitted(true);
    } else {
      nextStep();
    }
  };

  const variants = {
    initial: (direction) => ({
      x: direction > 0 ? 30 : -30,
      opacity: 0,
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.25, ease: 'easeInOut' },
    },
    exit: (direction) => ({
      x: direction < 0 ? 30 : -30,
      opacity: 0,
      transition: { duration: 0.25, ease: 'easeInOut' },
    }),
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center font-vendor-panel bg-[#F4F1E1] p-6 relative overflow-hidden">
        {/* Decorative Leaves */}
        <img 
          src="https://cdn-icons-png.flaticon.com/512/3257/3257635.png" 
          alt="leaf" 
          className="absolute bottom-0 right-0 w-24 h-24 md:w-32 md:h-32 opacity-25 object-contain translate-x-2 translate-y-2 md:translate-x-4 md:translate-y-8 -rotate-90 z-[1000] pointer-events-none" 
          style={{ filter: 'brightness(0.8) sepia(1) hue-rotate(80deg) saturate(3)' }} 
        />
        
        <div className="bg-white p-8 sm:p-10 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-green-50/50 max-w-md w-full text-center z-10">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-serif font-black text-gray-800" style={{ color: '#0B3D1F', fontFamily: "'Cormorant Garamond', serif" }}>Application Submitted!</h2>
          
          <div className="bg-emerald-50/60 border border-emerald-100/60 rounded-xl p-4 my-6 text-left">
            <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide mb-1">Account Status</p>
            <p className="text-base font-black text-emerald-900 font-sans">Pending Admin Approval</p>
          </div>
          
          <p className="text-xs sm:text-sm text-gray-500 mb-6 leading-relaxed font-semibold">
            Your application is under review. Verification may take <strong className="text-gray-900 font-bold">24-48 Hours</strong>. You will receive an email once approved.
          </p>
          
          <button onClick={() => navigate('/')} className="w-full bg-[#054425] hover:bg-[#04331c] text-white text-xs font-bold py-3.5 rounded-xl transition-colors shadow-sm active:scale-95">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[999] w-full h-[100dvh] bg-[#F4F1E1] font-vendor-panel overflow-hidden !m-0 !p-0">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col md:flex-row w-full h-full relative"
      >

        {/* Decorative Leaves */}
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

        {/* LEFT PANEL (Image & Wave) - Distinct Image and Wave curves for Register */}
        <div className="relative w-full md:w-[50%] lg:w-[55%] h-[32vh] sm:h-[40vh] md:h-full shrink-0">
          <img 
            src="/ayurvedic_background.png" 
            alt="Ayurvedic Background" 
            className="absolute inset-0 w-full h-full object-cover" 
          />
          {/* Greenish overlay for wellness theme */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#054425]/90 via-[#054425]/45 to-transparent z-10" />

          {/* SVG Wave separator for Desktop - Distinct asymmetric curve */}
          <div className="hidden md:block absolute top-0 -right-[2px] h-full w-[250px] z-20">
            <svg viewBox="0 0 250 1000" preserveAspectRatio="none" className="w-full h-full text-[#F4F1E1] fill-current">
              <path d="M250,0 L250,1000 L0,1000 C150,900 120,700 80,480 C40,260 160,100 250,0 Z" />
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
              <path d="M0,100 L1000,100 L1000,30 C700,90 300,10 0,60 Z" />
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
              <h2 className="text-2xl md:text-5xl font-serif font-bold text-white mb-2 md:mb-4">Join Our Seller Community!</h2>
              <p className="text-xs md:text-lg text-white/95 font-medium max-w-[200px] md:max-w-sm leading-tight md:leading-normal">Register and reach thousands of customers searching for organic health.</p>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL (Signup Steps Form) */}
        <div className="flex-1 flex flex-col justify-center items-center px-4 py-4 md:py-6 md:px-12 relative z-20 bg-[#F4F1E1] overflow-hidden" data-lenis-prevent="true">
          
          <div className="w-full max-w-md md:-translate-x-8 lg:-translate-x-16 relative z-10 pt-2 md:pt-4 flex flex-col h-full max-h-[620px] justify-between">
            <div className="text-center mb-4">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#054425]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Sign Up</h2>
              <div className="flex items-center justify-center gap-3 mt-3">
                <div className="w-16 h-[1.5px] bg-gradient-to-l from-[#CFA767] to-transparent"></div>
                <svg className="w-6 h-6 text-[#054425]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C10 4.5 8.5 7.5 8.5 10.5C8.5 13 10.5 15 12 15C13.5 15 15.5 13 15.5 10.5C15.5 7.5 14 4.5 12 2Z"/>
                  <path d="M10.5 13.5C7.5 13.5 4 11 2.5 8.5C2.5 11.5 4 15 7 16C8.5 16.5 9.5 16 10.5 15V13.5Z"/>
                  <path d="M13.5 13.5C16.5 13.5 20 11 21.5 8.5C21.5 11.5 20 15 17 16C15.5 16.5 14.5 16 13.5 15V13.5Z"/>
                  <path d="M11 14H13V22H11V14Z"/>
                </svg>
                <div className="w-16 h-[1.5px] bg-gradient-to-r from-[#CFA767] to-transparent"></div>
              </div>
            </div>

            {/* Stepper Progress dots - Highly compact and responsive */}
            <div className="mb-5 relative shrink-0 px-2 max-w-[280px] sm:max-w-[320px] mx-auto w-full">
              <div className="flex justify-between items-center relative z-10">
                {steps.map((step) => {
                  const isCompleted = step.id < currentStep;
                  const isCurrent = step.id === currentStep;
                  return (
                    <div key={step.id} className="flex flex-col items-center gap-1 relative">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] transition-all duration-300 ${
                        isCompleted ? 'bg-[#054425] text-white' : 
                        isCurrent ? 'bg-white border-2 border-[#054425] text-[#054425] scale-110 shadow-sm' : 
                        'bg-white border border-gray-250 text-gray-400'
                      }`}>
                        {isCompleted ? <CheckCircle2 size={12} strokeWidth={2.5} /> : step.id}
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Progress Line Backdrop */}
              <div className="absolute top-3 left-0 w-full h-0.5 bg-gray-200/80 -z-0 translate-y-[-50%] px-4">
                <div 
                  className="h-full bg-[#054425] transition-all duration-500 ease-in-out" 
                  style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Current Step Title Banner */}
            <div className="bg-white border border-[#054425]/10 rounded-xl px-3 py-1.5 mb-4 text-center shrink-0 shadow-sm">
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-[#054425] font-sans">
                Step {currentStep} of 5: {steps[currentStep - 1].title}
              </span>
            </div>

            {error && (
              <div className="mb-3 p-2 bg-red-50 text-red-600 rounded-xl text-[10px] sm:text-[11px] font-semibold border border-red-100 flex items-center gap-2 shrink-0">
                <span className="text-xs">⚠️</span>
                {error}
              </div>
            )}

            {/* Form body */}
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between">
              <div className="flex-1 relative pb-4">
                <AnimatePresence custom={direction} mode="wait">
                  <motion.div
                    key={currentStep}
                    custom={direction}
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="w-full text-left"
                  >
                    {/* Step 1: Personal Info */}
                    {currentStep === 1 && (
                      <div className="space-y-3 font-sans">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Full Name *</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Trisha Mishra" 
                            required 
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="w-full bg-white border border-gray-250 focus:border-[#054425] focus:ring-[#054425] px-4 py-2.5 rounded-xl text-xs font-semibold outline-none transition-all text-gray-805 placeholder:text-gray-400" 
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Email Address *</label>
                          <input 
                            type="email" 
                            placeholder="e.g. seller@sadabharat.com" 
                            required 
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-white border border-gray-250 focus:border-[#054425] focus:ring-[#054425] px-4 py-2.5 rounded-xl text-xs font-semibold outline-none transition-all text-gray-805 placeholder:text-gray-400" 
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Mobile Number *</label>
                          <input 
                            type="tel" 
                            placeholder="e.g. 9876543210" 
                            required 
                            value={formData.mobile}
                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                            className="w-full bg-white border border-gray-250 focus:border-[#054425] focus:ring-[#054425] px-4 py-2.5 rounded-xl text-xs font-semibold outline-none transition-all text-gray-805 placeholder:text-gray-400" 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Password *</label>
                            <input 
                              type="password" 
                              placeholder="••••••" 
                              required 
                              value={formData.password}
                              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                              className="w-full bg-white border border-gray-250 focus:border-[#054425] focus:ring-[#054425] px-4 py-2.5 rounded-xl text-xs font-semibold outline-none transition-all text-gray-805 placeholder:text-gray-400" 
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Confirm *</label>
                            <input 
                              type="password" 
                              placeholder="••••••" 
                              required 
                              value={formData.confirmPassword}
                              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                              className="w-full bg-white border border-gray-250 focus:border-[#054425] focus:ring-[#054425] px-4 py-2.5 rounded-xl text-xs font-semibold outline-none transition-all text-gray-805 placeholder:text-gray-400" 
                            />
                          </div>
                        </div>
                      </div>
                    )}
 
                    {/* Step 2: Business Info */}
                    {currentStep === 2 && (
                      <div className="space-y-3 font-sans">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Business Name *</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Herbal Essence Store" 
                            required 
                            value={formData.businessName}
                            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                            className="w-full bg-white border border-gray-250 focus:border-[#054425] focus:ring-[#054425] px-4 py-2.5 rounded-xl text-xs font-semibold outline-none transition-all text-gray-805 placeholder:text-gray-400" 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-700 mb-1.5 uppercase tracking-wide">GST Number *</label>
                            <input 
                              type="text" 
                              placeholder="22AAAAA0000A1Z5" 
                              required 
                              value={formData.gstNumber}
                              onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15) })}
                              className="w-full bg-white border border-gray-250 focus:border-[#054425] focus:ring-[#054425] px-4 py-2.5 rounded-xl text-xs font-semibold outline-none transition-all text-gray-805 placeholder:text-gray-400 uppercase" 
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Business Type *</label>
                            <select 
                              required 
                              value={formData.businessType}
                              onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                              className="w-full bg-white border border-gray-250 focus:border-[#054425] focus:ring-[#054425] px-4 py-2.5 rounded-xl text-xs font-semibold outline-none transition-all text-gray-650 cursor-pointer"
                            >
                              <option value="">Select Type</option>
                              <option value="Proprietorship">Proprietorship</option>
                              <option value="Partnership">Partnership</option>
                              <option value="Private Limited">Private Limited</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Business Address *</label>
                          <input 
                            type="text" 
                            placeholder="e.g. 101, Green Avenue" 
                            required 
                            value={formData.businessAddress}
                            onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                            className="w-full bg-white border border-gray-250 focus:border-[#054425] focus:ring-[#054425] px-4 py-2.5 rounded-xl text-xs font-semibold outline-none transition-all text-gray-805 placeholder:text-gray-400" 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-700 mb-1.5 uppercase tracking-wide">City *</label>
                            <input 
                              type="text" 
                              placeholder="e.g. Mumbai" 
                              required 
                              value={formData.city}
                              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                              className="w-full bg-white border border-gray-250 focus:border-[#054425] focus:ring-[#054425] px-4 py-2.5 rounded-xl text-xs font-semibold outline-none transition-all text-gray-805 placeholder:text-gray-400" 
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-700 mb-1.5 uppercase tracking-wide">State *</label>
                            <input 
                              type="text" 
                              placeholder="e.g. Maharashtra" 
                              required 
                              value={formData.state}
                              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                              className="w-full bg-white border border-gray-250 focus:border-[#054425] focus:ring-[#054425] px-4 py-2.5 rounded-xl text-xs font-semibold outline-none transition-all text-gray-805 placeholder:text-gray-400" 
                            />
                          </div>
                        </div>
                      </div>
                    )}
 
                    {/* Step 3: Bank Details */}
                    {currentStep === 3 && (
                      <div className="space-y-3 font-sans">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Account Holder Name *</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Trisha Mishra" 
                            required 
                            value={formData.accountHolderName}
                            onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                            className="w-full bg-white border border-gray-250 focus:border-[#054425] focus:ring-[#054425] px-4 py-2.5 rounded-xl text-xs font-semibold outline-none transition-all text-gray-805 placeholder:text-gray-400" 
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Bank Name *</label>
                          <input 
                            type="text" 
                            placeholder="e.g. HDFC Bank" 
                            required 
                            value={formData.bankName}
                            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                            className="w-full bg-white border border-gray-250 focus:border-[#054425] focus:ring-[#054425] px-4 py-2.5 rounded-xl text-xs font-semibold outline-none transition-all text-gray-805 placeholder:text-gray-400" 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Account Number *</label>
                            <input 
                              type="text" 
                              placeholder="50100234567890" 
                              required 
                              value={formData.accountNumber}
                              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, '').slice(0, 18) })}
                              className="w-full bg-white border border-gray-250 focus:border-[#054425] focus:ring-[#054425] px-4 py-2.5 rounded-xl text-xs font-semibold outline-none transition-all text-gray-805 placeholder:text-gray-400" 
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-700 mb-1.5 uppercase tracking-wide">IFSC Code *</label>
                            <input 
                              type="text" 
                              placeholder="HDFC0001234" 
                              required 
                              value={formData.ifscCode}
                              onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11) })}
                              className="w-full bg-white border border-gray-250 focus:border-[#054425] focus:ring-[#054425] px-4 py-2.5 rounded-xl text-xs font-semibold outline-none transition-all text-gray-805 placeholder:text-gray-400 uppercase" 
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-700 mb-1.5 uppercase tracking-wide">UPI ID (Optional)</label>
                          <input 
                            type="text" 
                            placeholder="e.g. owner@okaxis" 
                            value={formData.upiId}
                            onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                            className="w-full bg-white border border-gray-250 focus:border-[#054425] focus:ring-[#054425] px-4 py-2.5 rounded-xl text-xs font-semibold outline-none transition-all text-gray-805 placeholder:text-gray-400" 
                          />
                        </div>
                      </div>
                    )}
 
                    {/* Step 4: Store Info */}
                    {currentStep === 4 && (
                      <div className="space-y-3 font-sans">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Store Name *</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Herbal Aura" 
                            required 
                            value={formData.storeName}
                            onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                            className="w-full bg-white border border-gray-250 focus:border-[#054425] focus:ring-[#054425] px-4 py-2.5 rounded-xl text-xs font-semibold outline-none transition-all text-gray-805 placeholder:text-gray-400" 
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Store Description *</label>
                          <textarea 
                            rows="2" 
                            placeholder="Tell customers about your brand..." 
                            required 
                            value={formData.storeDescription}
                            onChange={(e) => setFormData({ ...formData, storeDescription: e.target.value })}
                            className="w-full bg-white border border-gray-250 focus:border-[#054425] focus:ring-[#054425] px-4 py-2.5 rounded-xl text-xs font-semibold outline-none transition-all text-gray-805 placeholder:text-gray-400 resize-none"
                          ></textarea>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Product Category *</label>
                          <select 
                            required
                            value={formData.categories[0] || ""}
                            onChange={(e) => setFormData({ ...formData, categories: e.target.value ? [e.target.value] : [] })}
                            className="w-full bg-white border border-gray-250 focus:border-[#054425] focus:ring-[#054425] px-4 py-2.5 rounded-xl text-xs font-semibold outline-none transition-all text-gray-750 cursor-pointer"
                          >
                            <option value="">Select Category</option>
                            <option value="Hair Care">Hair Care</option>
                            <option value="Skin Care">Skin Care</option>
                            <option value="Wellness">Wellness</option>
                            <option value="Soaps">Soaps</option>
                          </select>
                        </div>
                      </div>
                    )}
 
                    {/* Step 5: Documents */}
                    {currentStep === 5 && (
                      <div className="space-y-3 font-sans">
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center bg-white hover:bg-gray-50/50 transition-colors cursor-pointer relative shadow-sm">
                           <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" multiple accept=".pdf,image/*" />
                           <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm text-[#054425]">
                             <Upload size={16} />
                           </div>
                           <p className="text-[11px] font-bold text-gray-900 mb-0.5">Click to upload business documents</p>
                           <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">PDF, JPG, PNG up to 10MB</span>
                        </div>
 
                        <div className="space-y-2 py-2">
                          <label className="flex items-start gap-2.5 cursor-pointer select-none">
                            <input 
                              type="checkbox" 
                              required 
                              checked={formData.termsAccepted}
                              onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                              className="mt-0.5 w-3.5 h-3.5 text-[#054425] rounded focus:ring-[#054425] accent-[#054425]" 
                            />
                            <span className="text-[11px] text-gray-600 leading-snug font-semibold">I agree to the <a href="#" className="text-[#054425] font-bold hover:underline">Seller Terms & Conditions</a></span>
                          </label>
                          <label className="flex items-start gap-2.5 cursor-pointer select-none">
                            <input 
                              type="checkbox" 
                              required 
                              checked={formData.policiesAccepted}
                              onChange={(e) => setFormData({ ...formData, policiesAccepted: e.target.checked })}
                              className="mt-0.5 w-3.5 h-3.5 text-[#054425] rounded focus:ring-[#054425] accent-[#054425]" 
                            />
                            <span className="text-[11px] text-gray-600 leading-snug font-semibold">I agree to the <a href="#" className="text-[#054425] font-bold hover:underline">Marketplace Policies</a></span>
                          </label>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-200/80 flex items-center justify-between shrink-0">
                <button 
                  type="button" 
                  onClick={prevStep}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                    currentStep === 1 
                      ? 'text-gray-400 cursor-not-allowed bg-gray-50 border border-gray-200' 
                      : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 shadow-sm active:scale-95'
                  }`}
                  disabled={currentStep === 1}
                >
                  <ChevronLeft size={14} /> Back
                </button>

                <button 
                  type="submit" 
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs bg-[#054425] text-white shadow-md hover:bg-[#04331c] transition-all active:scale-95"
                >
                  {currentStep === steps.length ? 'Submit Application' : 'Continue'} 
                  {currentStep !== steps.length && <ChevronRight size={14} />}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center shrink-0">
              <p className="text-xs sm:text-sm font-semibold text-gray-600">
                Already have a seller account?{' '}
                <Link to="/vendor/login" className="font-bold text-[#054425] hover:underline">Sign In</Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VendorRegister;
