import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FiHeart, FiStar, FiX, FiMinus, FiPlus } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useShop } from '../../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import { getProductVariants, getCartQty, getCartQtyForProduct } from '../../utils/cart';
import { getProductImages, toWebpUrl } from '../../utils/productImages';

const imageSlideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? 80 : -80,
    opacity: 0
  })
};

const ProductCard = ({ product, offerBannerText, badge }) => {
  const { cart, addToCart, removeFromCart, updateQuantity, toggleWishlist, isInWishlist, triggerFlyToCart, triggerFlyToWishlist } = useShop();
  const [showVariants, setShowVariants] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [direction, setDirection] = useState(1);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [inView, setInView] = useState(true);
  const cardRef = useRef(null);
  const liked = isInWishlist(product._id);
  const navigate = useNavigate();

  const cardImages = useMemo(() => getProductImages(product), [product]);
  const currentImage = cardImages[activeImg] || cardImages[0] || product.image;
  const canCarousel = cardImages.length > 1;
  const reduceMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    setActiveImg(0);
    setImgLoaded(false);
  }, [product._id]);

  useEffect(() => {
    const el = cardRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!canCarousel || isHovering || !inView || reduceMotion) return undefined;
    const last = String(product._id || '0').slice(-1);
    const stagger = (last.charCodeAt(0) % 5) * 180;
    const timer = setTimeout(() => {
      setDirection(1);
      setActiveImg((prev) => (prev + 1) % cardImages.length);
    }, 2500 + stagger);
    return () => clearTimeout(timer);
  }, [activeImg, canCarousel, isHovering, inView, reduceMotion, cardImages.length, product._id]);

  const handleImageReady = () => setImgLoaded(true);
  const firstImgRef = useRef(null);

  useEffect(() => {
    const el = firstImgRef.current;
    if (el && el.complete && el.naturalWidth > 0) setImgLoaded(true);
  }, [product._id, cardImages]);

  const variants = getProductVariants(product);
  const defaultSize = variants[0]?.size || product.packSize || null;
  const hasMultipleVariants = variants.length > 1;
  const cartItems = cart.filter(item => String(item._id) === String(product._id));
  const totalQty = getCartQtyForProduct(cart, product._id);

  const handleAddClick = (e) => {
    e.stopPropagation();
    if (hasMultipleVariants) {
      setShowVariants(true);
    } else {
      if (triggerFlyToCart && product.image) triggerFlyToCart(e, product.image);
      addToCart({ ...product, selectedSize: defaultSize, packSize: defaultSize || product.packSize });
    }
  };

  const handleDecrease = (e) => {
    e.stopPropagation();
    if (hasMultipleVariants) {
      setShowVariants(true);
    } else {
      const item = cartItems[0];
      if (!item) return;
      if (item.quantity <= 1) {
        removeFromCart(item._id, item.selectedSize);
      } else {
        updateQuantity(item._id, item.selectedSize, -1);
      }
    }
  };

  const handleIncrease = (e) => {
    e.stopPropagation();
    if (hasMultipleVariants) {
      setShowVariants(true);
    } else {
      const item = cartItems[0];
      if (!item) return;
      updateQuantity(item._id, item.selectedSize, 1);
    }
  };

  const handleAddVariant = (e, variant) => {
    e.stopPropagation();
    if (triggerFlyToCart && product.image) triggerFlyToCart(e, product.image);
    addToCart({ ...product, price: variant.price, oldPrice: variant.oldPrice, packSize: variant.size, selectedSize: variant.size });
    setShowVariants(false);
  };

  const handleWishlist = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!liked && triggerFlyToWishlist && product.image) {
      triggerFlyToWishlist(e, product.image);
    }

    toggleWishlist(product);
  };

  const handleCardClick = () => {
    navigate(`/product/${product._id}`);
  };

  return (
    <motion.div
      ref={cardRef}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="bg-[#EBF5EE] border border-[#054425]/10 rounded-lg flex flex-col h-full group relative cursor-pointer hover:shadow-lg transition-shadow duration-300 overflow-hidden"
    >
      {/* Corner Ribbon Badge — Top Left */}
      {badge === 'new' && (
        <div className="absolute top-0 left-0 z-20 overflow-hidden w-[80px] h-[80px] pointer-events-none">
          <div
            className="absolute top-[18px] left-[-22px] w-[90px] text-center py-[5px] bg-gradient-to-r from-[#054425] to-[#0a6338] text-white text-[8px] font-black uppercase tracking-wide shadow-lg"
            style={{ transform: 'rotate(-45deg)', fontFamily: "'Poppins', sans-serif" }}
          >
            ★ New
          </div>
        </div>
      )}
      {badge === 'limited' && (
        <div className="absolute top-0 left-0 z-20 overflow-hidden w-[80px] h-[80px] pointer-events-none">
          <div
            className="absolute top-[18px] left-[-22px] w-[90px] text-center py-[5px] bg-gradient-to-r from-[#C0392B] to-[#e74c3c] text-white text-[8px] font-black uppercase tracking-wide shadow-lg"
            style={{ transform: 'rotate(-45deg)', fontFamily: "'Poppins', sans-serif" }}
          >
            🕐 Limited
          </div>
        </div>
      )}

      {/* Product Image Panel */}
      <div className="relative aspect-square overflow-hidden bg-white min-w-0">
        
        {/* Special Offer Starburst Badge */}
        {offerBannerText && (
          <div 
            className="absolute top-2 left-2 z-20 w-[48px] h-[48px] md:w-[54px] md:h-[54px] bg-gradient-to-br from-[#E5C158] to-[#D4AF37] flex items-center justify-center text-[#054425] font-black text-[8px] md:text-[9px] leading-[1.1] text-center uppercase transform -rotate-12 shadow-lg drop-shadow-md"
            style={{
              clipPath: 'polygon(50% 0%, 61% 15%, 79% 9%, 83% 27%, 100% 32%, 93% 48%, 100% 68%, 83% 73%, 79% 91%, 61% 85%, 50% 100%, 39% 85%, 21% 91%, 17% 73%, 0% 68%, 7% 48%, 0% 32%, 17% 27%, 21% 9%, 39% 15%)'
            }}
          >
            <span className="pt-0.5">Special<br/>Offer</span>
          </div>
        )}

        {/* Wishlist Heart Icon (Top-Right) */}
        <motion.button
          type="button"
          onClick={handleWishlist}
          whileTap={{ scale: 0.8 }}
          animate={liked ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.3 }}
          className={`absolute top-3 right-3 z-30 transition-colors p-1.5 rounded-full bg-white shadow-md ${
            liked ? 'text-red-500' : 'text-gray-300 hover:text-red-500'
          }`}
        >
          <FiHeart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
        </motion.button>

        {!imgLoaded && (
          <div className="absolute inset-2 rounded-md product-card-shimmer-load z-[5]" />
        )}

        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentImage || activeImg}
            custom={direction}
            variants={imageSlideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ x: { type: 'spring', stiffness: 280, damping: 32 }, opacity: { duration: 0.28 } }}
            className="absolute inset-0 flex items-center justify-center p-2"
          >
            <img
              src={currentImage}
              alt={product.name}
              loading={activeImg === 0 ? 'eager' : 'lazy'}
              decoding="async"
              ref={firstImgRef}
              onLoad={handleImageReady}
              onError={handleImageReady}
              className="max-h-full max-w-full object-contain relative z-[1]"
            />
          </motion.div>
        </AnimatePresence>

        <div className={`product-card-shimmer ${(!imgLoaded || isHovering || reduceMotion) ? 'is-paused' : ''}`} />

        {canCarousel && (
          <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1">
            {cardImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Show image ${idx + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setDirection(idx > activeImg ? 1 : -1);
                  setActiveImg(idx);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === activeImg ? 'w-3 bg-[#054425]' : 'w-1.5 bg-black/25 hover:bg-black/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Details Panel */}
      <div className="px-2 md:px-3 pb-3 pt-2 text-left flex flex-col flex-1 relative bg-transparent">
        
        {/* Product Title */}
        <h3 
          className="text-[11px] md:text-sm text-[#054425] font-bold line-clamp-2 leading-snug mb-1"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          {product.name}
        </h3>

        {/* Variant & Rating Parallel Layout */}
        <div className="flex items-center justify-between mb-2">
          <p className="text-[9px] md:text-[10px] text-gray-400 font-semibold mb-0">
            {product.packSize || '100 ml'}
          </p>
          <div className="flex items-center gap-0.5 bg-white px-1.5 py-0.5 rounded-sm shadow-sm border border-gray-100">
            <FiStar className="w-2.5 h-2.5 text-[#D4AF37] fill-current" />
            <span className="text-[9px] text-gray-600 font-bold tracking-tight">
              {product.rating || 4.7} <span className="text-gray-400 font-medium">({product.reviews || 120})</span>
            </span>
          </div>
        </div>

        {/* Pricing & Add Button Parallel Layout */}
        <div className="flex items-center justify-between mt-auto font-['Poppins']">
          <div className="flex flex-col">
            <span className="text-[#054425] font-bold text-xs md:text-sm leading-none">
              ₹{product.price}
            </span>
            {product.oldPrice && (
              <span className="text-gray-400 text-[9px] md:text-[10px] line-through font-medium leading-none mt-1">
                ₹{product.oldPrice}
              </span>
            )}
          </div>

          <div className="flex items-end h-[30px] md:h-[32px]">
            {totalQty === 0 ? (
              <button
                type="button"
                onClick={handleAddClick}
                className="flex flex-col items-center justify-center border border-[#054425] rounded px-4 md:px-5 h-full bg-white hover:bg-green-50 transition-colors shadow-sm"
              >
                <span className="text-[10px] md:text-[11px] font-bold text-[#054425] leading-none">ADD</span>
                {variants.length > 1 && (
                  <span className="text-[6px] md:text-[7px] font-semibold text-gray-500 leading-none mt-1">{variants.length} options</span>
                )}
              </button>
            ) : (
              <div className="flex items-center justify-between bg-[#054425] rounded px-1.5 h-full min-w-[65px] md:min-w-[72px] shadow-sm">
                <button type="button" onClick={handleDecrease} className="text-white hover:text-white/80 p-0.5">
                  <FiMinus size={12} strokeWidth={3} />
                </button>
                <span className="text-white text-[10px] md:text-xs font-bold px-1.5">{totalQty}</span>
                <button type="button" onClick={handleIncrease} className="text-white hover:text-white/80 p-0.5">
                  <FiPlus size={12} strokeWidth={3} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Variants Modal */}
      {showVariants && createPortal(
        <AnimatePresence>
          <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center pointer-events-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => { e.stopPropagation(); setShowVariants(false); }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl z-10 max-h-[85vh] overflow-y-auto"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900 pr-4">{product.name} Options</h3>
                <button onClick={() => setShowVariants(false)} className="p-1.5 bg-gray-100 rounded-full text-gray-500 hover:text-gray-900 transition-colors shrink-0">
                  <FiX size={16} />
                </button>
              </div>

              <div className="space-y-3">
                {variants.map((v, idx) => {
                  // Check qty of this specific variant in cart
                  const vQty = getCartQty(cart, product._id, v.size);

                  return (
                    <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:border-[#054425]/30 transition-colors bg-white shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-50 rounded-lg p-1 shrink-0 border border-gray-100">
                          <img src={toWebpUrl(product.image)} alt={product.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-800">{v.size}</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-sm font-bold text-[#054425]">₹{v.price}</span>
                            {v.oldPrice && <span className="text-[10px] text-gray-400 line-through font-medium">₹{v.oldPrice}</span>}
                          </div>
                        </div>
                      </div>
                      
                      <div className="shrink-0">
                        {vQty === 0 ? (
                          <button
                            type="button"
                            onClick={(e) => handleAddVariant(e, v)}
                            className="border border-[#054425] text-[#054425] text-xs font-bold px-4 py-1.5 rounded hover:bg-green-50 transition-colors"
                          >
                            ADD
                          </button>
                        ) : (
                          <div className="flex items-center justify-between bg-[#054425] rounded px-2 py-1.5 min-w-[70px]">
                            <button 
                              type="button" 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                if (vQty <= 1) {
                                  removeFromCart(product._id, v.size);
                                } else {
                                  updateQuantity(product._id, v.size, -1); 
                                }
                              }} 
                              className="text-white hover:text-white/80 p-0.5"
                            >
                              <FiMinus size={14} strokeWidth={3} />
                            </button>
                            <span className="text-white text-xs font-bold px-2">{vQty}</span>
                            <button type="button" onClick={(e) => { e.stopPropagation(); updateQuantity(product._id, v.size, 1); }} className="text-white hover:text-white/80 p-0.5">
                              <FiPlus size={14} strokeWidth={3} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  );
};

export default ProductCard;
