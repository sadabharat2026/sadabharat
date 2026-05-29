import React, { useState } from 'react';
import { FiHeart, FiCheck, FiShoppingBag, FiStar } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useShop } from '../../context/ShopContext';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product, offerBannerText }) => {
  const { addToCart, toggleWishlist, isInWishlist, isAuthenticated, triggerFlyToCart, triggerFlyToWishlist } = useShop();
  const [isAdded, setIsAdded] = useState(false);
  const liked = isInWishlist(product._id);
  const navigate = useNavigate();

  const handleAdd = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (triggerFlyToCart && product.image) {
      triggerFlyToCart(e, product.image);
    }

    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
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
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate(`/product/${product._id}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      onClick={handleCardClick}
      className="bg-white border border-gray-200 rounded-lg flex flex-col h-full group relative cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      {/* Dynamic Offer Banner (Reference: Bluestone design) */}
      {offerBannerText && (
        <div className="bg-[#FEFAF6] text-[#054425] text-[10px] font-black uppercase tracking-widest py-1.5 px-3 w-full border-b border-gray-100 flex items-center justify-center shadow-sm">
          {offerBannerText}
        </div>
      )}

      {/* Product Image Panel */}
      <div className="relative aspect-square overflow-hidden p-2 bg-white flex items-center justify-center">
        
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

        {/* Product Packshot */}
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Product Details Panel */}
      <div className="px-3 pb-2 pt-1 text-left flex flex-col flex-1 relative bg-white">
        
        {/* Product Title */}
        <h3 
          className="text-xs md:text-sm text-[#054425] font-bold line-clamp-1 leading-snug mb-0.5"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          {product.name}
        </h3>

        {/* Pack Size (e.g. 200 ml) */}
        <p className="text-[10px] text-gray-400 font-semibold mb-0.5">
          {product.packSize || '100 ml'}
        </p>

        {/* Rating Stars & Count (e.g. 4.8 (320)) */}
        <div className="flex items-center gap-1 mb-1">
          <div className="flex items-center text-[#D4AF37]">
            <FiStar className="w-3 h-3 fill-current" />
          </div>
          <span className="text-[10px] text-gray-500 font-bold tracking-tight">
            {product.rating || 4.7} <span className="text-gray-400 font-medium">({product.reviews || 120})</span>
          </span>
        </div>

        {/* Pricing Layout */}
        <div className="flex items-center gap-1.5 font-['Poppins']">
          <span className="text-[#054425] font-bold text-sm md:text-base leading-none">
            ₹{product.price}
          </span>
          {product.oldPrice && (
            <span className="text-gray-400 text-[10px] md:text-xs line-through font-medium leading-none">
              ₹{product.oldPrice}
            </span>
          )}
        </div>
      </div>

      {/* Forest Green Add to Cart Button */}
      <div className="px-3 pb-3 mt-2">
        <motion.button
          type="button"
          onClick={handleAdd}
          whileTap={{ scale: 0.95 }}
          animate={isAdded ? { scale: [1, 1.05, 1], backgroundColor: "#D4AF37" } : { backgroundColor: "#054425" }}
          transition={{ duration: 0.3 }}
          className="w-full py-1.5 rounded-md flex items-center justify-center gap-1.5 text-xs font-medium text-white hover:opacity-90 shadow-sm"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          {isAdded ? (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-1.5">
              <FiCheck className="w-3.5 h-3.5" />
              <span>Added</span>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-1.5">
              <FiShoppingBag className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </motion.div>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
