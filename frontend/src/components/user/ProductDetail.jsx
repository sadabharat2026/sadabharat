import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiStar, FiHeart, FiShare2, FiShoppingCart, FiZap,
  FiShield, FiTruck, FiRefreshCw, FiCheckCircle, FiChevronRight, FiTag, FiX, FiMessageSquare,
  FiActivity, FiTarget, FiFeather, FiDroplet, FiMinus, FiPlus
} from 'react-icons/fi';
import { useShop } from '../../context/ShopContext';

import api from '../../utils/api';
import ChatWindow from '../shared/ChatWindow';
import { getConversationId } from '../../services/chatService';

import ConsultationCTA from './ConsultationCTA';
import ProductCard from './ProductCard';

const CouponModal = ({ onClose, onApply }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApply = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/coupons/validate', { code: code.trim() });
      onApply(res.data.data.coupon);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid coupon code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 text-gray-400 hover:text-brand-dark transition-colors">
          <FiX size={18} />
        </button>
        <h3 className="text-xl font-serif font-black text-brand-dark mb-1">Apply Coupon</h3>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-6">Enter code for instant discount</p>

        <form onSubmit={handleApply} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. SADABHARAT10"
              className="w-full bg-gray-50 border border-gray-200 p-3 pl-10 rounded-xl text-xs font-bold outline-none focus:border-brand-pink transition-all"
            />
            <FiTag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          </div>
          {error && <p className="text-red-500 text-[9px] font-bold uppercase text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-dark text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50"
          >
            {loading ? 'Validating...' : 'Apply Coupon'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const PolicySanctuaryModal = ({ onClose, initialTab = 'Genuine' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  const policies = {
    'Genuine': {
      title: 'Purity Assurance',
      icon: <FiShield />,
      desc: 'Every treasure in our sanctuary is 100% authentic, sourced directly from heritage artisans and brand owners to ensure the highest divine quality.'
    },
    'Fast Delivery': {
      title: 'Sacred Logistics',
      icon: <FiTruck />,
      desc: 'Our delivery partners are chosen for their respect of your time. Most orders reach their destination within 3-5 business days across Bharat.'
    },
    '7 Days Return': {
      title: 'Peace of Mind',
      icon: <FiRefreshCw />,
      desc: 'If a treasure does not resonate with you, we offer a seamless 7-day return or exchange policy from the date of delivery.'
    },
    'Quality Check': {
      title: 'Divine Standard',
      icon: <FiCheckCircle />,
      desc: 'Each item undergoes a rigorous 5-point quality check before it leaves our sanctuary to ensure it reaches you in pristine condition.'
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-[4px] flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} className="bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 p-1 text-gray-400 hover:text-brand-dark transition-colors"><FiX size={18} /></button>

        <div className="flex gap-4 mb-8 overflow-x-auto no-scrollbar pb-2 border-b border-gray-100">
          {Object.keys(policies).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[8px] font-black uppercase tracking-widest whitespace-nowrap transition-all pb-2 relative ${activeTab === tab ? 'text-brand-pink' : 'text-gray-300'}`}
            >
              {tab}
              {activeTab === tab && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-pink" />}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center text-center py-4">
          <div className="w-16 h-16 bg-brand-pink/5 rounded-full flex items-center justify-center text-brand-pink mb-4 text-2xl">
            {policies[activeTab].icon}
          </div>
          <h3 className="text-xl font-serif font-black text-brand-dark mb-2">{policies[activeTab].title}</h3>
          <p className="text-xs text-gray-500 leading-relaxed max-w-[280px]">{policies[activeTab].desc}</p>
        </div>

        <button onClick={onClose} className="mt-8 w-full bg-brand-dark text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">Understood</button>
      </motion.div>
    </div>
  );
};

const SizeChartModal = ({ onClose, onSelect, currentSize }) => {
  const sizes = [
    { size: 'S', bust: '32-34', waist: '26-28' },
    { size: 'M', bust: '34-36', waist: '28-30' },
    { size: 'L', bust: '36-38', waist: '30-32' },
    { size: 'XL', bust: '38-40', waist: '32-34' },
    { size: 'XXL', bust: '40-42', waist: '34-36' }
  ];

  return (
    <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-400 hover:text-brand-dark transition-all">
          <FiX size={18} />
        </button>
        <div className="bg-brand-dark p-6 text-white text-center">
          <h3 className="text-xl font-serif font-black uppercase tracking-widest">Divine Size Guide</h3>
          <p className="text-[10px] opacity-70 uppercase tracking-widest mt-1">Heritage Fits & Measure Reference</p>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Brand Size</th>
                  <th className="py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Bust (Inches)</th>
                  <th className="py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Waist (Inches)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sizes.map((row, i) => (
                  <tr
                    key={i}
                    onClick={() => { onSelect(row.size); onClose(); }}
                    className={`cursor-pointer transition-all duration-300 ${currentSize === row.size ? 'bg-brand-pink/20' : 'hover:bg-gray-50'}`}
                  >
                    <td className="py-3.5 text-xs font-black text-brand-dark flex items-center gap-3">
                      {currentSize === row.size ? (
                        <div className="w-2 h-2 bg-brand-pink rounded-full ring-4 ring-brand-pink/20" />
                      ) : (
                        <div className="w-2 h-2 border border-gray-200 rounded-full" />
                      )}
                      {row.size}
                    </td>
                    <td className={`py-3.5 text-xs font-bold ${currentSize === row.size ? 'text-brand-dark' : 'text-gray-500'}`}>{row.bust}</td>
                    <td className={`py-3.5 text-xs font-bold ${currentSize === row.size ? 'text-brand-dark' : 'text-gray-500'}`}>{row.waist}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
              * Measurements are for reference only. Click on a row to select that size. For the perfect fit, we recommend our <span className="text-brand-pink font-bold">Bra Size Calculator</span>.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, removeFromCart, updateQuantity, cart, toggleWishlist, isInWishlist, loading, isAuthenticated, user, setIsCartDrawerOpen, triggerFlyToCart } = useShop();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const product = products.find(p => p._id === id);

  // Review States
  const [reviews, setReviews] = useState([]);
  const [canSubmitReview, setCanSubmitReview] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(true);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [selectedPolicyTab, setSelectedPolicyTab] = useState('Genuine');
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleChatClick = () => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }
    setIsChatOpen(true);
  };

  const fetchAvailableCoupons = async () => {
    try {
      const res = await api.get('/coupons/public');
      setAvailableCoupons(res.data.data.coupons.filter(c => c.isActive));
    } catch (err) {
      console.error("Failed to fetch divine offers:", err);
    }
  };

  const fetchReviews = async () => {
    try {
      setReviewLoading(true);
      const res = await api.get(`/reviews/product/${id}`);
      setReviews(res.data.data.reviews);
    } catch (err) {
      console.error("Failed to fetch product insights:", err);
    } finally {
      setReviewLoading(false);
    }
  };

  const checkEligibility = async () => {
    if (!isAuthenticated || !user) return;
    try {
      const res = await api.get(`/reviews/can-review/${id}`);
      setCanSubmitReview(res.data.data.canReview);
    } catch (err) {
      console.error("Eligibility check failed:", err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) return;

    setIsSubmittingReview(true);
    try {
      await api.post('/reviews', {
        product: id,
        review: reviewForm.comment,
        rating: reviewForm.rating
      });
      setReviewForm({ rating: 5, comment: '' });
      setCanSubmitReview(false);
      fetchReviews(); // Refresh
      alert("Your divine appreciation has been recorded.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to transmit feedback.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const [couponInput, setCouponInput] = useState('');

  const handleApplyInlineCoupon = async (codeToApply) => {
    if (!codeToApply.trim()) return;
    try {
      const res = await api.post('/coupons/validate', { code: codeToApply.trim().toUpperCase() });
      setAppliedCoupon(res.data.data.coupon);
      setCouponInput(''); // Clear input on success
    } catch (err) {
      alert(err.response?.data?.message || 'Invalid coupon code');
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedImageIndex(0); // Reset index when product changes
    // Reset coupon when changing product
    setAppliedCoupon(null);
    setCouponInput('');
    setSelectedSize(null); // Reset size when changing product

    if (id) {
      fetchReviews();
      checkEligibility();
      fetchAvailableCoupons();
    }
  }, [id, isAuthenticated, user]);

  if (loading && !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-dark"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-serif font-black text-brand-dark mb-4">Product Not Found</h2>
        <Link to="/shop" className="text-brand-pink font-bold uppercase tracking-widest text-xs">Back to Shop</Link>
      </div>
    );
  }

  const isCustomProduct = product && String(product._id).startsWith('custom-prod-');
  const variants = product ? (product.variants || (isCustomProduct ? [] : (product.name.toLowerCase().includes('milk') || product.name.toLowerCase().includes('bhringraj') ? [
    { size: '100 ml', price: product.price, oldPrice: product.oldPrice },
    { size: '200 ml', price: Math.round(product.price * 1.8), oldPrice: Math.round((product.oldPrice || product.price) * 1.8) }
  ] : (Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes.map(s => ({ size: s, price: product.price, oldPrice: product.oldPrice })) : [
    { size: '100 ml', price: product.price, oldPrice: product.oldPrice },
    { size: '200 ml', price: Math.round(product.price * 1.8), oldPrice: Math.round((product.oldPrice || product.price) * 1.8) },
    { size: '300 ml', price: Math.round(product.price * 2.5), oldPrice: Math.round((product.oldPrice || product.price) * 2.5) }
  ])))) : [];

  const parsedIngredients = product.ingredients
    ? product.ingredients.split(',').map(s => s.trim()).filter(Boolean)
    : ['Bhringraj', 'Amla', 'Coconut Oil', 'Brahmi'];

  const currentSize = selectedSize || (variants.length > 0 ? variants[0].size : null);
  const selectedVariant = variants.find(v => v.size === currentSize) || variants[0] || product;
  const basePrice = selectedVariant?.price || product?.price || 0;
  const oldPrice = selectedVariant?.oldPrice || product?.oldPrice || Math.round(basePrice * 1.3);

  const cartItems = cart ? cart.filter(item => item._id === product._id && item.selectedSize === currentSize) : [];
  const totalQtyInCart = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const calculateDiscountedPrice = () => {
    if (!appliedCoupon) return basePrice;
    if (appliedCoupon.discountType === 'percentage') {
      return Math.round(basePrice * (1 - appliedCoupon.discountValue / 100));
    }
    return Math.max(0, basePrice - appliedCoupon.discountValue);
  };

  const finalPrice = calculateDiscountedPrice();

  const handleAddToCart = (e) => {
    if (variants.length > 0 && !currentSize) {
      alert("Please select a size before adding to bag.");
      return;
    }

    if (triggerFlyToCart) {
      triggerFlyToCart(e, (product.gallery && product.gallery[selectedImageIndex]) || product.image);
    }

    addToCart({
      ...product,
      price: finalPrice,
      oldPrice: oldPrice,
      quantity: 1,
      couponApplied: appliedCoupon?.code,
      selectedSize: currentSize,
      packSize: currentSize
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (variants.length > 0 && !currentSize) {
      alert("Please select a size before proceeding.");
      return;
    }

    const directProductData = {
      ...product,
      price: finalPrice,
      oldPrice: oldPrice,
      quantity: 1,
      couponApplied: appliedCoupon?.code,
      selectedSize: currentSize,
      packSize: currentSize
    };
    setIsCartDrawerOpen(false);
    navigate('/checkout', { state: { directProduct: directProductData } });
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-10 pt-0 font-sans focus:outline-none">
      <AnimatePresence>
        {isCouponModalOpen && <CouponModal onClose={() => setIsCouponModalOpen(false)} onApply={setAppliedCoupon} />}
        {isPolicyModalOpen && <PolicySanctuaryModal onClose={() => setIsPolicyModalOpen(false)} initialTab={selectedPolicyTab} />}
        {isSizeChartOpen && <SizeChartModal onClose={() => setIsSizeChartOpen(false)} onSelect={setSelectedSize} currentSize={selectedSize} />}
      </AnimatePresence>

      <div className="w-full max-w-[1300px] ml-0 px-4 md:px-8 lg:px-8 pt-4 pb-0 flex items-center gap-2 text-[11px] md:text-xs text-[#054425] font-semibold">
        <Link to="/" className="hover:opacity-70">Home</Link>
        <FiChevronRight className="w-3 h-3 opacity-50" />
        <Link to={`/shop?category=${product.category}`} className="capitalize hover:opacity-70">{product.category}</Link>
        <FiChevronRight className="w-3 h-3 opacity-50" />
        <span className="font-bold truncate">{product.name}</span>
      </div>

      <main className="w-full max-w-[1300px] ml-0 px-4 md:px-8 lg:px-8 mt-2">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8">

          {/* Left Column container */}
          <div className="contents lg:block lg:col-span-5 relative">

            {/* Images */}
            <div className="order-1">
              <div className="w-full flex flex-col-reverse md:flex-row justify-start gap-4 md:gap-4 bg-[#FDFBF7] rounded-md p-4 md:py-4 md:pr-4 md:pl-0 relative ml-0">
                <button className="absolute top-6 right-6 p-3 bg-white rounded-full shadow-sm z-10 transition-all hover:scale-110 border border-gray-100" onClick={() => toggleWishlist(product)}>
                  <FiHeart className={`w-5 h-5 ${isInWishlist(product._id) ? 'fill-current text-red-500' : 'text-gray-800'}`} />
                </button>
                {/* Vertical Thumbnails */}
                <div className="flex md:flex-col gap-3 shrink-0 overflow-x-auto md:overflow-visible items-center justify-center z-10 w-[76px] pl-0 ml-0 md:pl-0 md:-ml-2">
                  <button className="hidden md:flex items-center justify-center p-1 text-gray-600 hover:text-black transition-colors bg-white rounded-full shadow-sm w-9 h-9 border border-gray-200" onClick={() => setSelectedImageIndex(prev => Math.max(0, prev - 1))}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                  </button>
                  <div className="flex md:flex-col gap-4">
                    {[0, 1, 2, 3].map((idx) => {
                      const img = (Array.isArray(product.gallery) && product.gallery[idx]) || (idx === 0 ? product.image : null);
                      if (!img) return null;
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`w-16 h-16 md:w-[76px] md:h-[76px] shrink-0 rounded-md overflow-hidden transition-all border-2 bg-white shadow-sm ${selectedImageIndex === idx ? 'border-[#054425]' : 'border-gray-100 hover:border-gray-300'}`}
                        >
                          <img src={img} alt={`${product.name} ${idx}`} className="w-full h-full object-cover" />
                        </button>
                      );
                    })}
                  </div>
                  <button className="hidden md:flex items-center justify-center p-1 text-gray-600 hover:text-black transition-colors bg-white rounded-full shadow-sm w-9 h-9 border border-gray-200" onClick={() => setSelectedImageIndex(prev => Math.min(3, prev + 1))}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                </div>

                {/* Main Image */}
                <div className="relative flex-1 aspect-square md:aspect-auto md:min-h-[340px] rounded-md overflow-hidden flex items-center justify-center md:ml-6 lg:ml-8">
                  <motion.img
                    key={selectedImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    src={(Array.isArray(product.gallery) && product.gallery[selectedImageIndex]) || product.image}
                    alt={product.name}
                    className="max-w-full max-h-full object-contain drop-shadow-2xl scale-95 hover:scale-100 transition-transform duration-700"
                  />
                </div>
              </div>
            </div>

            {/* Product Details & Ingredients Box */}
            <div className="order-3 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-gray-100 rounded-md bg-white shadow-sm overflow-hidden">
                <div className="p-5 border-b md:border-b-0 md:border-r border-gray-100">
                  <h3 className="text-[13px] font-bold text-gray-900 mb-3">About this product</h3>
                  <p className="text-[11px] text-gray-600 mb-4 leading-relaxed">
                    {product.description || `Sada Bharat ${product.name} is a blend of pure ingredients & herbs that nourishes the body.`}
                  </p>
                  <ul className="space-y-2.5">
                    {(Array.isArray(product.about) && product.about.length > 0 ? product.about : [
                      "Enriched with Bhringraj & Amla",
                      "Reduces Hair Fall & Dandruff",
                      "Strengthens Roots",
                      "Suitable for All Hair Types"
                    ]).slice(0, 4).map((point, idx) => (
                      <li key={idx} className="flex items-center gap-2.5">
                        <svg className="w-4 h-4 text-[#054425] shrink-0" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-[11px] text-gray-700 font-bold">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-[13px] font-bold text-gray-900 mb-4">Key Ingredients</h3>
                    <div className="space-y-3">
                      {parsedIngredients.map((ing, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#F9F7F3] flex items-center justify-center text-sm shadow-inner overflow-hidden border border-gray-50">
                            <img src="https://cdn-icons-png.flaticon.com/512/1892/1892695.png" alt={ing} className="w-5 h-5 object-contain" style={{ filter: 'hue-rotate(60deg) brightness(0.8)' }} />
                          </div>
                          <span className="text-[11px] font-semibold text-gray-700">{ing}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button className="text-[10px] font-bold text-[#054425] hover:underline self-start mt-4">View full ingredients</button>
                </div>
              </div>

              {(product.dosage || product.disclaimer) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-gray-100 rounded-md bg-white shadow-sm overflow-hidden mt-2">
                  {product.dosage && (
                    <div className="p-5 border-b md:border-b-0 md:border-r border-gray-100 bg-[#FAF9F5]">
                      <h3 className="text-[13px] font-bold text-[#054425] mb-2.5 flex items-center gap-1.5 font-serif uppercase tracking-wider">
                        Dosage & Guidelines
                      </h3>
                      <p className="text-[11px] text-gray-700 leading-relaxed font-sans font-medium">
                        {product.dosage}
                      </p>
                    </div>
                  )}
                  {product.disclaimer && (
                    <div className="p-5 bg-red-50/30">
                      <h3 className="text-[13px] font-bold text-red-800 mb-2.5 flex items-center gap-1.5 font-serif uppercase tracking-wider">
                        Disclaimer Guidelines
                      </h3>
                      <p className="text-[11px] text-red-900/90 leading-relaxed font-sans font-medium">
                        {product.disclaimer}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Features */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border border-gray-100 rounded-md p-5 bg-white shadow-sm mt-2">
                {[
                  { icon: <svg className="w-[22px] h-[22px] text-[#054425]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>, label: 'Natural & Safe Ingredients' },
                  { icon: <svg className="w-[22px] h-[22px] text-[#054425]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>, label: 'No Mineral Oil' },
                  { icon: <svg className="w-[22px] h-[22px] text-[#054425]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>, label: 'Paraben Free' },
                  { icon: <svg className="w-[22px] h-[22px] text-[#054425]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>, label: 'Cruelty Free' }
                ].map((f, i) => (
                  <div key={i} className="flex items-center justify-center gap-3">
                    {f.icon}
                    <span className="text-[11px] text-gray-700 font-bold leading-tight">{f.label}</span>
                  </div>
                ))}
              </div>

              {/* Consultation CTA */}
              <div className="mt-2">
                <ConsultationCTA onChatClick={handleChatClick} />
              </div>
            </div>
          </div>

          {/* Right Column Container */}
          <div className="contents lg:block lg:col-span-7">

            {/* Top part of right column (Title, Price, Cart) */}
            <div className="order-2 space-y-2 lg:pl-0 lg:pt-2">
              <div>
                <h1 className="text-2xl md:text-[24px] font-serif font-bold text-[#054425] mb-1 leading-tight tracking-tight">{product.name}</h1>
                <p className="text-[12px] text-gray-600 mb-2 font-medium">{product.subtitle || 'Nourishes roots & promotes healthy growth'}</p>
                <div className="flex items-center gap-3 text-[11px] mb-3">
                  <div className="flex items-center text-[#F59E0B]">
                    <FiStar className="fill-current w-3.5 h-3.5" />
                    <span className="ml-1.5 font-bold text-gray-900 text-[12px]">{product.rating || '4.8'}</span>
                  </div>
                  <span className="text-gray-500 font-medium">(230 Reviews)</span>
                  <span className="bg-[#E6F4EA] text-[#054425] px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 ml-1">
                    <FiCheckCircle size={9} /> Bestseller
                  </span>
                  {product.prescriptionRequired && (
                    <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 border border-red-200 ml-1">
                      ⚠️ Prescription Required
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-3 mb-0">
                  <span className="text-2xl font-medium font-sans text-gray-900 tracking-tight">₹{finalPrice.toFixed(2)}</span>
                  {appliedCoupon ? (
                    <span className="text-[14px] text-gray-400 line-through font-medium">₹{basePrice.toFixed(2)}</span>
                  ) : (
                    <span className="text-[14px] text-gray-400 line-through font-medium">₹{oldPrice.toFixed(2)}</span>
                  )}
                  {appliedCoupon && appliedCoupon.discountType === 'percentage' ? (
                    <span className="text-[13px] font-bold text-[#054425]">{appliedCoupon.discountValue}% OFF</span>
                  ) : (
                    <span className="text-[13px] font-bold text-[#054425]">
                      {Math.round(((oldPrice - basePrice) / oldPrice) * 100)}% OFF
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-500 font-medium">Inclusive of all taxes</p>
              </div>

              {/* Benefit Icons Row */}
              <div className="grid grid-cols-4 gap-2 mt-2 mb-3">
                {[
                  {
                    icon: <FiTarget className="w-4 h-4 text-[#054425]" />,
                    label: 'Strengthens\nHair Roots'
                  },
                  {
                    icon: <FiActivity className="w-4 h-4 text-[#054425]" />,
                    label: 'Reduces\nHair Fall'
                  },
                  {
                    icon: <FiDroplet className="w-4 h-4 text-[#054425]" />,
                    label: 'Promotes\nHair Growth'
                  },
                  {
                    icon: <FiFeather className="w-4 h-4 text-[#054425]" />,
                    label: 'Natural\nIngredients'
                  }
                ].map((benefit, i) => (
                  <div key={i} className="flex flex-col items-center justify-start text-center gap-1.5">
                    <div className="w-[40px] h-[40px] rounded-full border border-transparent flex items-center justify-center bg-[#EAF0EC] hover:bg-[#054425] hover:text-white transition-all cursor-default shadow-sm group">
                      <div className="group-hover:brightness-0 group-hover:invert transition-all">{benefit.icon}</div>
                    </div>
                    <span className="text-[10px] text-gray-600 font-medium leading-tight whitespace-pre-line">{benefit.label}</span>
                  </div>
                ))}
              </div>

              {/* Size Selector */}
              {variants.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h3 className="text-[13px] font-sans font-bold text-gray-900">Select Unit</h3>
                  <div className="flex flex-wrap gap-3">
                    {variants.map((v, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedSize(v.size)}
                        className={`flex flex-col items-center justify-center min-w-[80px] p-2 rounded-lg border transition-all relative overflow-hidden ${currentSize === v.size
                          ? 'border-[#054425] shadow-sm ring-1 ring-[#054425] bg-green-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                      >
                        {currentSize === v.size && (
                          <div className="absolute top-0 right-0 bg-[#054425] w-4 h-4 rounded-bl-lg flex items-center justify-center text-white">
                            <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 fill-none stroke-white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M10 3L4.5 8.5 2 6" />
                            </svg>
                          </div>
                        )}
                        <span className="text-[11px] text-gray-600 font-bold mb-0.5">{v.size}</span>
                        <span className="text-[12px] font-black text-gray-900">₹{v.price}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Variant Detail & Add to Cart */}
              <div className="pt-6 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-gray-600">{currentSize || '100 ml'}</span>
                    <span className="text-xl font-black text-gray-900 tracking-tight mt-1">₹{finalPrice.toFixed(2)}</span>
                    <span className="text-[10px] text-gray-500 font-medium mt-0.5">(Inclusive of all taxes)</span>
                  </div>

                  <div className="flex items-center">
                    {totalQtyInCart === 0 ? (
                      <button
                        onClick={handleAddToCart}
                        className="h-[38px] px-8 flex items-center justify-center bg-[#054425] text-white rounded-md text-[13px] font-bold hover:bg-[#04331c] transition-colors tracking-wide shadow-sm"
                      >
                        Add to cart
                      </button>
                    ) : (
                      <div className="flex items-center justify-between bg-[#054425] rounded-md px-2 h-[38px] w-[100px] shadow-sm">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (totalQtyInCart <= 1) {
                              removeFromCart(product._id, currentSize);
                            } else {
                              updateQuantity(product._id, currentSize, -1);
                            }
                          }}
                          className="text-white hover:text-white/80 p-1"
                        >
                          <FiMinus size={15} strokeWidth={3} />
                        </button>
                        <span className="text-white text-[13px] font-bold px-2">{totalQtyInCart}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); updateQuantity(product._id, currentSize, 1); }}
                          className="text-white hover:text-white/80 p-1"
                        >
                          <FiPlus size={15} strokeWidth={3} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Buy Now Button */}
                {totalQtyInCart === 0 && (
                  <button
                    onClick={handleBuyNow}
                    className="w-full mt-4 h-[40px] flex items-center justify-center border border-[#054425] text-[#054425] rounded-md text-[13px] font-bold hover:bg-[#EAF0EC] transition-colors tracking-wide"
                  >
                    Buy Now
                  </button>
                )}

                {/* Chat Button */}
                <button
                  onClick={handleChatClick}
                  className="w-full mt-2 h-[40px] flex items-center justify-center gap-2 border border-gray-300 text-gray-600 rounded-md text-[13px] font-bold hover:bg-gray-50 transition-colors tracking-wide"
                >
                  <FiMessageCircle size={15} /> {product.vendor ? 'Ask Vendor a Question' : 'Chat with Support'}
                </button>
              </div>

              {/* Chat Modal */}
              <AnimatePresence>
                {isChatOpen && user && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-0 sm:p-4"
                    onClick={() => setIsChatOpen(false)}
                  >
                    <motion.div
                      initial={{ y: 60, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 60, opacity: 0 }}
                      className="w-full sm:max-w-md h-[85dvh] sm:h-[560px] flex flex-col min-h-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ChatWindow
                        conversationId={product.vendor ? getConversationId.userVendor(user._id, typeof product.vendor === 'string' ? product.vendor : product.vendor._id) : getConversationId.userAdmin(user._id)}
                        metadata={product.vendor ? {
                          type: 'user-vendor',
                          userId: user._id,
                          userName: user.name || user.fullName || 'User',
                          vendorId: typeof product.vendor === 'string' ? product.vendor : product.vendor._id,
                          vendorName: product.vendor?.storeName || product.vendor?.fullName || 'Vendor',
                          productId: product._id,
                        } : {
                          type: 'user-admin',
                          userId: user._id,
                          userName: user.name || user.fullName || 'User',
                          productId: product._id,
                        }}
                        currentUser={{ id: user._id, name: user.name || user.fullName || 'User', role: 'user' }}
                        recipientName={product.vendor ? (product.vendor?.storeName || product.vendor?.fullName || 'Vendor') : 'Sada Bharat Support'}
                        onClose={() => setIsChatOpen(false)}
                        className="h-full flex-1 border-0 sm:rounded-2xl rounded-t-2xl shadow-none"
                      />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Delivery Features */}
              <div className={`grid ${product.codAvailable ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-3'} gap-2 sm:gap-4 border border-gray-100 rounded-xl p-3 sm:p-5 bg-white shadow-sm mt-6`}>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1.5 sm:gap-3 text-center sm:text-left">
                  <div className="w-8 h-8 rounded-md bg-gray-50 flex items-center justify-center text-gray-600 shrink-0">
                    <FiTruck size={14} />
                  </div>
                  <div className="mt-0 sm:mt-1">
                    <p className="text-[9px] sm:text-[10px] font-bold text-gray-900 leading-tight">Free Delivery</p>
                    <p className="text-[8px] sm:text-[9px] text-gray-500 mt-0.5">On orders ₹499+</p>
                  </div>
                </div>

                {product.noRefund ? (
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1.5 sm:gap-3 text-center sm:text-left">
                    <div className="w-8 h-8 rounded-md bg-red-50 text-red-500 border border-red-100 flex items-center justify-center shrink-0">
                      <FiRefreshCw size={14} className="rotate-45" />
                    </div>
                    <div className="mt-0 sm:mt-1">
                      <p className="text-[9px] sm:text-[10px] font-bold text-red-600 leading-tight">Non-Refundable</p>
                      <p className="text-[8px] sm:text-[9px] text-gray-500 mt-0.5">Hygiene Guidelines</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1.5 sm:gap-3 text-center sm:text-left">
                    <div className="w-8 h-8 rounded-md bg-gray-50 flex items-center justify-center text-gray-600 shrink-0">
                      <FiRefreshCw size={14} />
                    </div>
                    <div className="mt-0 sm:mt-1">
                      <p className="text-[9px] sm:text-[10px] font-bold text-gray-900 leading-tight">7 Days Return</p>
                      <p className="text-[8px] sm:text-[9px] text-gray-500 mt-0.5">Easy Returns</p>
                    </div>
                  </div>
                )}

                {product.codAvailable && (
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1.5 sm:gap-3 text-center sm:text-left">
                    <div className="w-8 h-8 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <div className="mt-0 sm:mt-1">
                      <p className="text-[9px] sm:text-[10px] font-bold text-emerald-700 leading-tight">COD Available</p>
                      <p className="text-[8px] sm:text-[9px] text-gray-500 mt-0.5">Pay on Delivery</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1.5 sm:gap-3 text-center sm:text-left">
                  <div className="w-8 h-8 rounded-md bg-gray-50 flex items-center justify-center text-gray-600 shrink-0">
                    <FiShield size={14} />
                  </div>
                  <div className="mt-0 sm:mt-1">
                    <p className="text-[9px] sm:text-[10px] font-bold text-gray-900 leading-tight">100% Secure</p>
                    <p className="text-[8px] sm:text-[9px] text-gray-500 mt-0.5">Payments</p>
                  </div>
                </div>
              </div>

              {/* Price Breakdown Card */}
              <div className="mt-6 border border-[#054425]/10 rounded-xl p-4 bg-[#FDFBF7] shadow-sm">
                <h3 className="text-[11px] font-bold text-[#054425] mb-3 uppercase tracking-widest flex items-center gap-1.5">
                  <FiTag className="w-3.5 h-3.5" /> Price Breakdown
                </h3>
                <div className="space-y-2 text-[11px] text-gray-600 font-medium">
                  <div className="flex justify-between items-center">
                    <span>M.R.P. <span className="text-[9px] text-gray-400 font-normal">(Incl. of all taxes)</span></span>
                    <span className="text-gray-900 font-bold">₹{appliedCoupon ? basePrice.toFixed(2) : oldPrice.toFixed(2)}</span>
                  </div>
                  {!appliedCoupon && (
                    <div className="flex justify-between items-center text-[#054425]">
                      <span>Product Discount ({Math.round(((oldPrice - basePrice) / oldPrice) * 100)}%)</span>
                      <span>- ₹{(oldPrice - basePrice).toFixed(2)}</span>
                    </div>
                  )}
                  {appliedCoupon && (
                    <div className="flex justify-between items-center text-[#054425]">
                      <span>Coupon Discount ({appliedCoupon.code})</span>
                      <span>- ₹{(basePrice - finalPrice).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-gray-400 pt-2 border-t border-gray-200">
                    <span>Shipping Charges</span>
                    <span className="text-[#054425] font-bold">FREE</span>
                  </div>
                  <div className="flex justify-between items-center pt-2.5 border-t border-[#054425]/20 font-black text-[13px] text-[#054425]">
                    <span>Total Amount Payable</span>
                    <span>₹{finalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Feedback Section */}
            <div className="order-4 mt-10 border-t border-gray-100 pt-8 pb-4">
              <h3 className="text-lg font-serif font-black text-brand-dark uppercase tracking-widest mb-2">Verified Insights</h3>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <FiStar key={i} className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'fill-brand-gold text-brand-gold' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    <span className="text-base font-black text-brand-dark">{Number(product.rating).toFixed(1)} / 5.0</span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium">Global Ratings & Testimony</p>
                </div>

                {canSubmitReview && (
                  <div className="flex items-center">
                    <button className="text-[10px] font-bold uppercase text-brand-gold hover:text-brand-dark transition-colors tracking-widest border border-brand-gold rounded-full px-4 py-2 hover:bg-brand-gold/10">
                      Write a Review
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {reviewLoading ? (
                  <div className="animate-pulse space-y-4">
                    {[1, 2].map(i => <div key={i} className="h-16 bg-gray-50 rounded-xl" />)}
                  </div>
                ) : reviews.length > 0 ? (
                  reviews.map((r, i) => (
                    <div key={r._id} className="border-b border-gray-50 pb-6 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-brand-light/50 rounded-full flex items-center justify-center text-brand-dark font-black text-[9px] uppercase shadow-inner">
                            {r.user?.name?.charAt(0) || 'A'}
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-brand-dark uppercase tracking-widest">{r.user?.name || 'Verified Beauty'}</p>
                            <div className="flex items-center gap-0.5 text-brand-gold">
                              {[...Array(5)].map((_, idx) => (
                                <FiStar key={idx} size={7} className={idx < r.rating ? 'fill-current' : 'text-gray-200'} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-[8px] font-bold text-gray-300 uppercase tracking-tighter">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 leading-relaxed font-serif italic">"{r.review}"</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">No testimony yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Similar Products */}
        <div className="w-full pb-16">
          <h2 className="text-xl md:text-2xl font-serif font-black text-[#054425] mb-6">Similar to your searched</h2>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
            {products.filter(p => p._id !== product._id).slice(0, 5).map(p => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;