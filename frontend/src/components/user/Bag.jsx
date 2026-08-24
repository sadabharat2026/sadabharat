import React, { useState, useEffect } from 'react';
import { useShop } from '../../context/ShopContext';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiTrash2, FiMinus, FiPlus, FiArrowRight, FiInfo, FiTag, FiCheckCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

import api from '../../utils/api';


const Bag = () => {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useShop();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [bagQuote, setBagQuote] = useState(null);

  useEffect(() => {
    if (!cart.length) {
      setBagQuote(null);
      return undefined;
    }
    let live = true;
    api.post('/orders/quote', {
      items: cart.map((item) => ({
        product: item._id,
        quantity: item.quantity || 1,
        size: item.selectedSize
      })),
      couponCode: appliedCoupon?.code
    }).then((res) => {
      if (live) {
        setBagQuote(res.data.data);
        setCouponError('');
      }
    }).catch((err) => {
      if (live) setCouponError(err.response?.data?.message || err.message);
    });
    return () => { live = false; };
  }, [cart, appliedCoupon?.code]);

  const discountAmount = bagQuote?.discountAmount ?? 0;
  const bagSubtotal = bagQuote?.subtotal ?? cartTotal;
  const bagShipping = bagQuote?.shippingAmount ?? 0;
  const bagTax = bagQuote?.taxAmount ?? 0;
  const finalTotal = bagQuote?.total ?? cartTotal;

  const validateCoupon = async () => {
    if (!couponCode) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await api.post('/coupons/validate', { code: couponCode });
      setAppliedCoupon(res.data.data.coupon);
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err.response?.data?.message || 'Invalid or expired coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex flex-col items-center justify-center bg-[#FDFCFB] px-4">
        <div className="w-20 h-20 bg-brand-pink/10 rounded-full flex items-center justify-center text-brand-pink mb-6">
          <FiShoppingBag size={40} />
        </div>
        <h2 className="text-2xl font-serif font-black text-brand-dark uppercase tracking-widest mb-2">Your Bag is Empty</h2>
        <p className="text-gray-400 text-xs uppercase tracking-widest mb-8">Add something divine to your collection</p>
        <Link
          to="/shop"
          className="bg-brand-dark text-white px-10 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-brand-pink transition-all"
        >
          Discover Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-black text-brand-dark uppercase tracking-tighter">
              Your <span className="text-brand-pink italic">Shopping Bag</span>
            </h1>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">
              Curated Selection : {cart.length} Items
            </p>
          </div>
          <Link to="/shop" className="text-[9px] font-black text-brand-pink uppercase border-b border-brand-pink hover:text-brand-dark hover:border-brand-dark transition-all hidden md:block">
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex gap-4 md:gap-6 group"
                >
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-serif font-black text-brand-dark uppercase">{item.name}</h3>
                        <p className="text-[9px] text-brand-pink font-bold uppercase tracking-widest">{item.category}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center border border-gray-100 rounded-lg overflow-hidden h-8">
                        <button
                          onClick={() => updateQuantity(item._id, -1)}
                          className="px-2 hover:bg-gray-50 text-gray-400 transition-colors"
                        >
                          <FiMinus size={12} />
                        </button>
                        <span className="px-3 text-xs font-black text-brand-dark">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, 1)}
                          className="px-2 hover:bg-gray-50 text-gray-400 transition-colors"
                        >
                          <FiPlus size={12} />
                        </button>
                      </div>
                      <span className="text-sm font-black text-brand-dark">₹{bagQuote?.items?.find((row) => String(row.product) === String(item._id))?.lineTotal ?? item.price}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary & Promo Architecture */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl sticky top-28">
              <h3 className="text-sm font-serif font-black text-brand-dark uppercase tracking-widest mb-6 pb-2 border-b border-gray-50">Discount Promo</h3>

              <div className="mb-6">
                {!appliedCoupon ? (
                  <div className="space-y-2">
                    <div className="flex bg-gray-50 rounded-xl border border-gray-100 overflow-hidden focus-within:border-brand-pink/30 focus-within:bg-white transition-all shadow-inner">
                      <div className="pl-3 flex items-center text-gray-300">
                        <FiTag size={12} />
                      </div>
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="ENTER PROMO CODE..."
                        className="w-full bg-transparent px-2 py-3 text-[10px] font-black uppercase tracking-widest outline-none text-brand-dark"
                      />
                      <button
                        onClick={validateCoupon}
                        disabled={couponLoading || !couponCode}
                        className="px-4 text-[9px] font-black uppercase tracking-widest text-brand-pink hover:bg-brand-pink/5 transition-colors disabled:opacity-50"
                      >
                        {couponLoading ? '...' : 'Apply'}
                      </button>
                    </div>
                    {couponError && <p className="text-[8px] font-bold text-red-500 uppercase tracking-widest ml-1">{couponError}</p>}
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-green-50/50 border border-green-100 p-3 rounded-xl border-dashed">
                    <div className="flex items-center gap-2">
                      <FiCheckCircle className="text-green-500" size={14} />
                      <div>
                        <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">{appliedCoupon.code}</p>
                        <p className="text-[8px] font-bold text-green-600/70 uppercase tracking-widest">
                          {appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}% OFF APPLIED` : `₹${appliedCoupon.discountValue} FLAT OFF`}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => { setAppliedCoupon(null); setCouponCode(''); }} className="text-[8px] font-black text-gray-400 hover:text-red-500 uppercase tracking-widest underline decoration-transparent hover:decoration-red-200 underline-offset-4 transition-all">Remove</button>
                  </div>
                )}
              </div>

              <h3 className="text-sm font-serif font-black text-brand-dark uppercase tracking-widest mb-4 pb-2 border-b border-gray-50">Order Summary</h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-[#5C2E3E]/60">
                  <span>Bag Subtotal</span>
                  <span>₹{bagSubtotal}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-green-600">
                    <span>Promo Applied</span>
                    <span>- ₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-[#5C2E3E]/60">
                  <span>Shipping</span>
                  <span className={bagShipping === 0 ? 'text-green-600 font-bold' : ''}>{bagShipping === 0 ? 'FREE' : `₹${bagShipping}`}</span>
                </div>
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-[#5C2E3E]/60">
                  <span>Tax (Included)</span>
                  <span>₹{bagTax}</span>
                </div>
                <div className="h-[1px] bg-gray-50 my-2" />
                <div className="flex justify-between text-base font-serif font-black text-brand-dark">
                  <span>Total Amount</span>
                  <span className="text-brand-pink">₹{finalTotal}</span>
                </div>
              </div>

              <div className="bg-brand-pink/5 rounded-xl p-3 mb-6 flex gap-3">
                <FiInfo className="text-brand-pink shrink-0" size={14} />
                <p className="text-[9px] text-[#5C2E3E]/70 font-bold leading-relaxed uppercase">
                  Shipping is complimentary for orders above ₹500. Quality checks ensured.
                </p>
              </div>

              <button
                onClick={() => navigate('/checkout', { state: { couponApplied: appliedCoupon?.code } })}
                className="w-full bg-brand-dark text-white py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl hover:bg-brand-pink shadow-brand-pink/20 transition-all group"
              >
                Go to Checkout <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="mt-6 flex flex-col items-center gap-2">
                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Secure Payments via SSL</p>
                <div className="flex gap-2">
                  <div className="w-6 h-4 bg-gray-100 rounded-sm" />
                  <div className="w-6 h-4 bg-gray-100 rounded-sm" />
                  <div className="w-6 h-4 bg-gray-100 rounded-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bag;
