// Sada Bharat Ayurvedic Store Header Component
import React, { useState } from 'react';
import { FiHeart, FiShoppingCart, FiUser, FiMenu, FiX, FiHome, FiPercent, FiGrid, FiBell, FiClock, FiSearch, FiChevronDown } from 'react-icons/fi';

import api from '../../utils/api';

import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import logo from '../../assets/images/WhatsApp_Image_2026-05-26_at_1.34.49_PM-removebg-preview.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount, wishlistCount, setIsCartDrawerOpen, isAuthenticated, user, categories, offers } = useShop();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isRecentsOpen, setIsRecentsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { _id: 'mock1', title: 'Flash Sale Alert!', body: 'Get flat 20% off on all wellness supplements today.', read: false, type: 'promo' },
    { _id: 'mock2', title: 'Order Dispatched', body: 'Your order #SB-1029 is on its way. Track it now.', read: true, type: 'order' },
    { _id: 'mock3', title: 'New Arrival', body: 'Experience the magic of Ayurveda with our newest glow serum.', read: true, type: 'product' },
  ]);
  const [unreadCount, setUnreadCount] = useState(1); // 1 unread mock notification
  const [recentItems, setRecentItems] = useState([
    { id: '1', name: 'Bhringraj Hair Oil', price: '₹349', time: '10 mins ago', img: '/bhringraj_hair_oil.png' },
    { id: '2', name: 'Tulsi Green Tea', price: '₹199', time: '2 hours ago', img: '/tulsi_green_tea.png' },
    { id: '3', name: 'Neem Tulsi Face Wash', price: '₹299', time: '5 hours ago', img: '/neem_tulsi_face_wash.png' },
  ]);
  const [isAnimatingCart, setIsAnimatingCart] = useState(false);
  const prevCartCountRef = React.useRef(cartCount);
  
  const [isAnimatingWishlist, setIsAnimatingWishlist] = useState(false);
  const prevWishlistCountRef = React.useRef(wishlistCount);

  React.useEffect(() => {
    if (cartCount > prevCartCountRef.current) {
      setIsAnimatingCart(true);
      const timer = setTimeout(() => setIsAnimatingCart(false), 400);
      return () => clearTimeout(timer);
    }
    prevCartCountRef.current = cartCount;
  }, [cartCount]);

  React.useEffect(() => {
    if (wishlistCount > prevWishlistCountRef.current) {
      setIsAnimatingWishlist(true);
      const timer = setTimeout(() => setIsAnimatingWishlist(false), 400);
      return () => clearTimeout(timer);
    }
    prevWishlistCountRef.current = wishlistCount;
  }, [wishlistCount]);

  // Prevent navbar from showing on admin routes
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  React.useEffect(() => {
    if (isAuthenticated) {
      const fetchNotifications = async () => {
        try {
          const res = await api.get('/notifications/me');
          if (res.data.success && res.data.data.notifications) {
            setNotifications(res.data.data.notifications);
            setUnreadCount(res.data.data.notifications.filter(n => !n.isRead).length);
          }
        } catch (err) { /* Silently handle network errors for notifications when offline */ }
      };
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, location]);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  const markAllRead = async () => {
    // Optimistically update UI first
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    // Auto-close after short delay so user sees the update
    setTimeout(() => setIsNotificationsOpen(false), 600);
    try {
      await api.patch('/notifications/mark-all-read');
    } catch (err) { 
      console.error(err);
      // No rollback needed for UX - keep as read
    }
  };

  const clearHistory = () => {
    setRecentItems([]);
    // Auto-close after short delay so user sees the empty state briefly
    setTimeout(() => setIsRecentsOpen(false), 600);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsOpen(false);
    }
  };

  const menuItems = [
    { name: 'Home', link: '/' },
    { name: 'Categories', link: '/shop', hasDropdown: true, isMegaMenu: true },
    { name: 'Shop', link: '/shop' },
    { name: 'Offers', link: '/offers', hasDropdown: true, isOffers: true },
    { name: 'Best Sellers', link: '/shop?sort=popular' },
    { name: 'Consultation', link: '/consultation' },
    { name: 'Blog', link: '/blog' },
    { name: 'About Us', link: '/about' },
    { name: 'Contact', link: '/contact' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const isHomePage = location.pathname === '/';
  const [isScrolled, setIsScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`w-full z-50 transition-all duration-500 ${
          isHomePage
            ? isScrolled
              ? 'sticky top-0 bg-[#071911]/95 backdrop-blur-xl shadow-2xl border-b border-[#D4AF37]/20'
              : 'absolute top-0 left-0 right-0 bg-gradient-to-b from-black/85 via-black/45 to-transparent backdrop-blur-[2px]'
            : 'sticky top-0 bg-[#061e14] shadow-md border-b border-[#D4AF37]/15'
        }`}
      >
        {/* ROW 1: Branding, Search & Main Icons */}
        <div 
          className={`py-2 md:py-2.5 border-b transition-colors duration-300 ${
            isHomePage && !isScrolled
              ? 'border-white/10'
              : 'border-white/10 bg-black/20'
          }`}
        >
          <div className="w-full px-3 lg:px-8 flex items-center justify-between gap-3 md:gap-6">
            
            {/* Left Column: Brand Logo */}
            <div className="flex items-center justify-start shrink-0">
              <Link to="/" className="flex items-center gap-2 md:gap-3 cursor-pointer group">
                <img
                  src={logo}
                  alt="Sada Bharat Logo"
                  className="h-8 sm:h-9 md:h-12 w-auto object-contain transition-all group-hover:scale-105 drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)]"
                />
                
                <div className="flex flex-col leading-none select-none">
                  <h1 
                    className="text-[13px] sm:text-[14px] md:text-[20px] font-black uppercase whitespace-nowrap text-white tracking-wide drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]"
                    style={{ 
                      fontFamily: "'Cormorant Garamond', serif"
                    }}
                  >
                    Sada Bharat
                  </h1>
                  
                  <div className="flex items-center gap-1 w-full justify-center mt-0.5">
                    <span className="h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-[#D4AF37] flex-1"></span>
                    <span 
                      className="text-[6px] sm:text-[6.5px] md:text-[8px] uppercase tracking-[0.25em] font-black text-[#D4AF37] drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      Ayurvedic
                    </span>
                    <span className="h-[1px] bg-gradient-to-l from-transparent via-[#D4AF37] to-[#D4AF37] flex-1"></span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Center Column: Search Bar */}
            <div className="hidden md:flex flex-1 justify-center max-w-xl mx-4 lg:mx-8">
              <form onSubmit={handleSearchSubmit} className="w-full">
                <div className="relative w-full flex shadow-lg rounded-full overflow-hidden border border-white/20 focus-within:border-[#D4AF37] transition-all bg-black/35 backdrop-blur-md">
                  <div className="relative flex-1">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-[14px]" />
                    <input
                      type="text"
                      placeholder="Search pure Ayurvedic products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent pl-10 pr-4 py-2 text-[13px] font-medium text-white placeholder:text-gray-300 outline-none font-sans"
                    />
                  </div>
                  <button
                    type="submit"
                    aria-label="Search"
                    className="px-6 bg-[#D4AF37] hover:bg-[#c59e2b] text-[#054425] font-bold flex items-center justify-center transition-colors"
                  >
                    <FiSearch size={15} />
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: User Quick Icons */}
            <div className="flex items-center gap-2.5 sm:gap-3 md:gap-6 lg:gap-8 text-white shrink-0 font-sans select-none ml-auto md:ml-0 md:pr-2 lg:pr-4">
              <div className="flex items-center gap-2.5 sm:gap-3 md:gap-5">
                
                {/* Recents */}
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => { setIsRecentsOpen(!isRecentsOpen); setIsNotificationsOpen(false); }}
                    className="flex flex-col items-center justify-center gap-1 group hover:scale-105 transition-transform"
                  >
                    <div className="relative p-1">
                      <FiClock className="text-lg md:text-xl text-white/90 group-hover:text-[#D4AF37] transition-colors drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)]" />
                    </div>
                    <span className="text-[10px] font-medium text-white/90 group-hover:text-[#D4AF37] hidden md:block drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">Recents</span>
                  </button>
                </div>

                {/* Alerts */}
                <div className="relative">
                  <button 
                    onClick={() => { setIsNotificationsOpen(!isNotificationsOpen); setIsRecentsOpen(false); }} 
                    className="flex flex-col items-center justify-center gap-1 group hover:scale-105 transition-transform"
                  >
                    <div className="relative p-1">
                      <FiBell className="text-lg md:text-xl text-white/90 group-hover:text-[#D4AF37] transition-colors drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)]" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[7px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold shadow-md">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-medium text-white/90 group-hover:text-[#D4AF37] hidden md:block drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">Alerts</span>
                  </button>
                </div>
              </div>
  
              {/* Wishlist */}
              <Link to="/wishlist" className="flex flex-col items-center justify-center gap-1 group hover:scale-105 transition-transform">
                <motion.div 
                  id="global-wishlist-icon"
                  className="relative p-1"
                  animate={isAnimatingWishlist ? { scale: [1, 1.3, 1], y: [0, -4, 0] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <FiHeart className={`text-lg md:text-xl transition-colors ${
                    isAnimatingWishlist
                      ? 'text-red-500 fill-current'
                      : 'text-white/90 group-hover:text-[#D4AF37] drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)]'
                  }`} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[7px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold shadow-md">
                      {wishlistCount}
                    </span>
                  )}
                </motion.div>
                <span className="text-[10px] font-medium text-white/90 group-hover:text-[#D4AF37] hidden md:block drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">Wishlist</span>
              </Link>
  
              {/* Cart */}
              <motion.div
                id="global-cart-icon"
                onClick={() => setIsCartDrawerOpen(true)}
                className="flex flex-col items-center justify-center gap-1 cursor-pointer group hover:scale-105 transition-transform"
                animate={isAnimatingCart ? { scale: [1, 1.3, 1], y: [0, -4, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                <div className="relative p-1">
                  <FiShoppingCart className={`text-lg md:text-xl transition-colors ${
                    isAnimatingCart
                      ? 'text-[#D4AF37]'
                      : 'text-white/90 group-hover:text-[#D4AF37] drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)]'
                  }`} />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[7px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold shadow-md">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium text-white/90 group-hover:text-[#D4AF37] hidden md:block drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">Cart</span>
              </motion.div>
  
              {/* Account / User Icon */}
              <Link 
                to={isAuthenticated ? "/profile" : "/login"} 
                className="hidden md:flex flex-col items-center justify-center gap-1 group hover:scale-105 transition-transform"
              >
                <div className="p-1 flex items-center justify-center">
                  {isAuthenticated ? (
                    <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-[#D4AF37] text-[#054425] flex items-center justify-center text-[10px] font-black uppercase shadow-md">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  ) : (
                    <FiUser className="text-lg md:text-xl text-white/90 group-hover:text-[#D4AF37] transition-colors drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)]" />
                  )}
                </div>
                <span className="text-[10px] font-medium text-white/90 group-hover:text-[#D4AF37] hidden md:block drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">Account</span>
              </Link>
  
              {/* Mobile Sidebar toggle */}
              <button className="lg:hidden text-2xl p-1 text-white" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <FiX /> : <FiMenu />}
              </button>
            </div>
          </div>
        </div>

        {/* ROW 2: Navigation Links Bar */}
        <div className="hidden lg:block py-2 bg-gradient-to-r from-transparent via-black/40 to-transparent border-t border-b border-white/10 backdrop-blur-md">
          <div className="container mx-auto px-4 flex justify-center items-center">
            <div className="flex items-center gap-7 lg:gap-9">
              {menuItems.map((item) => (
                <div key={item.name} className="relative group py-0.5">
                  <Link
                    to={item.link}
                    className="flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-wider text-white/90 hover:text-[#D4AF37] transition-all relative py-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {item.hasIcon && <FiHome className="text-sm" />}
                    <span>{item.name}</span>
                    {item.hasDropdown && <FiChevronDown className="text-xs group-hover:rotate-180 transition-transform text-[#D4AF37]" />}
                    
                    {/* Active Indicator Underline */}
                    {isActive(item.link) && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#D4AF37] rounded-full shadow-[0_0_8px_#D4AF37]"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>

                  {/* Dropdowns */}
                  {item.hasDropdown && (
                    <div className={
                      item.isMegaMenu
                        ? "absolute top-full -left-20 mt-0 w-[700px] bg-white shadow-[0_20px_40px_rgba(0,0,0,0.08)] rounded-b-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 overflow-hidden border border-gray-100 p-8 flex gap-8 cursor-default"
                        : `absolute top-full left-0 mt-0 ${item.isOffers ? 'w-64' : 'w-48'} bg-white shadow-xl rounded-b-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 overflow-hidden border border-gray-100`
                    }>
                      {item.isMegaMenu ? (
                        <div className="w-full grid grid-cols-4 gap-8">
                          {/* Dynamic Categories */}
                          <div className="col-span-3">
                            <h4 className="text-[11px] font-black uppercase text-[#054425] tracking-widest border-b border-[#054425]/10 pb-2 mb-4">All Categories</h4>
                            {categories && categories.length > 0 ? (
                              <div className="columns-1 md:columns-2 lg:columns-3 gap-8">
                                {categories.map((cat, idx) => (
                                  <div key={idx} className="break-inside-avoid mb-3">
                                    <Link to={`/shop?category=${encodeURIComponent(cat.name)}`} className="text-[13px] text-gray-600 hover:text-[#054425] hover:font-bold transition-all block" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                      {cat.name}
                                    </Link>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500 py-4">Loading categories...</div>
                            )}
                          </div>
                          {/* Column 4: Promotional Block */}
                          <div className="flex flex-col rounded-xl overflow-hidden group/promo relative bg-[#F4F8F5]">
                            <img src="/skin_care_offer.png" alt="Ayurvedic Wellness" className="w-full h-32 object-cover opacity-90 group-hover/promo:scale-105 transition-transform duration-500" />
                            <div className="p-4 flex flex-col items-center text-center">
                              <h4 className="text-[14px] font-serif font-bold text-[#054425] mb-1">Authentic Care</h4>
                              <p className="text-[10px] text-gray-500 mb-3">Discover the ancient secrets of beauty & wellness.</p>
                              <Link to="/shop" className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] hover:text-[#054425] transition-colors">
                                View Collection →
                              </Link>
                            </div>
                          </div>
                        </div>
                      ) : item.isOffers ? (
                        <>
                          {offers && offers.length > 0 ? offers.map((offer, idx) => (
                            <Link
                              key={idx}
                              to={`/offers?category=${encodeURIComponent(offer.category)}`}
                              className="block px-4 py-3 text-[12px] text-gray-700 hover:text-[#054425] hover:bg-[#F4F8F5] transition-colors border-b border-gray-50 last:border-0 font-medium tracking-wide"
                              style={{ fontFamily: "'Poppins', sans-serif" }}
                            >
                              {offer.title}
                            </Link>
                          )) : (
                            <div className="px-4 py-3 text-[12px] text-gray-400">No active offers</div>
                          )}
                        </>
                      ) : (
                        categories && categories.length > 0 && categories.map((cat, idx) => (
                          <Link
                            key={idx}
                            to={`/shop?category=${encodeURIComponent(cat.name)}`}
                            className="block px-4 py-3 text-[12px] text-gray-700 hover:text-[#054425] hover:bg-[#F4F8F5] transition-colors border-b border-gray-50 last:border-0 font-medium tracking-wide uppercase"
                            style={{ fontFamily: "'Poppins', sans-serif" }}
                          >
                            {cat.name}
                          </Link>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Fullscreen Drawer (Rendered outside motion.nav for perfect full-viewport overlay) */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 bg-black/65 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Slide-out Sidebar Content */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="absolute top-0 right-0 bottom-0 w-[82%] max-w-sm bg-white shadow-2xl p-5 sm:p-6 overflow-y-auto overscroll-contain text-gray-800 flex flex-col justify-between"
              data-lenis-prevent="true"
            >
              <div>
                {/* Header with Close */}
                <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-5">
                  <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2">
                    <img src={logo} alt="Sada Bharat" className="h-9 w-auto object-contain" />
                    <span className="text-base font-black font-serif text-[#054425] uppercase tracking-wide">Sada Bharat</span>
                  </Link>
                  <button
                    className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 outline-none transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <FiX size={20} />
                  </button>
                </div>

                {/* Mobile Search input */}
                <form onSubmit={handleSearchSubmit} className="mb-5 flex relative">
                  <input
                    type="text"
                    placeholder="Search Ayurvedic products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#F4F8F5] border border-gray-200 rounded-xl pl-4 pr-10 py-2.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#054425]"
                  />
                  <button type="submit" className="absolute right-0 top-0 bottom-0 px-3 text-[#054425]">
                    <FiSearch size={16} />
                  </button>
                </form>

                {/* Navigation Links */}
                <div className="flex flex-col gap-1">
                  <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1 px-1">Navigation</div>
                  {menuItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.link}
                      className={`flex items-center justify-between py-2.5 px-3 rounded-lg uppercase tracking-wider text-xs font-semibold transition-colors ${
                        isActive(item.link) 
                          ? 'text-[#054425] bg-green-50/70 font-bold border-l-2 border-[#054425]' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <span>{item.name}</span>
                      {item.hasDropdown && <FiChevronDown className="text-xs text-gray-400 -rotate-90" />}
                    </Link>
                  ))}

                  {isAuthenticated && (
                    <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col gap-1">
                      <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1 px-1">My Account</div>
                      {[
                        { name: 'My Profile', link: '/profile' },
                        { name: 'My Orders', link: '/orders' },
                        { name: 'Wishlist', link: '/wishlist' },
                        { name: 'My Reviews', link: '/reviews' },
                        { name: 'Coupons', link: '/coupons' },
                        { name: 'Settings', link: '/settings' }
                      ].map((item) => (
                        <Link
                          key={item.name}
                          to={item.link}
                          className={`block py-2 px-3 rounded-lg uppercase tracking-wider text-xs font-semibold transition-colors ${
                            isActive(item.link) ? 'text-[#054425] bg-green-50 font-bold' : 'text-gray-700 hover:bg-gray-50'
                          }`}
                          onClick={() => setIsOpen(false)}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer Bottom Info */}
              <div className="pt-6 border-t border-gray-100 mt-6 text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-sans font-bold">🌿 100% Pure Ayurveda</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation Bar (Independent fixed at bottom) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-safe">
        <div className="flex justify-around items-center h-14 px-2">
          <Link 
            to="/" 
            onClick={() => {
              if (location.pathname === '/') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className={`flex flex-col items-center justify-center w-[54px] h-[44px] rounded-lg transition-all duration-300 ${location.pathname === '/' ? 'text-[#054425] border-2 border-[#054425] shadow-sm bg-green-50/30 font-bold' : 'text-gray-400 hover:text-gray-600 border-2 border-transparent'}`}
          >
            <FiHome className="text-[18px] mb-0.5" strokeWidth={location.pathname === '/' ? 2.5 : 2} />
            <span className="text-[8px] font-bold uppercase tracking-wider" style={{ fontFamily: "'Poppins', sans-serif" }}>Home</span>
          </Link>
          
          <Link 
            to="/shop" 
            className={`flex flex-col items-center justify-center w-[54px] h-[44px] rounded-lg transition-all duration-300 ${location.pathname === '/shop' ? 'text-[#054425] border-2 border-[#054425] shadow-sm bg-green-50/30 font-bold' : 'text-gray-400 hover:text-gray-600 border-2 border-transparent'}`}
          >
            <FiGrid className="text-[18px] mb-0.5" strokeWidth={location.pathname === '/shop' ? 2.5 : 2} />
            <span className="text-[8px] font-bold uppercase tracking-wider" style={{ fontFamily: "'Poppins', sans-serif" }}>Shop</span>
          </Link>
          
          <Link 
            to="/offers" 
            className={`flex flex-col items-center justify-center w-[54px] h-[44px] rounded-lg transition-all duration-300 ${location.pathname === '/offers' ? 'text-[#054425] border-2 border-[#054425] shadow-sm bg-green-50/30 font-bold' : 'text-gray-400 hover:text-gray-600 border-2 border-transparent'}`}
          >
            <FiPercent className="text-[18px] mb-0.5" strokeWidth={location.pathname === '/offers' ? 2.5 : 2} />
            <span className="text-[8px] font-bold uppercase tracking-wider" style={{ fontFamily: "'Poppins', sans-serif" }}>Offers</span>
          </Link>
          
          <Link 
            to={isAuthenticated ? "/profile" : "/login"} 
            className={`flex flex-col items-center justify-center w-[54px] h-[44px] rounded-lg transition-all duration-300 ${location.pathname === '/profile' || location.pathname === '/login' ? 'text-[#054425] border-2 border-[#054425] shadow-sm bg-green-50/30 font-bold' : 'text-gray-400 hover:text-gray-600 border-2 border-transparent'}`}
          >
            <FiUser className="text-[18px] mb-0.5" strokeWidth={location.pathname === '/profile' || location.pathname === '/login' ? 2.5 : 2} />
            <span className="text-[8px] font-bold uppercase tracking-wider" style={{ fontFamily: "'Poppins', sans-serif" }}>Account</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;
