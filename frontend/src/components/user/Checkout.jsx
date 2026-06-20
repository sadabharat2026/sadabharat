import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiShoppingBag, FiCreditCard, FiTruck, FiCheckCircle, FiShield, FiMinus, FiPlus, FiTrash2, FiCheck, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import { useShop } from '../../context/ShopContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';

import api from '../../utils/api';

const Checkout = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount, clearCart, verifyAndClearCart, orderId, user, isAuthenticated, isAuthLoading, settings } = useShop();
  const navigate = useNavigate();

  // Enforce authentication for checkout
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  const [step, setStep] = useState(1); // 1: Cart, 2: Details, 3: Payment
  const [isSuccess, setIsSuccess] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('paynow');
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    landmark: '',
    pincode: '',
    city: '',
    district: '',
    state: ''
  });
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [isDisclaimerAccepted, setIsDisclaimerAccepted] = useState(false);
  const [disclaimerError, setDisclaimerError] = useState('');
  const [errors, setErrors] = useState({});
  const [isPincodeLoading, setIsPincodeLoading] = useState(false);
  const [pincodeStatus, setPincodeStatus] = useState('');

  // Pre-populate data from profile
  useEffect(() => {
    if (user && !isAuthLoading) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
        address: prev.address || user.address || '',
        landmark: prev.landmark || user.landmark || '',
        pincode: prev.pincode || user.pincode || '',
        city: prev.city || user.city || '',
        district: prev.district || user.district || '',
        state: prev.state || user.state || ''
      }));
    }
  }, [user, isAuthLoading]);

  // Auto detect city/district/state from Indian pincode
  useEffect(() => {
    const pin = (formData.pincode || '').trim();
    if (!/^\d{6}$/.test(pin)) {
      setPincodeStatus('');
      return;
    }

    let isActive = true;
    const detectFromPincode = async () => {
      setIsPincodeLoading(true);
      setPincodeStatus('Detecting location...');
      try {
        let city = '';
        let district = '';
        let state = '';
        
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
          const data = await res.json();
          const record = data?.[0];
          const office = record?.PostOffice?.[0];

          if (record?.Status === 'Success' && office) {
            city = office?.Block || office?.Name || office?.District || '';
            district = office?.District || '';
            state = office?.State || '';
          }
        } catch (err) {
          console.error("PostalPincode API failed, trying fallback...", err);
        }

        // Fallback to Zippopotamus if PostalPincode failed or returned empty
        if (!city || !state) {
          const res2 = await fetch(`https://api.zippopotam.us/IN/${pin}`);
          if (res2.ok) {
            const data2 = await res2.json();
            const place = data2?.places?.[0];
            if (place) {
              city = place['place name'] || '';
              district = place['state'] || ''; // Zippo doesn't always have district, use state or place name
              state = place['state'] || '';
            }
          }
        }

        if (!isActive) return;

        if (city || state) {
          setFormData(prev => ({
            ...prev,
            city: city || prev.city,
            district: district || city || prev.district,
            state: state || prev.state
          }));
          setErrors(prev => ({ ...prev, pincode: '', city: '', district: '', state: '' }));
          setPincodeStatus(`Detected: ${city}, ${state}`.trim());
        } else {
          setPincodeStatus('Invalid pincode. Please check and try again.');
        }
      } catch (e) {
        if (!isActive) return;
        setPincodeStatus('Unable to detect location right now. Please enter manually.');
      } finally {
        if (isActive) setIsPincodeLoading(false);
      }
    };

    detectFromPincode();
    return () => {
      isActive = false;
    };
  }, [formData.pincode]);

  // Scroll to top on step change or load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step, isSuccess]);

  // Router State Payload checks (Promos from Bag)
  const location = useLocation();
  const directProduct = location.state?.directProduct || null;
  const passedCouponCode = location.state?.couponApplied || null;

  // Initialize with passed coupon if any
  useEffect(() => {
    const initCoupon = async () => {
      if (passedCouponCode) {
        try {
          const res = await api.post('/coupons/validate', { code: passedCouponCode });
          const coupon = res.data.data.coupon;
          setAppliedCoupon(coupon);
          // Calculate initial discount
          const st = directProduct ? (directProduct.originalPrice || directProduct.price) * (directProduct.quantity || 1) : cartTotal;
          if (coupon.discountType === 'percentage') {
            setDiscountAmount(Math.round(st * (coupon.discountValue / 100)));
          } else {
            setDiscountAmount(coupon.discountValue);
          }
        } catch (err) {
          console.error("Initial coupon validation failed", err);
        }
      }
    };
    initCoupon();
  }, [passedCouponCode, cartTotal, directProduct]);

  const displayItems = directProduct ? [directProduct] : cart;

  // Dynamic Logistics Math
  const subtotal = directProduct
    ? (directProduct.originalPrice || directProduct.price) * (directProduct.quantity || 1)
    : cartTotal;

  const currentTaxRate = settings?.taxRate || 18;
  const shippingValue = 0; // Forced to zero as per user requirement to show internal price in invoice but not charge here.
  const actualShipping = (settings?.deliveryCharge || 50);

  // Display Tax calculated as percentage of subtotal, but it is INCLUSIVE (already in main price)
  const taxAmount = Math.round(subtotal * (currentTaxRate / 100));
  const codFee = (selectedPayment === 'cod' && settings?.isCodEnabled) ? (settings?.codCharge || 0) : 0;
  const total = Math.max(0, subtotal - discountAmount + shippingValue + codFee);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = name === 'pincode' ? value.replace(/\D/g, '').slice(0, 6) : value;
    setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateDetails = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = 'Name is required';
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone?.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid 10-digit number';
    }
    if (!formData.address?.trim()) newErrors.address = 'Address is required';
    if (!formData.pincode?.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
    }
    if (!formData.city?.trim()) newErrors.city = 'City is required';
    if (!formData.district?.trim()) newErrors.district = 'District is required';
    if (!formData.state?.trim()) newErrors.state = 'State is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Razorpay Integration
  const handleRazorpay = async () => {
    setIsPaymentLoading(true);
    try {
      // 1. Create Razorpay order on backend
      const res = await api.post('/orders/razorpay/create', { amount: total });
      const { id: razorpay_order_id, amount, currency } = res.data.data.order;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_SbjooFQK8nvU6V",
        amount,
        currency,
        name: "Sada Bharat",
        description: "Ritual Selection Transaction",
        image: "/logo.png",
        order_id: razorpay_order_id,
        handler: async (response) => {
          // 2. Verify payment & save order
          try {
            await verifyAndClearCart(response, {
              ...formData,
              items: displayItems.map(i => ({ product: i._id, quantity: i.quantity || 1, price: i.price, name: i.name, image: i.image, size: i.selectedSize })),
              totalAmount: total,
              couponCode: appliedCoupon?.code
            }, total, { subtotal, taxAmount, taxRate: currentTaxRate, shippingValue, actualShipping });
            setIsSuccess(true);
          } catch (err) {
            console.error("Verification error", err);
          } finally {
            setIsPaymentLoading(false);
          }
        },
        prefill: {
          name: formData.name,
          contact: formData.phone,
          email: formData.email || user?.email || ""
        },
        theme: {
          color: "#5C2E3E"
        },
        modal: {
          ondismiss: () => setIsPaymentLoading(false)
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Razorpay initiation error", err);
      alert("Payment gateway failed: " + (err.response?.data?.message || err.message));
      setIsPaymentLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await api.post('/coupons/validate', { code: couponCode.trim().toUpperCase() });
      const coupon = res.data.data.coupon;
      setAppliedCoupon(coupon);

      let discount = 0;
      if (coupon.discountType === 'percentage') {
        discount = Math.round(subtotal * (coupon.discountValue / 100));
      } else {
        discount = coupon.discountValue;
      }
      setDiscountAmount(discount);
      setCouponCode('');
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid Ritual Key');
    } finally {
      setCouponLoading(false);
    }
  };

    const handleProceed = async () => {
    if (displayItems.length === 0) return;
    if (!validateDetails()) {
      alert("Please fill all required shipping details before proceeding.");
      return;
    }
    if (!isDisclaimerAccepted) {
      setDisclaimerError('Please accept the disclaimer to continue.');
      alert("Please read and accept the fraud disclaimer in the Payment Section.");
      return;
    }

    setIsPaymentLoading(true);

    if (selectedPayment === 'paynow') {
      await handleRazorpay();
      return;
    }

    // COD Flow using real backend API via clearCart
    try {
      await clearCart({
        ...formData,
        items: displayItems.map(i => ({ product: i._id, quantity: i.quantity || 1, price: i.price, name: i.name, image: i.images?.[0]?.url || i.image, size: i.selectedSize })),
        totalAmount: total,
        couponCode: appliedCoupon?.code
      }, total, { subtotal, taxAmount, taxRate: currentTaxRate, shippingValue, actualShipping });
      
      setIsSuccess(true);
      setShowSuccessPopup(true);
      
      // We need to fetch the newly generated orderId from the ShopContext state (which updates asynchronously), 
      // but verifyAndClearCart returns it if we modify it. I'll just redirect to the general orders page 
      // or track-order page. Wait, verifyAndClearCart returns the orderId in ShopContext!
      // Let's redirect after a delay
      setTimeout(() => {
          // ShopContext sets orderId state, but inside this closure we might not have it immediately.
          // Let's rely on the success screen rendering which uses orderId from context.
      }, 1500);
      
    } catch (err) {
      console.error("Order creation failed", err);
      setIsPaymentLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-4 font-['Poppins'] overflow-hidden">
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={true}
          numberOfPieces={200}
          gravity={0.1}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 5 }}
          colors={['#054425', '#D4AF37', '#228B22', '#FDFCFB']}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-[320px] w-full bg-white p-6 text-center shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 rounded-2xl relative z-10"
        >
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
            className="text-5xl mb-4 inline-block drop-shadow-sm"
          >
            🎉
          </motion.div>

          <h2 className="text-xl font-bold text-[#054425] mb-2 tracking-wide">
            Congratulations
          </h2>

          <p className="text-[13px] text-gray-500 mb-6 leading-relaxed">
            Your order has been successfully placed. We've received your details and are preparing it for shipment.
          </p>

          <div className="space-y-2 mb-6">
            <div className="p-3 bg-green-50/50 rounded-xl border border-green-100">
              <p className="text-[11px] text-gray-500 mb-0.5">Order Tracking ID</p>
              <p className="text-[13px] font-bold text-[#054425]">#{orderId}</p>
            </div>
            
            <div className="p-3 bg-green-50/50 rounded-xl border border-green-100">
              <p className="text-[11px] text-gray-500 mb-0.5">Shipping To</p>
              <p className="text-[13px] font-semibold text-gray-900">{formData.name}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Link to={`/track-order?id=${orderId}`} className="w-full flex justify-center py-2.5 bg-[#054425] text-white text-[13px] font-medium rounded-full shadow-md hover:bg-[#04331c] transition-colors">
              Track Your Order
            </Link>

            <button
              onClick={async () => {
                try {
                  const res = await api.get(`/orders/track/${orderId}`);
                  const order = res.data.data.order;
                  const m = await import('../../utils/invoiceHelper');
                  m.generateInvoice(order);
                } catch (err) {
                  alert("Failed to retrieve invoice details.");
                }
              }}
              className="w-full flex justify-center py-2.5 bg-gray-50 text-gray-700 text-[13px] font-medium rounded-full hover:bg-gray-100 transition-colors"
            >
              Download Invoice
            </button>

            <Link to="/" className="w-full flex justify-center py-2.5 text-gray-400 text-[12px] font-medium rounded-full hover:text-gray-600 transition-colors">
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-12 pt-6 font-['Poppins']">
      <div className="w-full px-2 md:px-4 lg:px-6 max-w-[1400px] mx-auto">
        
        {/* Header Area */}
        <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-3">
            <h1 className="text-2xl font-serif font-bold text-[#054425]">
                Checkout
            </h1>
            <div 
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1 text-sm cursor-pointer text-gray-500 hover:text-[#054425] transition-colors"
            >
                <FiChevronLeft /> Back
            </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleProceed(); }} className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Left Column - Forms & Steps */}
          <div className="xl:col-span-8 space-y-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Delivery Address */}
                <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                    <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-3 border-b border-gray-100 pb-3">
                        <span className="w-6 h-6 rounded-full bg-[#054425] text-white flex items-center justify-center text-xs">1</span>
                        Delivery Address
                    </h2>
                    
                    <div className="space-y-4">
                        <div>
                          <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Full Name *" required className={`w-full bg-white border ${errors.name ? 'border-red-400' : 'border-gray-200'} px-4 py-2 text-sm outline-none focus:border-[#054425] transition-all rounded-md`} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email *" required className={`w-full bg-white border ${errors.email ? 'border-red-400' : 'border-gray-200'} px-4 py-2 text-sm outline-none focus:border-[#054425] transition-all rounded-md`} />
                          <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone *" required className={`w-full bg-white border ${errors.phone ? 'border-red-400' : 'border-gray-200'} px-4 py-2 text-sm outline-none focus:border-[#054425] transition-all rounded-md`} />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="relative">
                            <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="Pincode *" required className={`w-full bg-white border ${errors.pincode ? 'border-red-400' : 'border-gray-200'} px-4 py-2 text-sm outline-none focus:border-[#054425] transition-all rounded-md`} />
                            {isPincodeLoading && <span className="absolute right-3 top-2 text-xs text-gray-400">...</span>}
                          </div>
                          <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="City *" required className="w-full bg-white border border-gray-200 px-4 py-2 text-sm outline-none focus:border-[#054425] transition-all rounded-md" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <input type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="State *" required className="w-full bg-white border border-gray-200 px-4 py-2 text-sm outline-none focus:border-[#054425] transition-all rounded-md" />
                          <input type="text" name="district" value={formData.district} onChange={handleInputChange} placeholder="District" className="w-full bg-white border border-gray-200 px-4 py-2 text-sm outline-none focus:border-[#054425] transition-all rounded-md" />
                        </div>
                        
                        <div>
                          <textarea name="address" value={formData.address} onChange={handleInputChange} placeholder="Full Address *" required className={`w-full bg-white border ${errors.address ? 'border-red-400' : 'border-gray-200'} px-4 py-2 text-sm outline-none focus:border-[#054425] transition-all min-h-[60px] resize-none rounded-md`} />
                        </div>
                        {pincodeStatus && !pincodeStatus.startsWith('Detected') && <p className="text-xs text-amber-500">{pincodeStatus}</p>}
                    </div>
                </div>

                <div className="space-y-6">
                    {/* 2. Payment Method */}
                    <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-3 border-b border-gray-100 pb-3">
                            <span className="w-6 h-6 rounded-full bg-[#054425] text-white flex items-center justify-center text-xs">2</span>
                            Payment Method
                        </h2>

                        <div className="flex gap-4 mb-4">
                            <label className={`flex-1 flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${selectedPayment === 'paynow' ? 'border-[#054425] bg-[#054425]/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <input type="radio" name="payment" checked={selectedPayment === 'paynow'} onChange={() => setSelectedPayment('paynow')} className="accent-[#054425] w-4 h-4" />
                                <span className="text-sm">Online Payment</span>
                            </label>
                            {settings?.isCodEnabled !== false && (
                                <label className={`flex-1 flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${selectedPayment === 'cod' ? 'border-[#054425] bg-[#054425]/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <input type="radio" name="payment" checked={selectedPayment === 'cod'} onChange={() => setSelectedPayment('cod')} className="accent-[#054425] w-4 h-4" />
                                    <span className="text-sm">Cash on Delivery</span>
                                </label>
                            )}
                        </div>

                        <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg">
                            <div className="flex items-center gap-2 text-amber-700 mb-2">
                              <FiAlertTriangle size={14} />
                              <h3 className="text-xs uppercase font-medium">Fraud Alert</h3>
                            </div>
                            <label className="flex items-center gap-3 mt-1 cursor-pointer">
                              <input type="checkbox" required checked={isDisclaimerAccepted} onChange={(e) => { setIsDisclaimerAccepted(e.target.checked); setDisclaimerError(''); }} className="accent-[#054425] w-4 h-4" />
                              <span className="text-xs text-amber-900">I have read the disclaimer.</span>
                            </label>
                        </div>
                    </div>

                    {/* 3. Order Items */}
                    <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm flex-1">
                        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-3 border-b border-gray-100 pb-3">
                            <span className="w-6 h-6 rounded-full bg-[#054425] text-white flex items-center justify-center text-xs">3</span>
                            Order Items
                        </h2>

                        <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                            {displayItems.map((item) => (
                              <div key={`${item._id}-${item.selectedSize || 'nosize'}`} className="flex items-center gap-4 p-3 border border-gray-100 rounded-lg bg-gray-50">
                                <div className="w-12 h-12 bg-white rounded-md flex items-center justify-center shrink-0 border border-gray-100">
                                  <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-sm text-gray-900 truncate">{item.name}</h3>
                                  <p className="text-xs text-gray-600">₹{item.price} <span className="text-[10px] text-gray-400">x {item.quantity || 1}</span></p>
                                </div>
                                <div className="text-right">
                                  <span className="text-sm font-medium text-[#054425]">₹{item.price * (item.quantity || 1)}</span>
                                </div>
                              </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
          </div>

          {/* Right Column - Summary Sidebar */}
          <div className="xl:col-span-4 xl:sticky xl:top-24 h-fit">
            <div className="bg-white p-6 shadow-sm border border-gray-200 rounded-xl flex flex-col gap-5">
              <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">Price Details</h3>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-medium">Subtotal</span>
                    <span className="text-gray-800">₹{subtotal.toFixed(2)}</span>
                </div>

                <div className="flex items-center gap-3 py-1">
                    <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Coupon Code" className="flex-1 border border-gray-200 px-4 py-2 text-xs outline-none focus:border-[#054425] rounded-md uppercase" />
                    <button type="button" onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()} className="bg-gray-100 text-gray-700 px-4 py-2 text-xs rounded-md hover:bg-gray-200 transition-all disabled:opacity-50 border border-gray-200">APPLY</button>
                </div>
                {couponError && <p className="text-xs text-red-500">{couponError}</p>}

                {appliedCoupon && (
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-[#054425] font-medium">Discount ({appliedCoupon.code})</span>
                        <div className="flex items-center gap-2">
                            <span className="text-[#054425]">-₹{discountAmount.toFixed(2)}</span>
                            <button type="button" onClick={() => { setAppliedCoupon(null); setDiscountAmount(0); }} className="text-gray-400 hover:text-red-500"><FiTrash2 size={12} /></button>
                        </div>
                    </div>
                )}

                <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-medium">Shipping</span>
                    <span className="text-gray-800">{shippingValue === 0 ? '₹0.00' : `₹${shippingValue.toFixed(2)}`}</span>
                </div>

                {codFee > 0 && selectedPayment === 'cod' && (
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600 font-medium">COD Charge</span>
                        <span className="text-gray-800">₹{codFee.toFixed(2)}</span>
                    </div>
                )}

                <div className="flex flex-col pt-3 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-base font-bold text-[#054425]">Total</span>
                        <span className="text-base font-bold text-[#054425]">₹{total.toFixed(2)}</span>
                    </div>
                    {discountAmount > 0 && <p className="text-xs text-[#054425] font-medium">(You saved ₹{discountAmount.toFixed(2)})</p>}
                </div>

                <button
                    type="submit"
                    disabled={displayItems.length === 0 || isPaymentLoading}
                    className="w-full bg-[#054425] text-white py-3.5 rounded-lg shadow-sm hover:bg-[#1E4D2B] transition-all disabled:bg-gray-200 disabled:text-gray-500 flex items-center justify-center gap-2 text-sm font-medium mt-4"
                >
                    {isPaymentLoading ? 'Processing...' : 'Place Order'}
                </button>

                <div className="flex flex-col gap-3 mt-5 text-xs text-gray-500">
                    <div className="flex items-center gap-3"><FiShield className="text-gray-400 text-lg" /> 100% Secure Payments</div>
                    <div className="flex items-center gap-3"><FiRefreshCw className="text-gray-400 text-lg" /> Easy Returns & Refunds</div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Success Popup */}
      <AnimatePresence>
        {showSuccessPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center border border-gray-100 flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-5 shadow-inner">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                >
                  <FiCheck size={32} strokeWidth={3} />
                </motion.div>
              </div>
              <h3 className="text-xl font-bold font-['Poppins'] text-[#054425] mb-2">Congratulations!</h3>
              <p className="text-sm font-['Poppins'] text-gray-600 mb-6 leading-relaxed">
                Your order has been placed successfully. You will be redirected to the tracking page shortly.
              </p>
              <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3, ease: "linear" }}
                  className="h-full bg-[#054425]"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Checkout;
